import { DatabaseConnection } from '../config/sqlLiteConfig.js';

export class TagRepository {

  async atualizaTagTransferencia(contratoDestinoId: number, tagIdOuSerial: any): Promise<number> {
  const db = await DatabaseConnection.getConnection();
  await db.configure('busyTimeout', 5000);

  try {
    // QUERY CORRIGIDA: Atualiza o contratoId baseado no identificador único da tag (id ou serial)
    // Nota: Ajuste o 'id = ?' para 'serial = ?' caso a sua tabela use a string do serial como chave
    const query = `
      UPDATE tag 
      SET contratoId = ? 
      WHERE id = ?;
    `;

    console.log(`💾 [Repositório SQLite] Transferindo Tag ${tagIdOuSerial} para o Contrato Destino ${contratoDestinoId}`);

    // Executa a atualização
    const resultado = await db.run(query, [
      Number(contratoDestinoId), // 1º ? -> Novo Contrato
      tagIdOuSerial              // 2º ? -> Identificador da Tag
    ]);

    // 💡 EM UPDATE: Usamos 'changes' para saber quantas linhas foram modificadas
    const linhasAfetadas = resultado.changes;
    
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
