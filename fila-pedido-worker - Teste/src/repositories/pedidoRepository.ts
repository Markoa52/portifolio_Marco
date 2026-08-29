import { DatabaseConnection } from '../config/sqlLiteConfig.js';

export class PedidoRepository {

  async criarPedido(pedidoData: any, contratoId: number): Promise<number> {
    const db = await DatabaseConnection.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
        // 💡 CORREÇÃO 1: Adicionadas as 11 interrogações exatas para as 11 colunas
        const query = `
          INSERT INTO pedidoTag (
            dataRegistro, nomeComprador, telefone, email, quantidade, 
            valorUnidade, valortotal, enderecoEntrega, contratoId, 
            responsavelRecebimento, usuarioPedido
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        // 💡 CORREÇÃO 2: Variáveis alinhadas perfeitamente na mesma ordem das colunas SQL!
        const resultadoPrincipal = await db.run(query, [
          pedidoData.data || new Date().toISOString(), // 1. dataRegistro
          pedidoData.nome || null,                     // 2. nomeComprador
          pedidoData.telefone || null,                 // 3. telefone
          pedidoData.email || null,                    // 4. email
          Number(pedidoData.quantidade) || 0,          // 5. quantidade
          Number(pedidoData.valorUnidade) || 0,        // 6. valorUnidade
          Number(pedidoData.valorTotal) || 0,          // 7. valortotal
          pedidoData.enderecoCompleto || null,         // 8. enderecoEntrega (Rua) 👈 CORRIGIDO!
          Number(contratoId),                          // 9. contratoId (ID Numérico) 👈 CORRIGIDO!
          pedidoData.responsavelRecebimento || null,   // 10. responsavelRecebimento
          pedidoData.usuarioPedido || null             // 11. usuarioPedido
        ]);

        const pedidoId = resultadoPrincipal.lastID;
        console.log(`✅ [PedidoRepository] Pedido gravado com sucesso! ID: ${pedidoId}`);
       return Number(pedidoId);

    } catch (error: any) {
      console.error("❌ Erro físico no INSERT da tabela pedidoTag:", error.message);
      throw error;
    }
  }

  async criarPedidoRastreamento(dataRegistro: string, pedidoId: number): Promise<number> {
    const db = await DatabaseConnection.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
        // Inserção na tabela contaVeiculo conforme mapeado na sua estrutura física
        const query = `
          INSERT INTO pedidoTagRastreamento (dataRegistro, statusPedidoId, pedidoTagId) 
          VALUES (?, ?, ?);
        `;

        // 💡 CORREÇÃO 3: Lemos a variável 'dataRegistro' diretamente, sem tentar ler chaves nulas
        const resultado = await db.run(query, [
            dataRegistro || new Date().toISOString(), // 1º ? (dataRegistro string)
            1,                                        // 2º ? (statusPedidoId padrão 1)
            Number(pedidoId)                          // 3º ? (FK vinculada ao pedidoTagId)
        ]);

        const rastreamentoId = resultado.lastID;
        console.log(`✅ [PedidoRepository] Vínculo de rastreamento gravado! ID: ${rastreamentoId}`);
        return Number(rastreamentoId); 
    
    } catch (error: any) {
        console.error("❌ Erro físico no INSERT da tabela contaVeiculo:", error.message);
        throw error;
    }
  }
}
