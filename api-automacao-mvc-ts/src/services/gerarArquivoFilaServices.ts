import { RabbitMqPublisher } from '../queue/publisher';
import { jobPayload } from '../types/IPublisherArquivo';

export class GeradorArquivosServices {
  // Injeta o entregador do RabbitMQ no serviço
  constructor(private rabbitPublisher: RabbitMqPublisher) {}

  async agendarGeracaoDeRelatorio(dados: any) {
    const { protocolo, tipoArquivo, dadosLimpo } = dados;

    // 1. Monta o desenho do payload (exatamente como estava no seu print)
    const payload: jobPayload = {
      protocolo,
      task: 'generate_daily_report',
      tipoArquivo: tipoArquivo === 'pdf' ? 'pdf' : 'excel',
      solicitadoEm: new Date().toISOString(),
      
      js: Array.isArray(dadosLimpo) ? dadosLimpo : []

    };

    // 2. Define os caminhos da fila
    const EXCHANGE = 'reports.exchange';
    const ROUTING_KEY = tipoArquivo === 'pdf' ? 'reports.v1.trigger.download_pdf' : 'reports.v1.trigger.download_excel';

    console.log(`[Agendador] Montando payload para o protocolo: ${protocolo}`);

    // 3. Manda a pasta queue/ fazer o envio técnico real
    await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payload);

    return { sucesso: true, protocolo };
  }
}
