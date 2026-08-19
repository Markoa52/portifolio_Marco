import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import DwPdfQueue from '../queues/downloadPdfQueue.js';
import { geraArquivoPdfDw } from '../services/downloadPdfServices.js';

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${DwPdfQueue.nome}.dlx`;
const DLQ_QUEUE_NAME = `${DwPdfQueue.nome}.dlq`;
const DLQ_ROUTING_KEY = `${DwPdfQueue.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(DwPdfQueue.nome);

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
        await channel.assertQueue(DwPdfQueue.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            DwPdfQueue.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.download_pdf'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${DwPdfQueue.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);


        channel.prefetch(1);

        channel.consume(DwPdfQueue.nome, async (msg: amqp.Message | null) => {
            if (!msg) return;

            try {
                const dados = JSON.parse(msg.content.toString());
                console.log('Mensagem recebida:', dados);

                //Chama o serviço que irá mostar o arquivo PDF
                await geraArquivoPdfDw(dados);

                channel.ack(msg);
            } catch (erro: any) {
               console.error('Erro ao processar mensagem:', erro.message);
               channel.nack(msg, false, false);
             }
        }, { noAck: false });

    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumerPDF:', error.message);
    }
}
