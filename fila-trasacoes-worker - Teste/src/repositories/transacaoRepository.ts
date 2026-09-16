import { DatabaseConnection } from '../config/sqlLiteConfig.js';

export class transacaoRepository {
  // ... seu método atual 'atualizaTagTransferencia' continua aqui ...

  // 1. Busca o saldo atual do contrato
  async buscarSaldoContrato(contratoId: number): Promise<any> {
    const db = await DatabaseConnection.getConnection();
    return await db.get(`SELECT saldoContrato FROM contaContrato WHERE contratoId = ?;`, [contratoId]);
  }

  async buscarSaldoVeiculo(contratoId: number, placa: string): Promise<any> {
    const db = await DatabaseConnection.getConnection();
    return await db.get(`SELECT saldoContaVeiculo FROM contaVeiculo cv inner join veiculo v on cv.veiculoId = v.id WHERE v.contratoId = ? AND placa = ? ;`, [contratoId, placa]);
  }

  // 2. Deduz o valor do saldo do contrato
  async debitarSaldoContrato(contratoId: number, valor: number): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE contaContrato SET saldoContrato = saldoContrato - ? WHERE contratoId = ?;`, [valor, contratoId]);
  }

    async debitarSaldoVeiculo(contratoId: number, valor: number, placa: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE ContaVeiculo set saldoContaVeiculo = saldoContaVeiculo - ? WHERE ID = (SELECT veiculoId FROM contaVeiculo cv inner join veiculo v on cv.veiculoId = v.id WHERE v.contratoId = ? AND placa = ?);`, [valor, contratoId, placa]);
  }

  async reembolsarSaldoContrato(contratoId: number, valor: number): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE contaContrato SET saldoContrato = saldoContrato - ? WHERE contratoId = ?;`, [valor, contratoId]);
  }

  // 3. Insere a transação mestre da passagem
  async inserirTransacaoViagem(dados: any): Promise<any> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO transacaoProcessamento (contratoId, valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, placaVeiculo, transacaoVeiculoTipo, pracaPedagio, documentoEmbarcador, recargaValePedagioId, statusViagemTipo, dataRegistro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
    `;
    const resultado = await db.run(query, [
      dados.contratoId, 
      dados.valorPedagio, 
      dados.valorCobradoPedagio, 
      dados.valorVPR, 
      dados.valorEstorno, 
      dados.placa, 
      dados.transacaoTipo, 
      dados.praca, 
      dados.documento, 
      dados.recargaVPR, 
      dados.status]);

    return resultado.lastID;
  }

  // 4. Insere o registro simples na tabela de relatório linha a linha
  async inserirRelatorioPassagem(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO relatorioPassagem (contratoId, dataInicio, dataFim, valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, pracaPedagio, transacaoProcessamentoId, status, valor, placaVeiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await db.run(query, [dados.contratoId, dados.dataInicio, dados.dataFim, dados.valorPedagio, dados.valorCobradoPedagio, dados.valorVPR, dados.valorEstorno, dados.praca, dados.trasacaoId, dados.status, dados.valor, dados.placa]);

  }

 // 5. Insere o registro simples na tabela de relatório linha a linha
  async inserirRelatorioExtrato(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO relatorioExtrato (contratoId, dataViagem, valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, pracaPedagio, transacaoProcessamentoId, extratoTipo, placaVeiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    await db.run(query, [dados.contratoId, dados.dataInicio, dados.valorPedagio, dados.valorCobradoPedagio, dados.valorVPR, dados.valorEstorno, dados.praca, dados.trasacaoId, dados.extratoTipo, dados.placa]);

  }
}
