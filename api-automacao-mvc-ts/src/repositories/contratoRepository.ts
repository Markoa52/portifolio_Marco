// contratoRepository.ts (Alterado a extensão para .ts se usa tipos)
import { Database } from '../config/sqlConfig.js'; // Importe a classe de conexão que criamos
import sqlServer from 'mssql';

export class ContratoRepository {
  
  // 1. CORREÇÃO: Função assíncrona real conectada ao seu SQL Server
  async findById(contractId: number): Promise<any> {
    try {
      // Abre ou reaproveita o pool de conexão do banco
      const pool = await Database.getConnection();
      
      // 2. CORREÇÃO: Query parametrizada com @ para evitar SQL Injection
      const resultado = await pool.request()
          .input('idInput', sqlServer.Int, contractId)
          .query('SELECT * FROM contract WHERE Id = @idInput');
          
      // Retorna a primeira linha encontrada ou null se não houver registros
      if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
      }
      
      return null;
    } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
  }

    async findAll(): Promise<any> {
    try {
      // Abre ou reaproveita o pool de conexão do banco
      const pool = await Database.getConnection();
      
      // 2. CORREÇÃO: Query parametrizada com @ para evitar SQL Injection
      const resultado = await pool.request()
          .query('SELECT * FROM contract');
          
      // Retorna a primeira linha encontrada ou null se não houver registros
      if (Array.isArray(resultado.recordset) && resultado.recordset.length > 0) {
          return resultado.recordset[0];
      }
      
      return null;
    } catch (erro) {
      console.error("Erro na consulta do repositório:", erro);
      throw erro;
    }
  }

  // O método não recebe req/res, ele apenas busca e devolve os dados crus!
  async buscarCondicoesComerciaisCombos(): Promise<any> {
    try {
      const pool = await Database.getConnection(); // Ajuste conforme sua conexão

      // Executa as consultas do SQL Server em paralelo para alimentar todos os combos de vez
      const [descricaoCorte, descricaoComer, descricaoPag] = await Promise.all([
        pool.request().query('SELECT id, descricao FROM corteFaturamentoTipo'),
        pool.request().query('SELECT id, descricao FROM planoComercializacaoTipo'),
        pool.request().query('SELECT id, descricao FROM planoPagamentoTipo')
      ]);

      // Retorna a caixa de dicionários descompactada do recordset
      return {
        corteFaturamento: descricaoCorte.recordset,
        planoComercializacao: descricaoComer.recordset,
        planoPagamento: descricaoPag.recordset
      };
    } catch (error: any) {
      console.error("Erro na query de lookups no SQL Server:", error.message);
      throw error; // Lança o erro para a Controller capturar no catch
    }
  }
}
