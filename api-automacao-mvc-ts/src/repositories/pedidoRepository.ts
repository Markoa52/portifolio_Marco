import sql from 'mssql';
import { Database } from '../config/sqlConfig'; // Certifique-se de que este arquivo gerencia o pool do mssql

export class pedidoRepository {

  async buscaPedidos(contratoId: number): Promise<any> {
    try {
      const pool = await Database.getConnection();
      
      const resultado = await pool.request()
        .input('contratoId', sql.Int, contratoId)
        .query(`
          SELECT 
            id, dataRegistro, nomeComprador, telefone, email, 
            quantidade, valorUnidade, valorTotal, enderecoEntrega, 
            responsavelRecebimento, usuarioPedido 
          FROM pedidoTag 
          WHERE contratoId = @contratoId 
          order by id desc
        `);
    
      return resultado.recordset || [];
    } catch (erro) {
      console.error("Erro na consulta buscaPedidos do repositório:", erro);
      throw erro;
    }
  }

  async buscaStatusPedido(contratoId: number): Promise<any[]> {
    try {
      const pool = await Database.getConnection();
      
      // SQL Server usa TOP 1 para simular o db.get() combinado com o ORDER BY DESC
      const resultado = await pool.request()
        .input('contratoId', sql.Int, contratoId)
        .query(`
          SELECT TOP 1
            ptr.pedidoTagId, 
            ptr.dataRegistro, 
            ptr.statusPedidoId 
          FROM pedidoTagRastreamento ptr 
          INNER JOIN pedidoTag p ON ptr.pedidoTagId = p.id 
          WHERE p.contratoId = @contratoId 
          ORDER BY ptr.id DESC
        `);
      
      return resultado.recordset || [];
    } catch (erro: any) {
      console.error("❌ Erro na consulta buscaStatusPedido do repositório:", erro.message);
      throw erro;
    }
  }

}
