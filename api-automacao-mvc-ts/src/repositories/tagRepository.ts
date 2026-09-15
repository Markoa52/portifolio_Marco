import { Database } from '../config/sqlConfig'; // Garanta que aponta para o seu arquivo central com path.join
import sql from 'mssql';

export class tagRepository {

async buscarTagsEstoque(contratoId: number): Promise<any[]> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();
    
    // 2. Prepara a query trocando o "?" por "@contratoId"
    const query = `
      SELECT 
        id,
        Serial,
        disponivel
      FROM tag
      WHERE contratoId = @contratoId 
        AND disponivel = 1;
    `;

    // 3. Executa injetando o parâmetro numérico de forma segura
    const result = await pool.request()
      .input('contratoId', sql.Int, contratoId)
      .query(query);

    // 4. Retorna a lista de tags encontrada (no mssql fica dentro de recordset)
    return result.recordset || [];
  
  } catch (erro) {
    console.error("❌ Erro na consulta buscarTagsEstoque do repositório:", erro);
    throw erro;
  }
 }
}