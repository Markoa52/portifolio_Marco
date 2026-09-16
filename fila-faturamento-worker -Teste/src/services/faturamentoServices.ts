import { Database } from '../config/sqlLiteConfig.js'; 
import { faturamentoRepository } from '../repositories/faturamentoRepository.js';

const faturamentoRepo = new faturamentoRepository(); 

export class faturamentoService {

  async processarCadastroRelacional(dadosDoPedido: any) {
    // O seu publicador envelopa os dados dentro de 'payload'
    const payload = dadosDoPedido.payload || dadosDoPedido;
    
    const db = await Database.getConnection();

    try {
      // 1. Inicia a transação centralizada global (SQLite)
      await db.exec('BEGIN TRANSACTION');

      // 🟢 CORREÇÃO 1: Mapeamento direto do payload enviado pela fila do Worker 1
      const transacaoId = Number(payload.passagemId || 0);
      const contratoId = Number(payload.contratoId || 0);
      const valorDebito = Number(payload.valor || 0);
      const placaVeiculo = payload.placa || '-';
      const itemTipo = payload.billItemTipo || 'Passagem';

      console.log(`⏳ [Worker 2] Processando faturamento para a Transação ID: ${transacaoId}`);

      // 🟢 CORREÇÃO 2: Grava o registro principal da fatura (billItem)
      const billItemId = await faturamentoRepo.inserirRegistroFatura({
        billId: null,
        itemTipo,
        contratoId,
        dataRegistro: payload.data || new Date().toISOString(), // Fallback caso não venha data
        valorDebito,
        transacaoId,
        placaVeiculo
      });

      // 🟢 CORREÇÃO 3: Gravação do Histórico/Relatório linha a linha da Fatura
      // Substitua 'inserirHistoricoFaturamento' pelo nome real do seu método de logs/relatórios se for diferente
      if (typeof faturamentoRepo.inserirRegistroReportBillItem === 'function') {
        await faturamentoRepo.inserirRegistroReportBillItem({
          billItemId, // Usa o ID auto-incremental gerado na inserção acima
          itemTipo,
          contratoId,
          transacaoId,
          valorDebito
        });
      } else {
        console.log(`[Worker 2] ℹ️ Ignorando segunda gravação ou ajuste o método no repositório.`);
      }

      // 2. Confirma as gravações no arquivo SQLite
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Faturamento salvo para a Transação ID: ${transacaoId} | BillItem: ${billItemId}`);

      return { sucesso: true, transacaoId };

    } catch (erro) {
      // 3. Em caso de erro, desfaz as alterações para manter a consistência
      try { await db.exec('ROLLBACK'); } catch (rbErr) {}
      console.error("↩️ [Rollback Executado] Faturamento cancelado no SQLite.", erro);
      throw erro; 
    }
  }
}

export const faturamento = new faturamentoService();
