import { Database } from '../config/sqlConfig.js'; // Importe a classe de conexão que criamos
import sqlServer from 'mssql';

export class ParametrizacaoRepository {

  async criarCorteFaturamento(dados: any) {
   
    try {  
        const pool = await Database.getConnection();
        const resultado = await pool.request()
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
async criarPlanoComercializado(dados: any) {
   try {  
        const pool = await Database.getConnection();
        const resultado = await pool.request()
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
   async criarPlanoPagamento(dados: any) {
    try {  
        const pool = await Database.getConnection();
        const resultado = await pool.request()
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
}
export const parametrizacaoRepository = new ParametrizacaoRepository();
