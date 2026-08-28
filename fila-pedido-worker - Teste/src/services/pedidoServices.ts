import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { PedidoRepository } from '../repositories/pedidoRepository.js';

const pedidoRepository = new PedidoRepository(); 

export class pedidoServices {

  async processarCadastroRelacional(dadosDoPedido: any) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    const {metadata, contextoPedido} = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    const db = await DatabaseConnection.getConnection();

    try {
      // 1. Inicia a transação centralizada global (Controla todas as tabelas juntas)
      await db.exec('BEGIN TRANSACTION');

      console.log('⏳ 1/2 Gerando Pedido...');
      // 2. Cria o contrato e captura o ID gerado (lastID)
      const pedidoId = await pedidoRepository.criarPedido(contextoPedido, contratoIdReal );

      if (!pedidoId || isNaN(Number(pedidoId))) {
      throw new Error("Falha Crítica: O ID do veículo não foi gerado pelo SQLite. Abortando conta.");
      }

      console.log('⏳ 2/2 Vinculando Rastreamento do pedido...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      const datRegistro = metadata?.criadoEm || new Date().toISOString();
      await pedidoRepository.criarPedidoRastreamento(datRegistro, Number(pedidoId));

      // 4. Se nenhuma query falhou em nenhuma tabela, confirma tudo no disco de vez!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${pedidoId}`);
      return { sucesso: true, pedidoId };

    } catch (erro) {
      // 5. Se qualquer tabela falhar (ex: erro de tipo ou campo nulo), limpa e cancela TUDO
      await db.exec('ROLLBACK');
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const cadastroPedidoService = new pedidoServices();
