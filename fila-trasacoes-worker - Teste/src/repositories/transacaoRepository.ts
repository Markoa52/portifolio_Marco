import { DatabaseConnection } from '../config/sqlLiteConfig.js';

export class transacaoRepository {
  // ... seu método atual 'atualizaTagTransferencia' continua aqui ...

  // 1. Busca o saldo atual do contrato
  async buscarSaldoContrato(contratoId: number): Promise<any> {
    const db = await DatabaseConnection.getConnection();
    return await db.get(`SELECT saldoContrato FROM contaContrato WHERE contratoId = ?;`, [contratoId]);
  }

  async buscarSaldoVeiculo(contratoId: number): Promise<any> {
    const db = await DatabaseConnection.getConnection();
    return await db.get(`SELECT saldoVeiculo FROM contaVeiculo WHERE contratoId = ?;`, [contratoId]);
  }

  // 2. Deduz o valor do saldo do contrato
  async debitarSaldoContrato(contratoId: number, valor: number): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE contaContrato SET saldoContrato = saldoContrato - ? WHERE contratoId = ?;`, [valor, contratoId]);

    const query = `
      INSERT INTO transacaoViagem (id, contratoId, valorCobradoPedagio, pracaPedagio, statusViagemTipo, dataGravacao)
      VALUES (?, ?, ?, ?, ?, datetime('now'));
    `;
    //await db.run(query, [dados.id, dados.contratoId, dados.valor, dados.praca, dados.status]);
  }

    async debitarSaldoVeiculo(contratoId: number, valor: number): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE contaContrato SET saldoContrato = saldoContrato - ? WHERE contratoId = ?;`, [valor, contratoId]);

    const query = `
      INSERT INTO transacaoViagem (id, contratoId, valorCobradoPedagio, pracaPedagio, statusViagemTipo, dataGravacao)
      VALUES (?, ?, ?, ?, ?, datetime('now'));
    `;
    //await db.run(query, [dados.id, dados.contratoId, dados.valor, dados.praca, dados.status]);
  }

  async reembolsarSaldoContrato(contratoId: number, valor: number): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    await db.run(`UPDATE contaContrato SET saldoContrato = saldoContrato - ? WHERE contratoId = ?;`, [valor, contratoId]);
  }

  // 3. Insere a transação mestre da passagem
  async inserirTransacaoViagem(dados: any): Promise<number> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO transacaoViagem (contratoId, valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, placaVeiculo, pracaPedagio,  documentoEmbarcador, recargaValePedagioId, statusViagemTipo, dataRegistro)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
    `;
    const resultado = await db.run(query, [dados.contratoId, dados.valorPedagio, dados.valorCobradoPedagio, dados.valorVPR, dados.valorEstorno, dados.placa, dados.transacaoTipo, dados.praca, dados.documento, dados.recargaVPR, dados.status, dados.data]);
    
    const idGerado = resultado.lastID || 0;

    return idGerado;
  }

  // 4. Insere o registro simples na tabela de relatório linha a linha
  async inserirRelatorioPassagem(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO relatorioPassagem (contratoId, dataInicio, dataFim valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, pracaPedagio, transacaoProcessamentoId, status, valor, placaVeiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
    `;
    await db.run(query, [dados.contratoId, dados.dataInicio, dados.dataFim, dados.valorPedagio, dados.valorCobradoPedagio, dados.valorVPR, dados.valorEstorno, dados.praca, dados.trasacaoId, dados.status, dados.valor, dados.placa]);

  }

 // 5. Insere o registro simples na tabela de relatório linha a linha
  async inserirRelatorioExtrato(dados: any): Promise<void> {
    const db = await DatabaseConnection.getConnection();
    const query = `
      INSERT INTO relatorioPassagem (contratoId, dataInicio, dataFim valorTransacaoPedagio, valorCobradoPedagio, valorCobradoValePedagio, valorReembolso, pracaPedagio, transacaoProcessamentoId, status, valor, extratoTipo, placaVeiculo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
    `;
    await db.run(query, [dados.contratoId, dados.dataInicio, dados.valorPedagio, dados.valorCobradoPedagio, dados.valorVPR, dados.valorEstorno, dados.praca, dados.trasacaoId, dados.status, dados.valor, dados.extratoTipo, dados.placa]);

  }
}
