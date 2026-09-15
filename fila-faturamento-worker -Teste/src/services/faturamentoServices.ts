import { Database } from '../config/sqlLiteConfig.js'; 
import { faturamentoRepository } from '../repositories/faturamentoRepository.js';
import amqp from 'amqplib';

const faturamentoRepo = new faturamentoRepository(); 

export class faturamentoService {

  async processarCadastroRelacional(dadosDoPedido: any, canalRabbit?: amqp.Channel) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    
    const db = await Database.getConnection();

    try {
      // 1. Inicia a transação centralizada global (SQLite)
      await db.exec('BEGIN TRANSACTION');

      let transacaoId = payload.id || js.id || 0;

      
        const contratoId = Number(js.contratoId);
        const valorDebito = Number(js.valorCobradoPedagio);

        // 3. Grava o registro da viagem
        const billItemId = await faturamentoRepo.inserirRegistroFatura({
          billId: null,
          billItemTipo: 
          contratoId,
          dataRegistro: new Date,
          valor: valorDebito,   
          id: transacaoId,
          placaVeiculo: js.placaVeiculo || '-'
          
        });

        await faturamentoRepo.inserirRegistroReportBillItem({
          id: billItemId,
          contratoId,
          valor: valorDebito,
          prplacaVeiculo: js.prplacaVeiculo || '-',
          dataRegistro: new Date
        });


      // 2. Se nenhuma query falhou em nenhuma tabela, confirma tudo de vez no arquivo SQLite!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema local foi salvo para a Transação ID: ${transacaoId}`);

      return { sucesso: true, transacaoId };

    } catch (erro) {
      // 3. Se qualquer método do repositório falhar, o rollback desfaz todas as alterações locais
      try { await db.exec('ROLLBACK'); } catch (rbErr) {}
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const faturamento = new faturamentoService();
