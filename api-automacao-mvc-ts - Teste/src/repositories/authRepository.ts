
import { Database } from '../config/sqlLiteConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class authRepository {

     async auth(usuario: string): Promise<any> {

    try { 
        
      const db = await Database.getConnection();

    // Busca o operador no banco de dados SQLite
    const conta = await db.all(`
      SELECT 
        u.id, 
        u.nome, 
        u.perfil, 
        u.senha,
        CAST(u.ativo AS INTEGER) AS ativo, 
        c.id AS contratoId, 
        uc.id AS contratoNumero
      FROM usuario u
      LEFT JOIN usuarioContrato uc ON u.id = uc.usuarioId
      LEFT JOIN contrato c ON uc.contratoId = c.id
      WHERE u.usuario = ?;
    `, [usuario]);

      return conta || null;
      
     } catch (erro) {
         console.error("Erro na consulta findById do repositório:", erro);
         throw erro;
       }
     }

    async validacaoUsuario(usuario: string): Promise<any> {

    try { 
        
    const db = await Database.getConnection();

    // Busca o operador no banco de dados SQLite
    const conta = await db.get(
      'SELECT id, nome, usuario, email, senha, ativo FROM usuario WHERE usuario OR email = ?', [usuario]);

      return conta || null;
      
     } catch (erro) {
         console.error("Erro na consulta findById do repositório:", erro);
         throw erro;
       }
     }

    // Método usado pelo Service para checar se o usuário já existe
  async buscarPorUsuarioOuEmail(usuario: string, email: string): Promise<any> {
    const db = await Database.getConnection();
    try {
      return await db.get(
        'SELECT id FROM banco_user.usuario WHERE usuario = ? OR email = ?', 
        [usuario, email]
      );
    } catch (error: any) {
      console.error('Erro ao buscar usuário ou e-mail no repositório:', error.message);
      throw error;
    }
  }

    async buscarPorContratoVinculadoUsuario(contratoId: string, usuarioId: string): Promise<any> {
    const db = await Database.getConnection();
    try {
      return await db.get(
        'SELECT id FROM banco_user.usuarioContrato WHERE usuarioId = ? AND contratoId = ?', 
        [contratoId, usuarioId]
      );
    } catch (error: any) {
      console.error('Erro ao buscar vinculo no repositório:', error.message);
      throw error;
    }
  }

    async listarUsuariosGerais(): Promise<any[]> {
    const db = await Database.getConnection();
    try {
      return await db.all(
          ('SELECT id, nome, usuario, email, perfil FROM usuario ORDER BY nome ASC')
      );
    } catch (error: any) {
      console.error('Erro ao buscar usuário ou e-mail no repositório:', error.message);
      throw error;
    }
  }

    async listarContratosUsuario(usuarioId: any): Promise<any[]> {

    const db = await Database.getConnection();
    try {
    const query = `
      SELECT 
        uc.id, 
        uc.contratoId, 
        p.nomeEmpresa 
      FROM usuarioContrato uc
      LEFT JOIN person p ON uc.contratoId = p.contractId
      WHERE uc.usuarioId = ? 
      ORDER BY uc.contratoId ASC;
    `;

    const contratosVinculados = await db.all(query, [usuarioId]);

    return contratosVinculados || [];

    } catch (error: any) {
      console.error('Erro ao buscar usuário ou e-mail no repositório:', error.message);
      throw error;
    }
  }

  async listarUsuariosContrato(contratoId: any): Promise<any[]> {
  // 💡 Garanta que usa a classe DatabaseConnection correta do seu projeto
  const db = await Database.getConnection(); 
  
  try {
    // 💡 CORREÇÃO DA QUERY: Ajustado o ON do JOIN e adicionado o WHERE com o '?'
    const query = `
      SELECT 
        u.id, 
        u.nome, 
        u.usuario, 
        u.email, 
        u.ativo, 
        u.dataCriacao,
        u.perfil 
      FROM usuario u 
      INNER JOIN usuarioContrato uc ON uc.usuarioId = u.id 
      WHERE uc.contratoId = ?
      ORDER BY u.nome ASC;
    `;

    // Agora o [contratoId] vai preencher o '?' do WHERE perfeitamente
    const usuariosContrato = await db.all(query, [contratoId]);

    return usuariosContrato || [];

  } catch (error: any) {
    console.error('Erro ao buscar usuários do contrato no repositório:', error.message);
    throw error;
  }
}

}