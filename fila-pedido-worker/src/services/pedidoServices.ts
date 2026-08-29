import sql from 'mssql';
import { Database } from '../config/sqlConfig.js'; 
import { PedidoRepository } from '../repositories/pedidoRepository.js';

const pedidoRepository = new PedidoRepository(); 

export class pedidoServices {

  async processarCadastroRelacional(dadosDoPedido: any) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    const { metadata, contextoPedido } = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    const pool = await Database.getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      console.log('⏳ [SQL Server] Iniciando transação relacional de pedidos...');
      await transaction.begin();

      console.log('⏳ 1/2 Gerando Pedido...');
      const pedidoId = await pedidoRepository.criarPedido(contextoPedido, contratoIdReal, transaction);

      if (!pedidoId || isNaN(Number(pedidoId))) {
        throw new Error("Falha Crítica: O ID do pedido não foi gerado pelo SQL Server. Abortando rastreamento.");
      }

      console.log('⏳ 2/2 Vinculando Rastreamento do pedido...');
      const datRegistro = metadata?.criadoEm || new Date().toISOString();
      await pedidoRepository.criarPedidoRastreamento(datRegistro, Number(pedidoId), transaction);

      await transaction.commit();
      
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema de pedidos foi salvo para o Pedido ID: ${pedidoId}`);
      return { sucesso: true, pedidoId };

    } catch (erro) {
      // 💡 CORREÇÃO DEFINITIVA PARA O TYPESCRIPT:
      // Tenta o rollback. Se a transação já foi cancelada pelo banco, o catch interno impede a quebra da aplicação.
      try {
        await transaction.rollback();
        console.log("↩️ [SQL Server] Rollback relacional de pedidos executado.");
      } catch (erroRollback) {
        // Ignora silenciosamente se o erro for apenas de transação já fechada
        console.log("ℹ️ Transação já havia sido encerrada ou cancelada pelo banco.");
      }
      
      console.error("❌ [Service] Erro no processamento de pedidos. Operação cancelada por completo.", erro);
      throw erro; 
    }
  }
}

export const cadastroPedidoService = new pedidoServices();
