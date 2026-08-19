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
}
