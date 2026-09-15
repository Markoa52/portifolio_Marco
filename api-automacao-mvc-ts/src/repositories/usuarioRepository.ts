import { Database } from '../config/sqlConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class usuarioRepository {

async buscarUsuariosDownload(): Promise<any[]> {
  try {
    // 1. Obtém o pool de conexão do SQL Server
    const pool = await Database.getConnection();
    
    // 2. Executa a query no MSSQL
    const resultado = await pool.request().query(`
      SELECT 
        id,
        nome,
        usuario,
        email,
        ativo,
        dataCriacao,
        perfil
      FROM usuario
      ORDER BY id
    `);

    // 3. No mssql, os dados das linhas vêm estritamente dentro de '.recordset'
    return resultado.recordset || [];
  
  } catch (erro) {
    console.error("Erro na consulta buscarUsuariosDownload do repositório MSSQL:", erro);
    throw erro;
  }
}

}