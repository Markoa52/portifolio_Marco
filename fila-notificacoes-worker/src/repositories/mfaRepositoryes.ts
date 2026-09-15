
import {Database} from '../config/sqlConfig.js';

export class mfaRepository {

async salvarMFA(dados: any): Promise<any> {
  try {
    // 1. Obtém o pool de conexão do SQL Server
    const pool = await Database.getConnection();

    // 2. Cria uma nova Request para executar comandos
    const request = pool.request();

    // 3. Vincula todos os parâmetros necessários de forma segura contra SQL Injection
    request.input('usuarioId', dados.usuarioId);
    request.input('codigo', dados.codigoMFA);
    request.input('criadoEm', dados.criadoEm);
    request.input('expiraEm', dados.tempoExpiracao);

    // 4. Executa o DELETE para limpar tokens antigos do usuário
    await request.query(`
      DELETE FROM mfa_tokens 
      WHERE usuario_id = @usuarioId;
    `);

    // 5. Executa o INSERT para salvar o novo token MFA
    await request.query(`
      INSERT INTO mfa_tokens (usuario_id, codigo, criado_em, expira_em) 
      VALUES (@usuarioId, @codigo, @criadoEm, @expiraEm);
    `);

    console.log(`Token MFA gerado com sucesso para o usuário ID: ${dados.usuarioId}`);
    return dados;

  } catch (error: any) {
    console.error("Erro no processamento do MFA Repository MSSQL:", error.message);
    throw error;
  }
}

}
