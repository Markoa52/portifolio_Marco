// src/config/rabbitConfig.ts (No Microsserviço)
import amqp, { Channel } from 'amqplib';

// CORREÇÃO: Função tipada para retornar uma Promise contendo o Channel legítimo do amqplib
export async function connectRabbit(queue: string): Promise<Channel> {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost:5672?heartbeat=0');
        const channel = await connection.createChannel();

        // O worker é responsável por criar e garantir a persistência da fila
        await channel.assertQueue(queue, { durable: true });

        console.log(`RabbitMQ conectado. Fila "${queue}" pronta para consumo.`);

        // Retorna o canal criado para que o arquivo de consumer possa utilizá-lo diretamente
        return channel;
    } catch (error: any) {
        console.error(`Erro ao conectar no RabbitMQ para a fila ${queue}:`, error.message);
        throw error;
    }
}
