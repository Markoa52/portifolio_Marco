import { RabbitMqPublisher } from '../queue/publisher';
import { jobPayload } from '../types/Ipublusher';

export class GeradorArquivosServices {
  // Injeta o entregador do RabbitMQ no serviço
  constructor(private rabbitPublisher: RabbitMqPublisher) {}

  async agendarGeracaoDeRelatorio(dadosDoPedido: any) {
    const { protocoloId, formatoDesejado, dadosLimpos } = dadosDoPedido;

    // 1. Monta o desenho do payload (exatamente como estava no seu print)
    const payload: jobPayload = {
      protocoloId,
      task: 'generate_daily_report',
      tipoArquivo: formatoDesejado === 'pdf' ? 'pdf' : 'excel',
      solicitadoEm: new Date().toISOString(),
      js: Array.isArray(dadosLimpos) ? dadosLimpos : []
    };

    // 2. Define os caminhos da fila
    const EXCHANGE = 'reports.exchange';
    const ROUTING_KEY = formatoDesejado === 'pdf' ? 'reports.v1.trigger.download_pdf' : 'reports.v1.trigger.download_excel';

    console.log(`[Agendador] Montando payload para o protocolo: ${protocoloId}`);

    // 3. Manda a pasta queue/ fazer o envio técnico real
    await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payload);

    return { sucesso: true, protocoloId };
  }
}
