import { RabbitMqPublisher } from '../queue/publisher';

const MAPA_DE_ACOES: Record<string, { tipoArquivo: "inserir" | "consultar"; routingKey: string }> = {
  inserir:   { tipoArquivo: 'inserir',   routingKey: 'reports.v1.trigger.cria-parametrizacao'},
  consultar: { tipoArquivo: 'consultar', routingKey: 'reports.v1.trigger.consulta_contrato' },

};

export class ParametrizacaoService {
  // 2. INJETA O REPOSITÓRIO DO SQL SERVER NO CONSTRUTOR JUNTO COM O RABBIT
  constructor(private rabbitPublisher: RabbitMqPublisher,) {}

  async parametrizacaoAacoes(dadosDoPedido: any) {
    const { protocoloId, acao, dadosLimpos } = dadosDoPedido;

    const dados = dadosLimpos;

    console.log(`[API] Parametrização! Sincronizando filas...`);

    // 3. Recupera a estratégia com base na ação enviada ou usa o 'consultar' como padrão
    const estrategiaAtual = MAPA_DE_ACOES[acao] ?? {
      tipoArquivo: 'consultar',
      routingKey: 'reports.v1.trigger.consulta_contrato'
    };

    // 4. Monta o payload injetando os dados legítimos que vieram das tabelas do banco
    const payload = {
      protocoloId,
      task: 'generate_daily_report',
      tipoArquivo: estrategiaAtual.tipoArquivo,
      solicitadoEm: new Date().toISOString(),
      tipo: dadosDoPedido.tipo,
      js: dados // Agora a fila e o Worker vão receber os dados reais do banco!
    };

    const EXCHANGE = 'reports.exchange';
    const ROUTING_KEY = estrategiaAtual.routingKey;

    console.log(`[Agendador] Montando payload para o protocolo: ${protocoloId} | Fila: ${ROUTING_KEY}`);

    // 5. Envia para o RabbitMQ em segundo plano
    await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payload);

    // C) RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
    // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
    return { 
      sucesso: true, 
      protocoloId, 
      ...dados // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
    };
  }
}
