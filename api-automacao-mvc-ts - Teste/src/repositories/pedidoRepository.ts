import { Database } from '../config/sqlLiteConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class pedidoRepository {

    async buscaPedidos(contratoId: number): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.all(
        'SELECT id, dataRegistro, nomeComprador, telefone,email, quantidade, valorUnidade, valorTotal, enderecoEntrega, responsavelRecebimento, usuarioPedido FROM pedidoTag WHERE contratoId = ?', [contratoId] );
    
      return resultado || null;
    } catch (erro) {
      console.error("Erro na consulta buscaStatusPedido do repositório:", erro);
      throw erro;
    }
  }

   async buscaStatusPedido(contratoId: number): Promise<any[]> {
  try {
    // 1. CORREÇÃO: Usando a classe de conexão global correta e tipada
    const db = await Database.getConnection();
    
    // 2. CORREÇÃO: Especificamos 'ptr.pedidoTagId' no ORDER BY para remover a ambiguidade
    const resultado = await db.get(`
      SELECT 
        ptr.id,
        ptr.pedidoTagId, 
        ptr.dataRegistro, 
        ptr.statusPedidoId 
      FROM pedidoTagRastreamento ptr 
      INNER JOIN pedidoTag p ON ptr.pedidoTagId = p.id 
      WHERE p.contratoId = ? 
      ORDER BY ptr.id DESC
    `, [contratoId]);
    
    // Como usamos db.all(), sempre retornamos um array vazio [] se não achar nada,
    // evitando que o .map() do React estoure tela branca
    return resultado || [];
  } catch (erro: any) {
    console.error("❌ Erro na consulta buscaStatusPedido do repositório:", erro.message);
    throw erro;
  }
}

}