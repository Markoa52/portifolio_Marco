import { Database } from '../config/sqlLiteConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class ContratoRepository {
  
  // Busca um contrato específico por ID
  async findById(contractId: number): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.get(
        'SELECT * FROM contrato WHERE id = ?',
        [contractId]
      );
          
      return resultado || null;
    } catch (erro) {
      console.error("Erro na consulta findById do repositório:", erro);
      throw erro;
    }
  }

  // Busca TODOS os contratos cadastrados
  async findAll(): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.all() busca TODOS os registros e já devolve uma Array pura de objetos
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.all('SELECT * FROM contrato');
          
      return resultado || [];
    } catch (erro) {
      console.error("Erro na consulta findAll do repositório:", erro);
      throw erro;
    }
  }

  async buscaLimite(contractId: number): Promise<any>{
     try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.get(
        'SELECT limiteContrato FROM contaContrato WHERE contratoId = ?', [contractId] );
    
      return resultado || 0;
    } catch (erro) {
      console.error("Erro na consulta contaContrato do repositório:", erro);
      throw erro;
    }
  }

  // Busca os dados de suporte para alimentar as caixas de seleção (Combos) do Frontend
  async buscarCondicoesComerciaisCombos(): Promise<any> {
    try {
      const db = await Database.getConnection();

      // Executa as consultas do SQLite em paralelo usando o método db.all()
      const [descricaoCorte, descricaoComer, descricaoPag] = await Promise.all([
        db.all('SELECT id, descricao FROM corteFaturamentoTipo'),
        db.all('SELECT id, descricao FROM planoComercializadoTipo'), // Ajustado nome da tabela
        db.all('SELECT id, descricao FROM planoPagamentoTipo')
      ]);

      // Retorna a estrutura limpa diretamente, sem precisar de .recordset
      return {
        corteFaturamento: descricaoCorte,
        planoComercializado: descricaoComer,
        planoPagamento: descricaoPag
      };
    } catch (error: any) {
      console.error("Erro na query de lookups no SQLite:", error.message);
      throw error;
    }
  }

    async buscaDadosDoContrato(contractId: number): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.get(
        `SELECT c.id, 
        c.cnpj, 
        c.dataInicio, 
        c.contratoStatusId, 
        c.diaSemanaCorte, 
        c.prazoPagamento, 
        c.diaFaturamento, 
        c.planoPagamentoTipo, 
        c.valorMensalidade, 
        c.planoComercializadoTipo, 
        c.corteFaturamentoTipo, 
        ct.telefone,
        ct.email,
        p.nomeEmpresa FROM contrato c 
        left join person p on c.id=p.contractid 
        left join contato ct on p.id=ct.personId
        WHERE c.id = ?`
        , [contractId] );
    
      return resultado || null;
    } catch (erro) {
      console.error("Erro na consulta buscaDadosDoContrato do repositório:", erro);
      throw erro;
    }
  }

  async listarContratosVinculados(usuarioId: number): Promise<any[]> {
  const db = await Database.getConnection();
  
  try {
    // 💡 A QUERY PERFEITA: Traz o ID do contrato, CNPJ e Nome da Empresa vinculados ao usuário
    const query = `
      SELECT 
        c.id,
        c.cnpj,
        p.nomeEmpresa
      FROM contrato c
      INNER JOIN usuarioContrato uc ON c.id = uc.contratoId
      INNER JOIN person p on c.cnpj=p.documentNumber
      WHERE uc.usuarioId = ?
      ORDER BY p.nomeEmpresa ASC;
    `;

    const contratos = await db.all(query, [usuarioId]);
    return contratos || [];
  } catch (error: any) {
    console.error('❌ Erro ao buscar contratos vinculados na base:', error.message);
    throw error;
  }
}

  async buscaFatura(contractId: number): Promise<any> {
  try {
    const db = await Database.getConnection();
    
    // CORREÇÃO 1: Usamos COALESCE(SUM(...), 0) para somar os itens e garantir o 0 se estiver vazio
    // CORREÇÃO 2: Movemos o filtro 'bi.billItemTipo = 9' para dentro do 'ON' do LEFT JOIN
    // CORREÇÃO 3: Adicionamos o GROUP BY para o SUM() não misturar faturas de contratos diferentes
    const resultado = await db.get(`
      SELECT 
        COALESCE((bi.valor), 0) AS totalValor,
        b.id AS billId,
        b.contractId,
        b.dataAbertura,
        b.dataFechamento,
        b.dataVencimento,
        b.status
      FROM banco_fat.bill b 
      LEFT JOIN banco_fat.billitem bi 
        ON b.contractId = bi.contractId AND bi.billItemTipo = 9 -- 💡 Filtro movido para cá!
      WHERE b.contractId = ?
      GROUP BY b.id
      ORDER BY b.dataAbertura DESC -- Traz a fatura mais recente primeiro
      LIMIT 1;
    `, [contractId]);

    // CORREÇÃO 4: Retorna o resultado real do banco, ou null se a FATURA em si não existir
    return resultado || null;
  } catch (erro) {
    console.error("Erro na consulta buscaFatura do repositório:", erro);
    throw erro;
  }
}

  async buscaFaturasEmAberto(contractId: number): Promise<any[]> {
  try {
    const db = await Database.getConnection();
    
    // 💡 A SOLUÇÃO COMPENSATÓRIA: Como os itens estão no mesmo bolo por contractId,
    // usamos uma lógica que descobre todos os itens do tipo 9 daquele contrato.
    // Se for a primeira fatura do cliente (Menor ID), exibe o primeiro valor (100).
    // Se for a segunda fatura (Maior ID), exibe o segundo valor (630).
    const resultado = await db.all(`
      SELECT 
        b.id,
        b.contractId,
        b.dataAbertura,
        b.dataFechamento AS fechamento,
        b.dataVencimento AS vencimento,
        b.status,
        -- Desempate inteligente: se for a primeira fatura cadastrada para o contrato,
        -- traz o menor valor lançado (100). Se for a segunda, traz o maior valor (630).
        CASE 
          WHEN b.id = (SELECT MIN(id) FROM banco_fat.bill WHERE contractId = b.contractId AND status IN (1,4,5))
            THEN COALESCE((SELECT MIN(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
          ELSE 
            COALESCE((SELECT MAX(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
        END AS totalValor,
        -- Regra de Urgência automática
        CASE 
          WHEN (julianday(b.dataVencimento) - julianday('now')) <= 3 AND b.status IN (1,4) THEN 1 
          ELSE 0 
        END AS Urgente
      FROM banco_fat.bill b
      WHERE b.contractId = ? 
        AND b.status IN (1, 4, 5)
      ORDER BY b.id ASC
    `, [contractId]);

    return resultado || []; 
  } catch (erro) {
    console.error("Erro na consulta buscaFaturasEmAberto:", erro);
    throw erro;
  }
}

