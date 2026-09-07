// 👈 1. IMPORTA O SEU REPOSITÓRIO DO BANCO
import { RabbitMqPublisher } from '../queue/publisher';

import { tagRepository } from '../repositories/tagRepository';

const MAPA_DE_ACOES: Record<string, { tipoArquivo: "inserir" | "consultar" | "atualizar" | "excluir"; routingKey: string }> = {
  inserir:   { tipoArquivo: 'inserir',   routingKey: 'reports.v1.trigger.ativar-tag' },
  consultar: { tipoArquivo: 'consultar', routingKey: 'reports.v1.trigger.consulta_contrato' },
  atualizar: { tipoArquivo: 'atualizar', routingKey: 'reports.v1.trigger.atualiza-tag' },
  excluir:   { tipoArquivo: 'excluir',   routingKey: 'reports.v1.trigger.exclui-tag' }
};

export class tagServices {

    constructor(
      private rabbitPublisher: RabbitMqPublisher,
      private tagRepository: tagRepository 
    ) {}

async obterTagsEstoqueContrato(contratoId: number): Promise<any> {
  // Faz o select puro no SQL Server usando o repositório que já injetamos lá no construtor
  const veiculos = await this.tagRepository.buscarTagsEstoque(contratoId)
  return veiculos;
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

    // C) RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
    // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
    return { 
      sucesso: true, 
      protocoloId, 
      ...dadosDoPedido // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
    };
  }

}
