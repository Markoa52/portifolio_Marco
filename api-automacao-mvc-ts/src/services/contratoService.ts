import { RabbitMqPublisher } from '../queue/publisher';
import { ContratoRepository } from '../repositories/contratoRepository'; // 👈 1. IMPORTA O SEU REPOSITÓRIO DO BANCO

const MAPA_DE_ACOES: Record<string, { tipoArquivo: "inserir" | "consultar" | "atualizar" | "excluir"; routingKey: string }> = {
  inserir:   { tipoArquivo: 'inserir',   routingKey: 'reports.v1.trigger.criar-contrato' },
  consultar: { tipoArquivo: 'consultar', routingKey: 'reports.v1.trigger.consulta_contrato' },
  atualizar: { tipoArquivo: 'atualizar', routingKey: 'reports.v1.trigger.atualiza_contrato' },
  excluir:   { tipoArquivo: 'excluir',   routingKey: 'reports.v1.trigger.exclui_contrato' }
};

export class ContratoService {
  // 👈 2. INJETA O REPOSITÓRIO DO SQL SERVER NO CONSTRUTOR JUNTO COM O RABBIT
  constructor(
    private rabbitPublisher: RabbitMqPublisher,
    private contratoRepository: ContratoRepository 
  ) {}

    // Adicione este método dentro da classe ContratoService no seu arquivo contratoService.ts:
async obterContratos(): Promise<any> {
  // Faz o select puro no SQL Server usando o repositório que já injetamos lá no construtor
  const contrato = await this.contratoRepository.findAll();
  return contrato;
}

  // Adicione este método dentro da classe ContratoService no seu arquivo contratoService.ts:
async obterDadosDiretosDoBanco(contractId: number): Promise<any> {
  // Faz o select puro no SQL Server usando o repositório que já injetamos lá no construtor
  const contrato = await this.contratoRepository.findById(contractId);
  return contrato;
}

  async contratoPesquisa(dadosDoPedido: any) {
    const { protocoloId, acao, dadosLimpos } = dadosDoPedido;

    // A) EXTRAI O ID DO CONTRATO ENVIADO PELO INPUT DA PESQUISA
    const contractId = parseInt(String(dadosLimpos?.id || dadosDoPedido?.id || ''));

    if (isNaN(contractId)) {
      throw new Error("ID do contrato inválido ou não fornecido.");
    }

    console.log(`[API] 1. Consultando SQL Server para verificar o Contrato ID: ${contractId}`);
    
    // B) 🔥 EFETUA A CONSULTA REAL NO SEU SQL SERVER
    const contratoLocalizado = await this.contratoRepository.findById(contractId);

    // SE O ID NÃO EXISTIR NO BANCO: Dispara o erro que vai travar a transição de tela no React!
    if (!contratoLocalizado) {
      throw new Error(`O contrato número ${contractId} não existe no banco de dados.`);
    }

    console.log(`[API] Contrato ${contractId} localizado com sucesso no banco! Sincronizando filas...`);

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
      js: contratoLocalizado // 👈 Agora a fila e o Worker vão receber os dados reais do banco!
    };

    const EXCHANGE = 'reports.exchange';
    const ROUTING_KEY = estrategiaAtual.routingKey;

    console.log(`[Agendador] Montando payload para o protocolo: ${protocoloId} | Fila: ${ROUTING_KEY}`);

    // 5. Envia para o RabbitMQ em segundo plano
    await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payload);

    // C) 🔥 RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
    // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
    return { 
      sucesso: true, 
      protocoloId, 
      ...contratoLocalizado // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
    };
  }

  async acoes(dadosDoPedido: any) {

    const { metadata } = dadosDoPedido;
    const { protocoloId, acao } = metadata;

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
      js: dadosDoPedido // Agora a fila e o Worker vão receber os dados reais do banco!
    };

    const EXCHANGE = 'reports.exchange';
    const ROUTING_KEY = estrategiaAtual.routingKey;

    console.log(`[Agendador] Montando payload para o protocolo: ${protocoloId} | Fila: ${ROUTING_KEY}`);

    // 5. Envia para o RabbitMQ em segundo plano
    await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payload);

    // C) 🔥 RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
    // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
    return { 
      sucesso: true, 
      protocoloId, 
      ...dadosDoPedido // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
    };
  }

}
