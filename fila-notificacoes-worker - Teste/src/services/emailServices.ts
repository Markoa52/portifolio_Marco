import nodemailer from 'nodemailer';
import { configEmail } from '../config/emailConfig.js'; // Importa o arquivo de configuração acima
import {mfaRepository} from '../repositories/mfaRepositoryes.js';
import { Database } from '../config/sqlLiteConfig.js'; 

const mfaRepo = new mfaRepository(); 

export class EmailServices {
  private transportador;
  private remetentePadrao: string;
    static enviarCodigoMFA: any;

  constructor() {
    // Inicializa o transportador utilizando o objeto importado
    this.transportador = nodemailer.createTransport({
      host: configEmail.smtp.host,
      port: configEmail.smtp.port,
      secure: configEmail.smtp.secure,
      auth: {
        user: configEmail.smtp.user,
        pass: configEmail.smtp.pass
      }
    });

    // Monta a assinatura padrão do remetente (Ex: "TollManagement Segurança <email@empresa.com>")
    this.remetentePadrao = `"${configEmail.remetente.nome}" <${configEmail.remetente.endereco}>`;
  }
  

  /**
   * Método Geral para Envio de Qualquer E-mail
   */
  async enviarEmail(para: string, assunto: string, conteudoHtml: string): Promise<void> {
    const opcoesEmail = {
      from: this.remetentePadrao,
      to: para,
      subject: assunto,
      html: conteudoHtml
    };

    try {
      await this.transportador.sendMail(opcoesEmail);
    } catch (erro) {
      console.error(`[EmailService] Falha ao disparar e-mail para ${para}:`, erro);
      throw new Error('Não foi possível realizar o disparo do e-mail de notificação.');
    }
  }

  /**
   * Método Especializado para Envio do Código MFA (Template Clean)
   */
  async enviarCodigoMFA(dados: any): Promise<void> {

    const { payload } = dados;
    const { js } = payload;
    const { metadata, contextoMFA } = js;
    const contratoIdReal = Number(metadata.contratoId);

    const assunto = "🔒 Código de Verificação - TollManagement";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
        <h2 style="color: #212529; text-align: center;">Ativação de Conta</h2>
        <p style="color: #495057; font-size: 14px; line-height: 1.5;">
          Olá, <strong>${contextoMFA.nome}</strong>.<br><br>
          Recebemos a sua solicitação de primeiro acesso ao ecossistema de vale-pedágio. Utilize o código de segurança abaixo para concluir a validação da sua conta:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; background-color: #f8f9fa; padding: 10px 20px; border: 1px solid #ced4da; border-radius: 4px; color: #0d6efd;">
            ${contextoMFA.codigoMFA}
          </span>
        </div>
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          Este código é de uso único e expira em 15 minutos.<br>
          Se não reconhece esta operação, ignore este e-mail de segurança.
        </p>
      </div>
    `;

    await this.enviarEmail(contextoMFA.email, assunto, html);
  }

  async salvaDadosMFA(dados: any) {

    const { payload } = dados;
    const { js } = payload;
    const { metadata, contextoMFA } = js;
    const contratoIdReal = Number(metadata.contratoId);
  
    const db = await Database.getConnection();
    let transacaoAtiva = false;

  try {
    await db.exec('BEGIN TRANSACTION');
    transacaoAtiva = true;

    // CORREÇÃO UX: Garanta que passa a conexão 'db' para o repositório 
    // se ele permitir receber a transação ativa, por exemplo:
    await mfaRepo.salvarMFA(contextoMFA); 

    await db.exec('COMMIT');
    transacaoAtiva = false;
    
    // CORREÇÃO DO LOG: Acessa a propriedade real do ID (ex: dados.usuarioId ou dados.id)
    console.log(`\n [Sucesso Total] Todo o ecossistema foi salvo para o Usuário ID: ${contextoMFA.js.usuarioId || contextoMFA.js.id || 'N/A'}`);
    
    return { sucesso: true, contextoMFA };

  } catch (erro) {
    // CORREÇÃO: Só executa o ROLLBACK se o BEGIN tiver rodado e o COMMIT não tiver acontecido
    if (transacaoAtiva) {
      try {
        await db.exec('ROLLBACK');
      } catch (erroRollback) {
        console.error("Falha ao tentar executar o ROLLBACK físico:", erroRollback);
      }

     console.error("↩ [Rollback Tratado] Operação abortada com segurança no SQLite.", erro);
     throw erro; // Lança o erro original para o RabbitMQ mandar a mensagem para a DLQ
}
  }
  
  }

async enviarNotificaoNovoUsuario(dados: any): Promise<void> {

    const { payload } = dados;
    const { js } = payload;
    const { metadata, contextoNotificacao } = js;
    const contratoIdReal = Number(metadata.contratoId);

    const emailDestinatario = contextoNotificacao?.emailLimpo || contextoNotificacao?.email;

    if (!emailDestinatario) {
     throw new Error("❌ Erro fatal: O e-mail do destinatário não foi localizado no payload da notificação.");
    }

    const assunto = "Acesso gestão de peságio - TollManagement";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
        <h2 style="color: #212529; text-align: center;">Ativação de Conta</h2>
        <p style="color: #495057; font-size: 14px; line-height: 1.5;">
          Olá, <strong>${emailDestinatario}</strong>.<br><br>
          Recebemos a sua solicitação de primeiro acesso ao ecossistema de vale-pedágio. Entre no portal TollManagemente para seguir com a criação do seu primeiro acesso !
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 10px; background-color: #f8f9fa; padding: 10px 20px; border: 1px solid #ced4da; border-radius: 4px; color: #0d6efd;">
            Obrigado !!!
          </span>
        </div>
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          Este código é de uso único e expira em 15 minutos.<br>
          Se não reconhece esta operação, ignore este e-mail de segurança.
        </p>
      </div>
    `;

    await this.enviarEmail(emailDestinatario, assunto, html);
  }

}

// Exporta uma única instância (Padrão Singleton)
export default new EmailServices();
