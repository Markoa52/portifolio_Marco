import { connectRabbit } from '../config/rabbitConfig.js';
import arquivoExcelQueue from '../queues/excelQueue.js';
import { geraArquivoExcel } from '../services/gerarExcelServices.js';

export async function iniciarConsumer(): Promise<void> {
    try {
        // Coleta o canal retornado diretamente
        const channel = await connectRabbit(arquivoExcelQueue.nome);

        // Garante a existência da fila correta baseada na configuração
        await channel.assertQueue(arquivoExcelQueue.nome, { durable: true }); 

        console.log(`Aguardando mensagens na fila: ${arquivoExcelQueue.nome}`);

        channel.prefetch(1);

        // CORREÇÃO: Substituído 'processa-arquivoExcel' por arquivoExcelQueue.nome
        channel.consume(arquivoExcelQueue.nome, async (msg) => {
            if (!msg) return;

            console.log(`[Excel Worker] Nova mensagem detectada na fila ${arquivoExcelQueue.nome}!`);

            try {
                const dados = JSON.parse(msg.content.toString());
                
                // Executa a lógica que gera a planilha Excel
                await geraArquivoExcel(dados);

                channel.ack(msg); // Sucesso: remove da fila em definitivo
            } catch (erro: any) {
                console.error('Erro ao processar mensagem do Excel:', erro.message);
                
                // Impede loops infinitos descartando payloads que geram erros de código
                channel.nack(msg, false, false); 
            }
        }, { noAck: false }); // Garante que o ack/nack manual seja respeitado

    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumerExcel:', error.message);
    }
}
