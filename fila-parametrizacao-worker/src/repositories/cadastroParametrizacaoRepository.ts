import { Database } from '../config/sqlConfig.js'; // Importe a classe de conexão que criamos
import sqlServer from 'mssql';

export class ParametrizacaoRepository {

  async criarCorteFaturamento(dados: any, transaction: sqlServer.Transaction) {

   const request = new sqlServer.Request(transaction);

    try {  

        const resultado = await request
        .input('descricao', sqlServer.Text, dados.js)
        .query(`INSERT INTO corteFaturamentoTipo (descricao) VALUES (@descricao);`);

        if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
         }
         return null; 

   } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
}

// Removido o parâmetro transaction, pois o SQLite usa a mesma conexão "db"
async criarPlanoComercializado(dados: any, transaction: sqlServer.Transaction) {

  const request = new sqlServer.Request(transaction);

   try {  

        const resultado = await request
        .input('descricao', sqlServer.Text, dados.js)
        .query(`INSERT INTO planoComercializadoTipo (descricao) VALUES (@descricao);`);

        if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
         }
         return null; 

   } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
}
   async criarPlanoPagamento(dados: any, transaction: sqlServer.Transaction) {

    const request = new sqlServer.Request(transaction);

    try {  

        const resultado = await request
        .input('descricao', sqlServer.Text, dados.js)
        .query(`INSERT INTO planoPagamentoTipo (descricao) VALUES (@descricao);`);

        if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
         }
         return null; 

   } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
 }

    async criarStatusContrato(dados: any, transaction: sqlServer.Transaction) {

      const request = new sqlServer.Request(transaction);

    try {  

        const resultado = await request
        .input('descricao', sqlServer.Text, dados.js)
        .query(`INSERT INTO contratoStatusTipo (descricao) VALUES (@descricao);`);

        if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
         }
         return null; 

   } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
 }

  async criarStatusFatura(dados: any, transaction: sqlServer.Transaction) {

    const request = new sqlServer.Request(transaction);

    try {  

        const resultado = await request
        .input('descricao', sqlServer.Text, dados.js)
        .query(`INSERT INTO FinancialBilling.dbo.billStatusTipo (descricao) VALUES (@descricao);`);

        if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
         }
         return null; 

   } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
 }

 async criarTipoVeiculo(dados: any, transaction: sqlServer.Transaction) {

  const request = new sqlServer.Request(transaction);

  try {  
    
    // OUTPUT INSERTED.* retorna a linha criada na hora
    const resultado = await request
      .input('descricao', sqlServer.VarChar, dados.js)
      .query(`
        INSERT INTO veiculoTipo (descricao) 
        OUTPUT INSERTED.* 
        VALUES (@descricao);
      `);

    // Retorna o registro criado diretamente (primeira posição do recordset) ou null
    return resultado.recordset[0] || null; 

  } catch (erro) {
    console.error("Erro na consulta do repositório (criarTipoVeiculo):", erro);
    throw erro;
  }
}

async criarMarcaVeiculo(dados: any, transaction: sqlServer.Transaction) {

  const request = new sqlServer.Request(transaction);

  try {  
    
    const resultado = await request
      .input('descricao', sqlServer.VarChar, dados.js)
      .query(`
        INSERT INTO veiculoMarcaTipo (descricao) 
        OUTPUT INSERTED.* 
        VALUES (@descricao);
      `);

    return resultado.recordset[0] || null; 

  } catch (erro) {
    console.error("Erro na consulta do repositório (criarMarcaVeiculo):", erro);
    throw erro;
  }
}

async criarEixoVeiculo(dados: any, transaction: sqlServer.Transaction) {

  const request = new sqlServer.Request(transaction);

  try {  
    
    const resultado = await request
      .input('descricao', sqlServer.VarChar, dados.js)
      .query(`
        INSERT INTO eixoTipo (descricao) 
        OUTPUT INSERTED.* 
        VALUES (@descricao);
      `);

    return resultado.recordset[0] || null; 

  } catch (erro) {
    console.error("Erro na consulta do repositório (criarEixoVeiculo):", erro);
    throw erro;
  }
}

async criarTransacaoVeiculo(dados: any, transaction: sqlServer.Transaction) {

  const request = new sqlServer.Request(transaction);

  try {  
    
    const resultado = await request
      .input('descricao', sqlServer.VarChar, dados.js)
      .query(`
        INSERT INTO transacaoVeiculoTipo (descricao) 
        OUTPUT INSERTED.* 
        VALUES (@descricao);
      `);

    return resultado.recordset[0] || null; 

  } catch (erro) {
    console.error("Erro na consulta do repositório (criarTransacaoVeiculo):", erro);
    throw erro;
  }
}

}
export const parametrizacaoRepository = new ParametrizacaoRepository();
