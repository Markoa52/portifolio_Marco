import { Database } from '../config/sqlConfig'; // Garanta que aponta para o seu arquivo central com path.join
import sql from 'mssql';

export class veiculoRepository {

  // Busca os dados de suporte para alimentar as caixas de seleção (Combos) do Frontend
async buscarVeiculoCombos(): Promise<any> {
  try {
    const pool = await Database.getConnection();

    // Executa as consultas do SQL Server em paralelo criando requests individuais
    const [descricaoMarca, descricaoVeiculo, descricaoEixo] = await Promise.all([
      pool.request().query('SELECT id, descricao FROM veiculoMarcaTipo'),
      pool.request().query('SELECT id, descricao FROM veiculoTipo'),
      pool.request().query('SELECT id, descricao FROM eixoTipo')
    ]);

    // Mapeia os retornos extraindo os dados brutos (.recordset)
    return {
      marca: descricaoMarca.recordset,
      veiculoTipo: descricaoVeiculo.recordset,
      eixo: descricaoEixo.recordset
    };
  } catch (error: any) {
    console.error("Erro na query de lookups de veículos no SQL Server:", error.message);
    throw error;
  }
}

async buscaVeiculosPorId(contratoId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contratoId', sql.Int, contratoId)
      .query('SELECT * FROM veiculo WHERE contratoId = @contratoId');
  
    return resultado.recordset || [];
  } catch (erro) {
    console.error("Erro na consulta buscaVeiculosPorId do repositório:", erro);
    throw erro;
  }
}

async buscaVeiculosVPR(contractId: number): Promise<any>{
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contractId', sql.Int, contractId)
      .query(`
        SELECT 
          v.id,
          v.placa,
          v.modelo,
          v.eixo,
          v.tipoveiculo,
          v.status,
          COALESCE(cv.saldoContaVeiculo, 0) AS saldoContaVeiculo
        FROM contaVeiculo cv
        INNER JOIN veiculo v ON cv.veiculoId = v.id
        WHERE v.contratoId = @contractId
      `);
  
    return resultado.recordset || [];
  } catch (erro) {
    console.error("Erro na consulta buscaVeiculosVPR do repositório:", erro);
    throw erro;
  }
}

async buscaSaldoVeiculoVPR(contratoId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contratoId', sql.Int, contratoId)
      .query(`
        SELECT 
          COALESCE(SUM(cv.saldoContaVeiculo), 0) AS total 
        FROM contaVeiculo cv
        INNER JOIN veiculo v ON cv.veiculoId = v.id
        WHERE v.contratoId = @contratoId
      `);
  
    // Como pegamos o primeiro item (.recordset[0]), usamos a interrogação para segurança contra nulos
    return resultado.recordset[0]?.total ?? 0;
  } catch (erro) {
    console.error("Erro na consulta buscaSaldoVeiculoVPR do repositório:", erro);
    throw erro;
  }
 }
}