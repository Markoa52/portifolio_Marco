import { Database } from '../config/sqlLiteConfig.js';

export class faturamentoRepository {

  // 4. Insere o registro simples na tabela de relatório linha a linha
  async inserirRegistroFatura(dados: any): Promise<number> {
    const db = await Database.getConnection();
    const query = `
      INSERT INTO billItem (billId, billitemTipo, contractId, dataRegistro, valor, transacaoId, placaVeiculo)
      VALUES (?, ?, ?, ? , ?, ?, ?);
    `;
    const resultado = await db.run(query, [dados.billId, dados.itemTipo, dados.contratoId, dados.dataRegistro, dados.valorDebito, dados.transacaoId, dados.placaVeiculo]); 
    const idGerado = resultado.lastID || 0;

    return idGerado;
    
  }

    async inserirRegistroReportBillItem(dados: any): Promise<void> {
    const db = await Database.getConnection();
    const query = `
      INSERT INTO relatorioBillItem (billItemId, billitemTipo, contratoId, transacaoId, valor)
      VALUES (?, ?, ?, ?, ?);
    `;
    await db.run(query, [dados.billItemId, dados.itemTipo, dados.contratoId, dados.transacaoId, dados.valorDebito]);
  }
}
