import nodemailer from 'nodemailer';

class EmailService {
  private transportador;

  constructor() {
    // Inicializa o transportador com o seu SMTP corporativo
    this.transportador = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "://suaempresa.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER || "seu-email@suaempresa.com",
        pass: process.env.SMTP_PASS || "sua-senha-ou-app-password"
      }
    });
  }

  /**
   * Método Geral para envio de E-mails
   */
  async enviarEmail(para: string, assunto: string, conteudoHtml: string): Promise<void> {
    const opcoesEmail = {
      from: `"TollManagement" <${process.env.SMTP_USER || 'seu-email@suaempresa.com'}>`,
      to: para,
      subject: assunto,
      html: conteudoHtml
    };

    try {
      await this.transportador.sendMail(opcoesEmail);
    } catch (erro) {
      console.error(`Falha ao enviar e-mail para ${para}:`, erro);
      throw new Error('Não foi possível realizar o disparo do e-mail de notificação.');
    }
  }

  /**
   * Método Especializado para Código MFA (Template Visual Clean)
   */
  async enviarCodigoMFA(para: string, nomeUsuario: string, codigo: string): Promise<void> {
    const assunto = "🔒 Código de Verificação - TollManagement";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
        <h2 style="color: #212529; text-align: center;">Ativação de Conta</h2>
        <p style="color: #495057; font-size: 14px; line-height: 1.5;">
          Olá, <strong>${nomeUsuario}</strong>.<br><br>
          Recebemos a sua solicitação de primeiro acesso ao ecossistema de vale-pedágio. Utilize o código de segurança abaixo para concluir a validação da sua conta:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; background-color: #f8f9fa; padding: 10px 20px; border: 1px solid #ced4da; border-radius: 4px; color: #0d6efd;">
            ${codigo}
          </span>
        </div>
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          Este código é de uso único e expira em 15 minutos.<br>
          Se não reconhece esta operação, ignore este e-mail de segurança.
        </p>
      </div>
    `;

    await this.enviarEmail(para, assunto, html);
  }

  /**
   * Método Exemplo: Notificação de Alerta de Fatura ou Saldo (Para reutilização futura)
   */
  async enviarAlertaSaldoBaixo(para: string, placa: string, saldoAtual: number): Promise<void> {
    const assunto = "⚠️ Atenção: Saldo Baixo no Vale Pedágio";
    const html = `<h2>Alerta de Frota</h2><p>O veículo com a placa <strong>${placa}</strong> está com o saldo crítico de R$ ${saldoAtual}.</p>`;
    await this.enviarEmail(para, assunto, html);
  }
}

// Exporta uma única instância da classe (Padrão Singleton)
export default new EmailService();
