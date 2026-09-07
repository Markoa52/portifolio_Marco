import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import usuarioQueue from '../queues/usuarioQueue.js';
import { UsuarioService } from '../services/usuarioService.js';

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${usuarioQueue.nome}.dlx`;
const DLQ_QUEUE_NAME = `${usuarioQueue.nome}.dlq`;
const DLQ_ROUTING_KEY = `${usuarioQueue.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(usuarioQueue.nome);

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
        await channel.assertQueue(usuarioQueue.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            usuarioQueue.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.criar-usuario'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${usuarioQueue.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);


        channel.prefetch(1);

     channel.consume(usuarioQueue.nome, async (msg: amqp.Message | null) => {
    if (!msg) return;

    try {
        const conteudoBruto = msg.content.toString();
        console.log('[Worker veiculo] Conteúdo bruto recebido da fila:', conteudoBruto);

        let dados: any;

        // TRATAMENTO ANTIMALFORMAÇÃO: Protege contra dupla serialização ou strings quebradas
        if (conteudoBruto.startsWith('"') && conteudoBruto.endsWith('"')) {
            const stringLimpa = JSON.parse(conteudoBruto);
            dados = typeof stringLimpa === 'string' ? JSON.parse(stringLimpa) : stringLimpa;
        } else {
            dados = JSON.parse(conteudoBruto);
        }

        // Recupera o payload legítimo envelopado pelo publisherEvent
        const payload = dados.payload || dados;
        console.log('[Worker veiculo] Payload decodificado com sucesso:', payload);

        // CORREÇÃO: Valida se 'js' existe e se é um objeto válido, checando suas chaves internas
        if (!payload.js || typeof payload.js !== 'object' || Array.isArray(payload.js)) {
            throw new Error("O campo 'js' deve ser um objeto válido e não pode vir vazio.");
        }
        
        // Opcional: Validar se as chaves cruciais estão lá dentro para não dar undefined depois
        if (!payload.js.metadata || !payload.js.contextoUsuario) {
            throw new Error("O objeto 'js' está incompleto: faltando 'metadata' ou 'contextoVeiculo'.");
        }

        const payloadDecodificado = JSON.parse(msg.content.toString());

        // CORREÇÃO: Passamos o payload validado para o serviço gerar o arquivo
        await UsuarioService.processarCadastroRelacional(payloadDecodificado);
        
        // Confirmação de sucesso para o RabbitMQ remover a mensagem da fila
        channel.ack(msg);

       } catch (erro: any) {
           console.error('Erro ao processar mensagem no Worker de PDF:', erro.message);
           // O nack direciona a mensagem com erro de código direto para a sua DLQ
           channel.nack(msg, false, false); 
       }
       }, { noAck: false });


       } catch (error: any) {
           console.error('Falha crítica ao iniciar o consumerVeiculo:', error.message);
       }
    }
