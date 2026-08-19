import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import atualizaContratoQueue from '../queues/atualizaContratoQueue.js';
import { atualizaContratoServices } from '../services/atualizaContratoServices.js';

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${atualizaContratoQueue.nome}.dlx`;
const DLQ_QUEUE_NAME = `${atualizaContratoQueue.nome}.dlq`;
const DLQ_ROUTING_KEY = `${atualizaContratoQueue.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(atualizaContratoQueue.nome);

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
        await channel.assertQueue(atualizaContratoQueue.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            atualizaContratoQueue.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.atualiza_contrato'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${atualizaContratoQueue.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);


        channel.prefetch(1);

     channel.consume(atualizaContratoQueue.nome, async (msg: amqp.Message | null) => {
    if (!msg) return;

    try {
        const conteudoBruto = msg.content.toString();
        console.log('[Worker Atualiza contrato] Conteúdo bruto recebido da fila:', conteudoBruto);

        let dados: any;

        // Recupera o payload legítimo envelopado pelo publisherEvent
        const payload = dados.payload || dados;
        console.log('[Worker Atualiza contrato] Payload decodificado com sucesso:', payload);


        // CORREÇÃO: Passamos o payload validado para o serviço gerar o arquivo
        await new atualizaContratoServices(payload);
        
        // Confirmação de sucesso para o RabbitMQ remover a mensagem da fila
        channel.ack(msg);

    } catch (erro: any) {
        console.error('Erro ao processar mensagem no Worker de atualizar contrato:', erro.message);
        // O nack direciona a mensagem com erro de código direto para a sua DLQ
        channel.nack(msg, false, false); 
    }
}, { noAck: false });


    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumerAtualziarContrato:', error.message);
    }
}
