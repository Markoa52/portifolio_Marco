import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import pdfQueue from '../queues/geraPdfQueue.js';
import { geraArquivoPdf } from '../services/geraPdfService.js';

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${pdfQueue.nome}.dlx`;
const DLQ_QUEUE_NAME = `${pdfQueue.nome}.dlq`;
const DLQ_ROUTING_KEY = `${pdfQueue.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(pdfQueue.nome);

        // ==========================================
        // STEP 1: CONFIGURAÇÃO DA DEAD LETTER (DLX / DLQ)
        // ==========================================
        // Cria a Exchange de Falha
        await channel.assertExchange(DLX_EXCHANGE_NAME, 'topic', { durable: true });
        
        // Cria a Fila de Falha (Onde as mensagens que derem erro vão morar)
        await channel.assertQueue(DLQ_QUEUE_NAME, { durable: true });
        
        // Vincula a Fila de Falha à Exchange de Falha através de uma Routing Key
        await channel.bindQueue(DLQ_QUEUE_NAME, DLX_EXCHANGE_NAME, DLQ_ROUTING_KEY);

        // ==========================================
        // STEP 2: VINCULAR A FILA PRINCIPAL À DLX
        // ==========================================
        // Garante a existência da fila correta incluindo os argumentos que apontam para a DLX criada acima
        await channel.assertQueue(pdfQueue.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            pdfQueue.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.processa_pdf'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${pdfQueue.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);


        channel.prefetch(1);

     channel.consume(pdfQueue.nome, async (msg: amqp.Message | null) => {
    if (!msg) return;

    try {
        const conteudoBruto = msg.content.toString();
        console.log('[Worker PDF] Conteúdo bruto recebido da fila:', conteudoBruto);

        let dados: any;

        // TRATAMENTO ANTIMALFORMAÇÃO: Protege contra dupla serialização ou strings quebradas
        if (conteudoBruto.startsWith('"') && conteudoBruto.endsWith('"')) {
            const stringLimpa = JSON.parse(conteudoBruto);
            dados = typeof stringLimpa === 'string' ? JSON.parse(stringLimpa) : stringLimpa;
        } else {
            dados = JSON.parse(conteudoBruto);
        }

        // Recupera o payload legítimo envelopado pelo publisherEvent
        const payload = dados.payload || dados;
        console.log('[Worker PDF] Payload decodificado com sucesso:', payload);

        // Validação de segurança do array 'js'
        if (!payload.js || !Array.isArray(payload.js) || payload.js.length === 0) {
            throw new Error("O array 'js' veio vazio ou inválido no payload.");
        }

        // Captura a primeira linha para validar se a estrutura do Excel veio com a coluna certa
        const primeiraLinha = payload.js[0];
        if (!primeiraLinha || !primeiraLinha.bill_id) {
            throw new Error("A propriedade 'bill_id' não foi encontrada na primeira linha do array 'js'.");
        }

        // CORREÇÃO: Passamos o payload validado para o serviço gerar o arquivo
        await geraArquivoPdf(payload);
        
        // Confirmação de sucesso para o RabbitMQ remover a mensagem da fila
        channel.ack(msg);

    } catch (erro: any) {
        console.error('Erro ao processar mensagem no Worker de PDF:', erro.message);
        // O nack direciona a mensagem com erro de código direto para a sua DLQ
        channel.nack(msg, false, false); 
    }
}, { noAck: false });


    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumerPDF:', error.message);
    }
}
