import sql from 'mssql';
import { Database } from '../config/sqlConfig.js';

export class PedidoRepository {

  async criarPedido(pedidoData: any, contratoId: number, transaction?: sql.Transaction): Promise<number> {
    try {
        // Se receber uma transação ativa do Service, o request nasce dela. Caso contrário, usa o pool global.
        const request = transaction? new sql.Request(transaction) : (await Database.getConnection()).request();

        // 💡 SQL Server usa parâmetros nomeados e OUTPUT para interceptar o ID criado
        const query = `
          INSERT INTO pedidoTag (
            dataRegistro, nomeComprador, telefone, email, quantidade, 
            valorUnidade, valortotal, enderecoEntrega, contratoId, 
            responsavelRecebimento, usuarioPedido
          )
          OUTPUT INSERTED.id AS lastID
          VALUES (
            @dataRegistro, @nomeComprador, @telefone, @email, @quantidade, 
            @valorUnidade, @valorTotal, @enderecoEntrega, @contratoId, 
            @responsavelRecebimento, @usuarioPedido
          );
        `;

        // Vincula as variáveis tipadas diretamente ao request configurado
        const resultadoPrincipal = await request
          .input('dataRegistro', sql.DateTime2, pedidoData.data || new Date())
          .input('nomeComprador', sql.VarChar(255), pedidoData.nome || null)
          .input('telefone', sql.VarChar(50), pedidoData.telefone || null)
          .input('email', sql.VarChar(255), pedidoData.email || null)
          .input('quantidade', sql.Int, Number(pedidoData.quantidade) || 0)
          .input('valorUnidade', sql.Decimal(18, 2), Number(pedidoData.valorUnidade) || 0)
          .input('valorTotal', sql.Decimal(18, 2), Number(pedidoData.valorTotal) || 0)
          .input('enderecoEntrega', sql.VarChar(505), pedidoData.enderecoCompleto || null)
          .input('contratoId', sql.Int, Number(contratoId))
          .input('responsavelRecebimento', sql.VarChar(255), pedidoData.responsavelRecebimento || null)
          .input('usuarioPedido', sql.VarChar(255), pedidoData.usuarioPedido || null)
          .query(query);

        // Extrai o ID gerado da primeira linha retornada no recordset
        const pedidoId = resultadoPrincipal.recordset[0]?.lastID;
        
        console.log(`✅ [PedidoRepository] Pedido gravado com sucesso! ID: ${pedidoId}`);
        return Number(pedidoId);

    } catch (error: any) {
      console.error("❌ Erro físico no INSERT da tabela pedidoTag:", error.message);
      throw error;
    }
  }

  async criarPedidoRastreamento(dataRegistro: string, pedidoId: number, transaction?: sql.Transaction): Promise<number> {
    try {
        const request = transaction? new sql.Request(transaction) : (await Database.getConnection()).request();

        const query = `
          INSERT INTO pedidoTagRastreamento (dataRegistro, statusPedidoId, pedidoTagId) 
          OUTPUT INSERTED.id AS lastID
          VALUES (@dataRegistro, @statusPedidoId, @pedidoTagId);
        `;

        const resultado = await request
            .input('dataRegistro', sql.DateTime2, dataRegistro || new Date())
            .input('statusPedidoId', sql.Int, 1) // statusPedidoId padrão 1
            .input('pedidoTagId', sql.Int, Number(pedidoId))
            .query(query);

        const rastreamentoId = resultado.recordset[0]?.lastID;
        console.log(`✅ [PedidoRepository] Vínculo de rastreamento gravado! ID: ${rastreamentoId}`);
        return Number(rastreamentoId); 
    
    } catch (error: any) {
        console.error("❌ Erro físico no INSERT da tabela pedidoTagRastreamento:", error.message);
        throw error;
    }
  }
}
