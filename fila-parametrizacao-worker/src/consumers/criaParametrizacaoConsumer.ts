import { connectRabbit } from '../config/rabbitConfig.js';
import criaParametrizacao from '../queues/criaParametrizacaoQueue.js';

import { criaParametrizacaoServices } from '../services/criaParametrizacaoServices.js'; 

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${criaParametrizacao.nome}.dlx`;
const DLQ_QUEUE_NAME = `${criaParametrizacao.nome}.dlq`;
const DLQ_ROUTING_KEY = `${criaParametrizacao.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // Coleta o canal retornado diretamente
        const channel = await connectRabbit(criaParametrizacao.nome);

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
        await channel.assertQueue(criaParametrizacao.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            criaParametrizacao.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.cria-parametrizacao'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${criaParametrizacao.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);

        channel.prefetch(1);

        channel.consume(criaParametrizacao.nome, async (msg) => {
            if (!msg) return;

            console.log(`[Excel Worker] Nova mensagem detectada na fila ${criaParametrizacao.nome}!`);

            try {
                const payload = JSON.parse(msg.content.toString());
                
                // Executa a lógica que gera a planilha Excel
                await criaParametrizacaoServices.processarCadastroRelacional(payload);

                channel.ack(msg); // Sucesso: remove da fila em definitivo
            } catch (erro: any) {
                console.error('Erro ao processar mensagem do criar contrato:', erro.message);
                
                // O nack com requeue=false direciona a mensagem automaticamente para a DLQ criada no STEP 1
                channel.nack(msg, false, false); 
            }
        }, { noAck: false }); // Garante que o ack/nack manual seja respeitado

    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumercriaContrato:', error.message);
    }
}