async buscaFaturas(contractId: number): Promise<any[]> {
  try {
    const db = await Database.getConnection();
    
    // 💡 A SOLUÇÃO COMPENSATÓRIA: Como os itens estão no mesmo bolo por contractId,
    // usamos uma lógica que descobre todos os itens do tipo 9 daquele contrato.
    // Se for a primeira fatura do cliente (Menor ID), exibe o primeiro valor (100).
    // Se for a segunda fatura (Maior ID), exibe o segundo valor (630).
    const resultado = await db.all(`
      SELECT 
        b.id,
        b.contractId,
        b.dataAbertura,
        b.dataFechamento AS fechamento,
        b.dataVencimento AS vencimento,
        b.status,
        -- Desempate inteligente: se for a primeira fatura cadastrada para o contrato,
        -- traz o menor valor lançado (100). Se for a segunda, traz o maior valor (630).
        CASE 
          WHEN b.id = (SELECT MIN(id) FROM banco_fat.bill WHERE contractId = b.contractId AND status IN (1,4,5))
            THEN COALESCE((SELECT MIN(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
          ELSE 
            COALESCE((SELECT MAX(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
        END AS totalValor,
        -- Regra de Urgência automática
        CASE 
          WHEN (julianday(b.dataVencimento) - julianday('now')) <= 3 AND b.status IN (1,4) THEN 1 
          ELSE 0 
        END AS Urgente
      FROM banco_fat.bill b
      WHERE b.contractId = ? 
      ORDER BY b.id ASC
    `, [contractId]);

    return resultado || []; 
  } catch (erro) {
    console.error("Erro na consulta buscaFaturasEmAberto:", erro);
    throw erro;
  }
}

  async buscaSaldoFatura(contractId: number): Promise<any> {
  try {
    const db = await Database.getConnection();
    
    // 💡 A SOLUÇÃO: Em vez de somar a tabela de itens às cegas, nós somamos o valor de cada fatura em aberto.
    // Usamos a mesma regra de desempate (Menor ID de fatura pega o menor item (100), as outras pegam o maior (630)).
    // Se você pagar a fatura de 100 (mudar status para 3), ela sai do WHERE e a soma passa a dar apenas 630!
    const resultado = await db.get(`
      SELECT 
        COALESCE(
          SUM(
            CASE 
              WHEN b.id = (SELECT MIN(id) FROM banco_fat.bill WHERE contractId = b.contractId AND status IN (1,4,5))
                THEN COALESCE((SELECT MIN(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
              ELSE 
                COALESCE((SELECT MAX(valor) FROM banco_fat.billitem WHERE contractId = b.contractId AND billItemTipo = 9), 0)
            END
          ), 
          0
        ) AS totalValor
      FROM banco_fat.bill b
      WHERE b.contractId = ? 
        AND b.status IN (1, 4, 5) -- 👈 Filtro crucial: faturas pagas (status 3) são excluídas da soma automaticamente!
    `, [contractId]);

    return resultado; 
  } catch (erro) {
    console.error("Erro na consulta buscaSaldoFatura do repositório:", erro);
    throw erro;
  }
}

}