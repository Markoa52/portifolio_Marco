// contratoRepository.ts (Alterado a extensão para .ts se usa tipos)
import { Database } from '../config/sqlConfig'; // Importe a classe de conexão que criamos
import sqlServer from 'mssql';

export class ContratoRepository {
  
 // Busca um contrato específico por ID
async findById(contractId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    // sqlServer Server usa parâmetros nomeados (ex: @contractId) em vez de '?'
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query('SELECT * FROM contrato WHERE id = @contractId');
        
    // Retorna o primeiro registro encontrado ou null se estiver vazio
    return resultado.recordset[0] || null;
  } catch (erro) {
    console.error("Erro na consulta findById do repositório:", erro);
    throw erro;
  }
}

// Busca TODOS os contratos cadastrados
async findAll(): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .query('SELECT * FROM contrato');
        
    // Retorna a lista pura de objetos
    return resultado.recordset || [];
  } catch (erro) {
    console.error("Erro na consulta findAll do repositório:", erro);
    throw erro;
  }
}

async buscaLimite(contractId: number): Promise<any>{
   try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query('SELECT limiteContrato FROM contaContrato WHERE contratoId = @contractId');
  
    // Retorna o primeiro registro ou 0 se não encontrar nada
    return resultado.recordset[0] || 0;
  } catch (erro) {
    console.error("Erro na consulta contaContrato do repositório:", erro);
    throw erro;
  }
}

// Busca os dados de suporte para alimentar as caixas de seleção (Combos) do Frontend
async buscarCondicoesComerciaisCombos(): Promise<any> {
  try {
    const pool = await Database.getConnection();

    // Executa as consultas do sqlServer Server em paralelo criando requests individuais
    const [descricaoCorte, descricaoComer, descricaoPag] = await Promise.all([
      pool.request().query('SELECT id, descricao FROM corteFaturamentoTipo'),
      pool.request().query('SELECT id, descricao FROM planoComercializadoTipo'),
      pool.request().query('SELECT id, descricao FROM planoPagamentoTipo')
    ]);

    // Mapeia os retornos pegando apenas os dados brutos (.recordset)
    return {
      corteFaturamento: descricaoCorte.recordset,
      planoComercializado: descricaoComer.recordset,
      planoPagamento: descricaoPag.recordset
    };
  } catch (error: any) {
    console.error("Erro na query de lookups no sqlServer Server:", error.message);
    throw error;
  }
}

async buscaDadosDoContrato(contractId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query('SELECT c.id, p.nomeEmpresa FROM contrato c LEFT JOIN person p ON c.id = p.contractid WHERE c.id = @contractId');
  
    return resultado.recordset[0] || null;
  } catch (erro) {
    console.error("Erro na consulta buscaDadosDoContrato do repositório:", erro);
    throw erro;
  }
}

async buscaFatura(contractId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    // Substituído LIMIT 1 por TOP 1 e ajustado o GROUP BY exigido pelo sqlServer Server
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query(`
        SELECT TOP 1
          COALESCE((bi.valor), 0) AS totalValor,
          b.id AS billId,
          b.contractId,
          b.dataAbertura,
          b.dataFechamento,
          b.dataVencimento,
          b.status
        FROM FinancialBilling.dbo.bill b 
        LEFT JOIN FinancialBilling.dbo.billitem bi 
          ON b.contractId = bi.contractId AND bi.billItemTipo = 9
        WHERE b.contractId = @contractId
        GROUP BY 
          bi.valor, b.id, b.contractId, b.dataAbertura, b.dataFechamento, b.dataVencimento, b.status
        ORDER BY b.dataAbertura DESC;
      `);

    return resultado.recordset[0] || null;
  } catch (erro) {
    console.error("Erro na consulta buscaFatura do repositório:", erro);
    throw erro;
  }
}

