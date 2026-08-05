// src/config/rabbitConfig.ts
import amqp from 'amqplib';

// Estado encapsulado usando 'any' para blindar as propriedades contra conflitos de tipos globais
const estadoRabbit = {
    channel: null as any,
    connection: null as any
};

export async function connectRabbit(): Promise<void> {
    try {
        // Armazena as instâncias diretamente dentro do objeto de estado isolado
        estadoRabbit.connection = await amqp.connect("amqp://localhost");
        estadoRabbit.channel = await estadoRabbit.connection.createChannel();

        console.log('RabbitMQ conectado com sucesso.');
    } catch (error: any) {
        console.error('Erro ao conectar no servidor RabbitMQ:', error.message);
        throw error;
    }
}

export function enviarMensagem(fila: string, mensagem: any): void {
    // Validação de existência do canal
    if (!estadoRabbit.channel) {
        throw new Error('Não foi possível enviar a mensagem: O canal do RabbitMQ não está inicializado.');
    }

    // Garante que a fila exista antes de despachar a mensagem
    estadoRabbit.channel.assertQueue(fila, { durable: true });

    estadoRabbit.channel.sendToQueue(
        fila,
        Buffer.from(JSON.stringify(mensagem)),
        {
            persistent: true 
        }
    );
    console.log(`[RabbitMQ] Mensagem despachada com sucesso para a fila: ${fila}`);
}

export function getChannel(): any {
    return estadoRabbit.channel;
}
