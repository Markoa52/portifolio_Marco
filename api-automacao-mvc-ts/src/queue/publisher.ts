import {connetRabbitMQ} from '../config/rabbitConfig';
import {jobPayload} from '../types/Ipublusher';

export class RabbitMqPublisher {

    async publishEvent(exchange:string, routingKey: string, payload: jobPayload):Promise<void> {
    try{
        const channel = await connetRabbitMQ();

        await channel.assertExchange(exchange, 'topic', {durable: true});

        const messageBuffer = Buffer.from(JSON.stringify({
            payload,
            triggeredAt: new Date().toDateString()
        }));

        channel.publish(exchange, routingKey, messageBuffer, {persistent: true});
        
        console.log(`[Scheduler] Evento enviado para o Exchange: ${exchange} -> RoutingKey: ${routingKey}`);
    }catch(error){
        console.error('[Sheduler] Falha ao publicar evento:', error)
    }
}
}
