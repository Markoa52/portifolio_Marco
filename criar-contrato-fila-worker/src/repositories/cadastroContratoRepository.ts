const sql = require('mssql');

class ContratoRepository {
  // Cria a empresa (Person) e retorna o ID gerado pelo SQL Server
  async criarPerson(personData: any, transaction: any) {

    const request = new sql.Request(transaction);
    request.input('cnpj', sql.VarChar, personData.cnpj);
    request.input('nomeEmpresa', sql.VarChar, personData.nomeEmpresa);

    const query = `
      INSERT INTO person (cnpj, nome_empresa) VALUES (@cnpj, @nomeEmpresa);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const resultado = await request.query(query);
    return resultado.recordset[0].id; // Retorna o ID gerado
  }

  async criarEndereco(enderecoData: any, personId: any, transaction: any) {
    const request = new sql.Request(transaction);
    request.input('cep', sql.VarChar, enderecoData.cep);
    request.input('rua', sql.VarChar, enderecoData.rua);
    request.input('numero', sql.VarChar, enderecoData.numero);
    request.input('complemento', sql.VarChar, enderecoData.complemento);
    request.input('bairro', sql.VarChar, enderecoData.bairro);
    request.input('cidade', sql.VarChar, enderecoData.cidade);
    request.input('estado', sql.VarChar, enderecoData.estado);
    request.input('personId', sql.Int, personId);

    const query = `
      INSERT INTO endereco (cep, rua, numero, complemento, bairro, cidade, estado, person_id)
      VALUES (@cep, @rua, @numero, @complemento, @bairro, @cidade, @estado, @personId);
    `;
    await request.query(query);
  }

  async criarContrato(contratoData: any, personId: any, transaction: any) {
    const request = new sql.Request(transaction);
    request.input('dataInicio', sql.Date, contratoData.dataInicio || null);
    request.input('planoComercializado', sql.VarChar, contratoData.planoComercializado);
    request.input('valorMensalidade', sql.Decimal(10, 2), contratoData.valorMensalidade);
    request.input('valorTag', sql.Decimal(10, 2), contratoData.valorTag);
    request.input('planoPagamento', sql.VarChar, contratoData.planoPagamento);
    request.input('dataCorteFaturamento', sql.Date, contratoData.dataCorteFaturamento || null);
    request.input('diaFaturamento', sql.Int, contratoData.diaFaturamento);
    request.input('personId', sql.Int, personId);

    const query = `
      INSERT INTO contrato (data_inicio, plano_comercializado, valor_mensalidade, valor_tag, plano_pagamento, data_corte_faturamento, dia_faturamento, person_id)
      VALUES (@dataInicio, @planoComercializado, @valorMensalidade, @valorTag, @planoPagamento, @dataCorteFaturamento, @diaFaturamento, @personId);
    `;
    await request.query(query);
  }

  async criarContato(tipo: any, valor: any, personId: any, transaction: any) {
    const request = new sql.Request(transaction);
    request.input('tipo', sql.VarChar, tipo);
    request.input('valor', sql.VarChar, valor);
    request.input('personId', sql.Int, personId);

    const query = `
      INSERT INTO telefone (tipo, valor, person_id) VALUES (@tipo, @valor, @personId);
    `;
    await request.query(query);
  }
}

module.exports = new ContratoRepository();
