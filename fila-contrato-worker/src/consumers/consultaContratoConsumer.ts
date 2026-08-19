import amqp from 'amqplib';
// E no seu código substitua (msg: Message | null) por (msg: amqp.Message | null)
// Lembre-se da extensão .js obrigatória para imports locais no microsserviço
import { connectRabbit } from '../config/rabbitConfig.js';
import consultarContratoQueue from '../queues/consultaContratoQueue.js'
import { consultarContratoServices } from '../services/consultarContratoServices.js';
import { ContratoRepository } from '../repositories/contratoRepository.js';

// DEFINIÇÃO DOS NOMES DA DLX (Padrão de mercado baseado na sua fila atual)
const DLX_EXCHANGE_NAME = `${consultarContratoQueue.nome}.dlx`;
const DLQ_QUEUE_NAME = `${consultarContratoQueue.nome}.dlq`;
const DLQ_ROUTING_KEY = `${consultarContratoQueue.nome}.failed`;

export async function iniciarConsumer(): Promise<void> {
    try {
        // CORREÇÃO: Passa o nome da fila como argumento e coleta o canal retornado diretamente
        const channel = await connectRabbit(consultarContratoQueue.nome);

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
        await channel.assertQueue(consultarContratoQueue.nome, { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': DLX_EXCHANGE_NAME,
                'x-dead-letter-routing-key': DLQ_ROUTING_KEY
            }
        }); 

        // >>> ADICIONE ESTA LINHA LOGO ABAIXO <<<
        // Ela vincula a sua fila principal à rota que o seu Agendador vai disparar às 2h da manhã
        await channel.bindQueue(
            consultarContratoQueue.nome, 
            'reports.exchange',                // Mesma Exchange usada no Agendador
            'reports.v1.trigger.consulta_contrato'  // Mesma Routing Key usada no Agendador
        );

        console.log(`Aguardando mensagens na fila: ${consultarContratoQueue.nome}`);
        console.log(`Proteção Dead Letter ativa. Falhas irão para: ${DLQ_QUEUE_NAME}`);


        channel.prefetch(1);

     channel.consume(consultarContratoQueue.nome, async (msg: amqp.Message | null) => {
    if (!msg) return;

    try {
  const conteudoBruto = msg.content.toString();
  console.log('[Worker consultar contrato] Conteúdo bruto recebido da fila:', conteudoBruto);

  // 1. CORREÇÃO ESSENCIAL: Converte o texto da fila em um objeto JSON real!
  const dados = JSON.parse(conteudoBruto);

  // 2. CORREÇÃO: Recupera o payload legítimo envelopado de forma segura contra undefined
  const payload = dados.payload || dados;
  console.log('[Worker consultar contrato] Payload decodificado com sucesso:', payload);

  // 3. CAPTURA DO ID: Como vimos que o front-end envia o ID dentro da propriedade 'js',
  // nós buscamos payload.js.id (ou payload.id caso venha direto)
  const contractId = payload.js?.id || payload.id;

  if (!contractId) {
    throw new Error("ID do contrato não foi localizado dentro do payload da mensagem.");
  }

  console.log(`[Worker] Inicializando consulta para o Contrato ID: ${contractId}`);

  // 4. CORREÇÃO DO SERVIÇO: Instancia o repositório e o serviço, e EXECUTA o método .consultar()
  const repo = new ContratoRepository(); 
  const servico = new consultarContratoServices(repo);
  
  // Executa o método assíncrono real que busca no SQL Server e calcula as metas
  const contratoFinalizado = await servico.consultar(contractId);
  
  console.log('[Worker] Contrato processado com sucesso pelo banco:', JSON.stringify(contratoFinalizado));

  // Confirmação de sucesso para o RabbitMQ remover a mensagem da fila
  channel.ack(msg);

} catch (erro: any) {
  // Tratamento de erro robusto para capturar falhas de JSON.parse ou banco de dados
  console.error('Erro ao processar mensagem no Worker de consultar contrato:', erro.message || erro);
  
  // O nack direciona a mensagem com erro de código direto para a sua DLQ sem travar a fila
  channel.nack(msg, false, false); 
}

});

    } catch (error: any) {
        console.error('Falha crítica ao iniciar o consumerAtualziarContrato:', error.message);
    }
}
