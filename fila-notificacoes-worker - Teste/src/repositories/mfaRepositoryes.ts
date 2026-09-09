
import {Database} from '../config/sqlLiteConfig.js';

export class mfaRepository {

  async salvarMFA(dados: any,) {

    const db = await Database.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
     // 2. Gera o Token MFA
    //   const codigoMFA = Math.floor(100000 + Math.random() * 900000).toString();
    //   const tempoExpiracao = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await db.run('DELETE FROM mfa_tokens WHERE usuario_id = ?', [dados.usuarioId]);
      await db.run('INSERT INTO mfa_tokens (usuario_id, codigo, criado_em, expira_em) VALUES (?, ?, ?, ?)', [dados.usuarioId, dados.codigoMFA, dados.criadoEm, dados.tempoExpiracao]);
        
        // Captura o ID auto-incremental gerado pelo banco para este VEÍCULO
        //const veiculoId = resultadoPrincipal.lastID;

        console.log(`Veiculo Gerada com sucesso! ID: ${dados}`);
        return dados;
        
        

    } catch (error: any) {
      console.error("Erro no processamento do veiculo Repository:", error.message);
      throw error;
    }
  }



}