async buscaFaturasEmAberto(contractId: number): Promise<any[]> {
  try {
    const pool = await Database.getConnection();
    
    // Convertido julianday para DATEDIFF e 'now' para GETDATE()
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query(`
        SELECT 
          b.id,
          b.contractId,
          b.dataAbertura,
          b.dataFechamento AS fechamento,
          b.dataVencimento AS vencimento,
          b.status,
          CASE 
            WHEN b.id = (SELECT MIN(id) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND status IN (1,4,5))
              THEN COALESCE((SELECT MIN(valor) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
            ELSE 
              COALESCE((SELECT MAX(valor) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
          END AS totalValor,
          -- Regra de Urgência usando DATEDIFF no sqlServer Server
          CASE 
            WHEN DATEDIFF(day, GETDATE(), b.dataVencimento) <= 3 AND b.status IN (1,4) THEN 1 
            ELSE 0 
          END AS Urgente
        FROM FinancialBilling.dbo.bill b
        WHERE b.contractId = @contractId 
          AND b.status IN (1, 4, 5)
        ORDER BY b.id ASC
      `);

    return resultado.recordset || []; 
  } catch (erro) {
    console.error("Erro na consulta buscaFaturasEmAberto:", erro);
    throw erro;
  }
}

async buscaFaturas(contractId: number): Promise<any[]> {
  try {
    const pool = await Database.getConnection();
    
    // Aplicada a mesma correção do DATEDIFF e GETDATE() da query anterior
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query(`
        SELECT 
          b.id,
          b.contractId,
          b.dataAbertura,
          b.dataFechamento AS fechamento,
          b.dataVencimento AS vencimento,
          b.status,
          CASE 
            WHEN b.id = (SELECT MIN(id) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND status IN (1,4,5))
              THEN COALESCE((SELECT MIN(valor) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
            ELSE 
              COALESCE((SELECT MAX(valor) FROM FinancialBilling.dbo.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
          END AS totalValor,
          -- Regra de Urgência usando DATEDIFF no sqlServer Server
          CASE 
            WHEN DATEDIFF(day, GETDATE(), b.dataVencimento) <= 3 AND b.status IN (1,4) THEN 1 
            ELSE 0 
          END AS Urgente
        FROM FinancialBilling.dbo.bill b
        WHERE b.contractId = @contractId 
        ORDER BY b.id ASC
      `);

    return resultado.recordset || []; 
  } catch (erro) {
    console.error("Erro na consulta buscaFaturas:", erro);
    throw erro;
  }
}

async buscaSaldoFatura(contractId: number): Promise<any> {
  try {
    const pool = await Database.getConnection();
    
    const resultado = await pool.request()
      .input('contractId', sqlServer.Int, contractId)
      .query(`
        SELECT 
          COALESCE(SUM(CalculoItem.ValorFatura), 0) AS totalValor
        FROM FinancialBilling.dbo.bill b -- 💡 Tabela principal correta (fatura)
        CROSS APPLY (
          -- O CROSS APPLY isola as subqueries por linha, limpando o escopo do SUM externo
          SELECT 
            CASE 
              WHEN b.id = (
                SELECT MIN(inner_b.id) 
                FROM FinancialBilling.dbo.bill inner_b 
                WHERE inner_b.contractId = b.contractId AND inner_b.status IN (1,4,5)
              )
              THEN COALESCE((
                SELECT MIN(bi.valor) 
                FROM FinancialBilling.dbo.billitem bi 
                WHERE bi.contractId = b.contractId AND bi.billItemTipo = 9
              ), 0)
              ELSE COALESCE((
                SELECT MAX(bi.valor) 
                FROM FinancialBilling.dbo.billitem bi 
                WHERE bi.contractId = b.contractId AND bi.billItemTipo = 9
              ), 0)
            END AS ValorFatura
        ) AS CalculoItem
        WHERE b.contractId = @contractId 
          AND b.status IN (1, 4, 5); -- 💡 Agora o status existe pois estamos filtrando a tabela 'bill'
      `);

    // Retorna a primeira linha encontrada ou um objeto zerado por padrão
    return resultado.recordset[0] || { totalValor: 0 }; 
  } catch (erro) {
    console.error("Erro na consulta buscaSaldoFatura do repositório:", erro);
    throw erro;
  }
}

}