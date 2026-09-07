import { Database } from '../config/sqlConfig.js';
import sql from 'mssql';

export class TagRepository {

async atualizaTagTransferencia(contratoDestinoId: number, tagIdOuSerial: any): Promise<number> {
  try {
    // 1. Obtém a conexão com o SQL Server
    const pool = await Database.getConnection();

    // 2. Prepara a query com os parâmetros nomeados do SQL Server (@...)
    const query = `
      UPDATE tag 
      SET contratoId = @contratoDestinoId 
      WHERE id = @tagIdOuSerial;
    `;

    console.log(`💾 [Repositório SQL Server] Transferindo Tag ${tagIdOuSerial} para o Contrato Destino ${contratoDestinoId}`);

    // 3. Identifica dinamicamente se o identificador é um ID (numérico) ou Serial (string)
    const tipoTagParam = typeof tagIdOuSerial === 'number' ? sql.Int : sql.VarChar;

    // 4. Executa a query injetando as variáveis com segurança
    const result = await pool.request()
      .input('contratoDestinoId', sql.Int, Number(contratoDestinoId))
      .input('tagIdOuSerial', tipoTagParam, tagIdOuSerial)
      .query(query);

    // 5. No driver mssql, 'rowsAffected' é um array de números (um para cada comando executado)
    // Pegamos a primeira posição para saber quantas linhas sofreram UPDATE
    const linhasAfetadas = result.rowsAffected[0] || 0;
    
    if (linhasAfetadas === 0) {
      console.warn(`⚠️ [TagRepository] Nenhuma tag foi atualizada. Verifique se o ID/Serial ${tagIdOuSerial} existe.`);
    } else {
      console.log(`✅ [TagRepository] Transferência concluída! Linhas afetadas: ${linhasAfetadas}`);
    }

    return Number(linhasAfetadas); 

  } catch (error: any) {
    console.error("❌ Erro físico no UPDATE da tabela tag:", error.message);
    throw error;
  }
}


}
