import amqp, { Channel } from 'amqplib';

// Deixamos o parâmetro como opcional apenas para logs
export async function connectRabbit(queue?: string): Promise<Channel> {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672?heartbeat=0');
        const channel = await connection.createChannel();

        // >>> REMOVIDO: O assertQueue simples foi tirado daqui <<<
        // Agora não há mais risco de criar a fila sem os argumentos da DLQ!

        if (queue) {
            console.log(`Canal do RabbitMQ aberto para o fluxo da fila: "${queue}"`);
        }

        return channel;
    } catch (error: any) {
        console.error(`Erro ao conectar no RabbitMQ:`, error.message);
        throw error;
    }
}
