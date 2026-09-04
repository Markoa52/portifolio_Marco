import { DatabaseConnection } from '../config/sqlLiteConfig.js';

export class usuarioRepository {

  // Método usado pelo Service para registrar o novo operador em disco
  async salvarNovoUsuario(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    try {
      const query = `
        INSERT INTO usuario (nome, usuario, email, senha, ativo, dataCriacao, perfil) 
        VALUES (?, ?, ?, ?, 0, date('now'), ?);
      `;
      await db.run(query, [dados.js.contextoUsuario.nome, dados.js.contextoUsuario.usuario, dados.js.contextoUsuario.email, dados.js.contextoUsuario.senha, dados.js.contextoUsuario.perfil]);
    } catch (error: any) {
      console.error('Erro ao inserir novo usuário no repositório:', error.message);
      throw error;
    }
  }

    async  atualizarUsuario(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    try {
      const query = `
        UPDATE usuario set senha= ?, ativo=1 where id= ?;
      `;
      await db.run(query, [ dados.js.contextoUsuario.senha, dados.js.contextoUsuario.usuarioId]);
    } catch (error: any) {
      console.error('Erro ao inserir novo usuário no repositório:', error.message);
      throw error;
    }
  }

  async inativarAtivarUsuario(dados: any): Promise<void> {
  
    const db = await DatabaseConnection.getConnection();
  
    try {
      const query = `
        UPDATE usuario SET ativo = ? WHERE id = ?;
      `;
      
      // CORREÇÃO: Lê 'novoStatus' (ou 'status') e 'usuarioId' com fallbacks seguros
      const statusFinal = dados.novoStatus !== undefined ? dados.novoStatus : dados.status;
      const idFinal = dados.usuarioId || dados.idUsuario;
  
      console.log(`💾 [Repositório SQLite] Aplicando status ${statusFinal} no Usuário ID ${idFinal}`);
  
      await db.run(query, [statusFinal, idFinal]);
      
    } catch (error: any) {
      console.error('Erro ao atualizar status usuário no repositório:', error.message);
      throw error;
    }
  }

    async vincularContrato(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    try {
      const query = `
        INSERT INTO usuarioContrato (usuarioId, contratoId, vinculadoEm) 
        VALUES (?, ?, date('now'));
      `;
      await db.run(query, [dados.js.contextoUsuario.usuarioId, dados.js.contextoUsuario.contratoId]);
    } catch (error: any) {
      console.error('Erro ao inserir novo usuário no repositório:', error.message);
      throw error;
    }
  }
}
