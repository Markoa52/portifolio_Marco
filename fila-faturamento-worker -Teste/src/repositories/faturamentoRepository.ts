import { Database } from '../config/sqlLiteConfig.js';

export class faturamentoRepository {

  // 4. Insere o registro simples na tabela de relatório linha a linha
  async inserirRegistroFatura(dados: any): Promise<number> {
    const db = await Database.getConnection();
    const query = `
      INSERT INTO billItem (billId, billitemTipo, contractId, dataRegistro, valor, transacaoId, placaVeiculo)
      VALUES (?, ?, ?, datetime('now'), ?, ?, ?);
    `;
    const resultado = await db.run(query, [dados.billId, dados.billitemTipo, dados.contractId, dados.valor, dados.transacaoId, dados.placaVeiculo]); 
    const idGerado = resultado.lastID || 0;

    return idGerado;
    
  }

    async inserirRegistroReportBillItem(dados: any): Promise<void> {
    const db = await Database.getConnection();
    const query = `
      INSERT INTO reportBillItem (billId, billitemTipo, contractId, dataRegistro, valor, transacaoId, placaVeiculo)
      VALUES (?, ?, ?, datetime('now'), ?, ?, ?);
    `;
    await db.run(query, [dados.billId, dados.billitemTipo, dados.contractId, dados.valor, dados.transacaoId, dados.placaVeiculo]);
  }
}
