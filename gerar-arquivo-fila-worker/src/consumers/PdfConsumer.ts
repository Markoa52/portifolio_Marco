import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import arquivoPdfQueue from '../queues/PdfQueue.js';
import { geraArquivoPdf } from '../services/gerarPdfServices.js';

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(arquivoPdfQueue.nome);

        await channel.assertQueue(arquivoPdfQueue.nome, { durable: true }); 

        console.log(`Aguardando mensagens na fila ${arquivoPdfQueue.nome}`);

        channel.prefetch(1);

        channel.consume(arquivoPdfQueue.nome, async (msg: amqp.Message | null) => {
            if (!msg) return;

            try {
                const dados = JSON.parse(msg.content.toString());
                console.log('Mensagem recebida:', dados);

                //Chama o serviço que irá mostar o arquivo PDF
                await geraArquivoPdf(dados);

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


