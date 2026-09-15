import amqp from 'amqplib';

export class TransacaoService {
  private urlRabbitMQ = process.env.RABBITMQ_URL || 'amqp://localhost';
  private nomeFila = 'gravar-transacao';

  async enfileirarTransacao(dados: any): Promise<void> {
    let conexao;
    try {
      // 1. Conecta ao RabbitMQ
      conexao = await amqp.connect(this.urlRabbitMQ);
      const canal = await conexao.createChannel();

      // 2. Garante que a fila de escrita existe
      await canal.assertQueue(this.nomeFila, { durable: true });

      // 3. Monta o desenho da mensagem/payload
      const mensagemPayload = {
        task: 'gravar_transacao_viagem',
        enviadoEm: new Date().toISOString(),
        dados: dados // Contém os 10 campos que vieram da requisição externa
      };

      // 4. Envia o buffer para a fila com a opção de persistência (persistent: true)
      canal.sendToQueue(
        this.nomeFila,
        Buffer.from(JSON.stringify(mensagemPayload)),
        { persistent: true }
      );

      console.log(`[RabbitMQ] 🚀 Mensagem enviada para a fila '${this.nomeFila}' - ID Transação: ${dados.id}`);
      
      // 5. Fecha o canal e a conexão
      await canal.close();
      await conexao.close();

    } catch (error: any) {
      console.error('❌ Erro ao publicar mensagem no RabbitMQ:', error.message);
      if (conexao) await conexao.close();
      throw new Error(`Falha no serviço de mensageria: ${error.message}`);
    }
  }
}
