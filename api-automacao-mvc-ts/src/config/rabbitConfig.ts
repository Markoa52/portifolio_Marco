import amqp, {Channel} from 'amqplib';

let channel: Channel | null = null;

export async function connetRabbitMQ(): Promise<Channel>{
    if (channel) return channel;

    try{
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        console.log('Conectando ao RabbitMQ com sucesso');
        return channel;
    }catch(error){
        console.error('Erro ao conectar no RabbitMQ', error)
        throw error;
    }
}