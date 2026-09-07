
import { Database } from '../config/sqlConfig'; // Garanta que aponta para o seu arquivo central com path.join
import sql from 'mssql';

export class authRepository {

  async auth(usuario: string): Promise<any> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();

    // 2. Prepara a query trocando o "?" por "@usuario"
    // Nota: Removido o CAST(u.ativo AS INTEGER) pois o SQL Server já gerencia tipos BIT nativamente
    const query = `
      SELECT 
        u.id, 
        u.nome, 
        u.perfil, 
        u.senha,
        u.ativo, 
        c.id AS contratoId, 
        uc.id AS contratoNumero
      FROM Usuario.dbo.usuario u
      LEFT JOIN Usuario.dbo.usuarioContrato uc ON u.id = uc.usuarioId
      LEFT JOIN contrato c ON uc.contratoId = c.id
      WHERE u.usuario = @usuario;
    `;

    // 3. Executa injetando o parâmetro de forma segura
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario) // Use sql.VarChar ou sql.NVarChar dependendo do seu banco
      .query(query);

    // 4. Retorna os registros encontrados ou null caso esteja vazio
    // Como você usou db.all() no SQLite, se houver mais de um contrato vinculado, 
    // o result.recordset retornará um array com múltiplas linhas (uma para cada contrato).
    return result.recordset.length > 0 ? result.recordset : null;
      
  } catch (erro) {
    console.error("Erro na consulta auth do repositório:", erro);
    throw erro;
  }
}

  async validacaoUsuario(usuario: string): Promise<any> {
  try { 
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();

    // 2. Prepara a query corrigindo a lógica do WHERE e adicionando TOP 1
    // Passamos o mesmo parâmetro @busca tanto para a validação do usuário quanto do e-mail
    const query = `
      SELECT TOP 1 
        id, 
        nome, 
        usuario, 
        email, 
        senha, 
        ativo 
      FROM Usuario.dbo.usuario 
      WHERE usuario = @busca OR email = @busca;
    `;

    // 3. Executa injetando o parâmetro único que servirá para ambas as checagens
    const result = await pool.request()
      .input('busca', sql.VarChar, usuario) // Vincula a string ao parâmetro @busca
      .query(query);

    // 4. Como o db.get() do SQLite retornava apenas o objeto direto (ou undefined/null),
    // pegamos apenas a primeira linha encontrada na tabela (recordset[0])
    return result.recordset[0] || null;
      
  } catch (erro) {
    console.error("Erro na consulta validacaoUsuario do repositório:", erro);
    throw erro;
  }
}

  async buscarPorContratoVinculadoUsuario(contratoId: string, usuarioId: string): Promise<any> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();
    
    // 2. Prepara a query com os parâmetros nomeados e adiciona TOP 1 (equivalente ao db.get)
    const query = `
      SELECT TOP 1 id 
      FROM Usuario.dbo.usuarioContrato
      WHERE usuarioId = @usuarioId AND contratoId = @contratoId;
    `;

    // 3. Executa injetando os parâmetros nomeados de forma segura
    // Como os argumentos chegam como string, usamos sql.VarChar (ou sql.Int se forem números no banco)
    const result = await pool.request()
      .input('usuarioId', sql.Int, usuarioId)
      .input('contratoId', sql.Int, contratoId)
      .query(query);

    // 4. Retorna apenas o objeto da primeira linha encontrada ou null caso não exista vínculo
    return result.recordset[0] || null;

  } catch (error: any) {
    console.error('Erro ao buscar vinculo no repositório:', error.message);
    throw error;
  }
}

  async listarUsuariosGerais(): Promise<any[]> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();
    
    // 2. Prepara a query de listagem
    const query = 'SELECT id, nome, usuario, email, perfil FROM Usuario.dbo.usuario ORDER BY nome ASC';

    // 3. Executa a consulta diretamente
    const result = await pool.request().query(query);

    // 4. Retorna a lista de usuários encontrada
    return result.recordset || [];

  } catch (error: any) {
    // Ajustado o texto do log para refletir o real propósito da função
    console.error('❌ Erro ao listar usuários gerais no repositório:', error.message);
    throw error;
  }
}

  async listarContratosUsuario(usuarioId: any): Promise<any[]> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();
    
    // 2. Prepara a query trocando o "?" por "@usuarioId"
    const query = `
      SELECT 
        uc.id, 
        uc.contratoId, 
        p.nomeEmpresa 
      FROM Usuario.dbo.usuarioContrato uc
      LEFT JOIN person p ON uc.contratoId = p.contractId
      WHERE uc.usuarioId = @usuarioId 
      ORDER BY uc.contratoId ASC;
    `;

    // 3. Executa injetando o parâmetro de forma segura
    // Nota: Como o parâmetro chega como 'any', usei sql.Int assumindo que o ID seja numérico.
    // Se for uma string/UUID no banco, mude para sql.VarChar.
    const result = await pool.request()
      .input('usuarioId', sql.Int, usuarioId)
      .query(query);

    // 4. Retorna a lista encontrada (no mssql fica dentro de recordset)
    return result.recordset || [];

  } catch (error: any) {
    console.error('Erro ao buscar usuário ou e-mail no repositório:', error.message);
    throw error;
  }
}

  async listarUsuariosContrato(contratoId: any): Promise<any[]> {
  try {
    // 1. Obtém a conexão com o SQL Server usando a sua classe Database
    const pool = await Database.getConnection();
    
    // 2. Prepara a query trocando o "?" por "@contratoId"
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
      WHERE uc.contratoId = @contratoId
      ORDER BY u.nome ASC;
    `;

    // 3. Executa injetando o parâmetro de forma segura
    // Nota: Se o seu contratoId for numérico (INT), mude sql.VarChar para sql.Int
    const result = await pool.request()
      .input('contratoId', sql.VarChar, contratoId)
      .query(query);

    // 4. Retorna a lista encontrada dentro de recordset
    return result.recordset || [];

  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários do contrato no repositório:', error.message);
    throw error;
  }
}

  async buscarPorUsuarioOuEmail(usuario: string, email: string): Promise<any> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();
    
    // 2. Prepara a query com os parâmetros nomeados do SQL Server e adiciona TOP 1
    const query = `
      SELECT TOP 1 id 
      FROM Usuario.dbo.usuario
      WHERE usuario = @usuario OR email = @email;
    `;

    // 3. Executa injetando os parâmetros de forma segura contra SQL Injection
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .input('email', sql.VarChar, email)
      .query(query);

    // 4. Retorna apenas o objeto da primeira linha encontrada ou null caso não exista
    return result.recordset || null;

  } catch (error: any) {
    console.error('❌ Erro ao buscar usuário ou e-mail no repositório:', error.message);
    throw error;
  }
}

}