import { Database } from '../config/sqlLiteConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class veiculoRepository {

  // Busca os dados de suporte para alimentar as caixas de seleção (Combos) do Frontend
  async buscarVeiculoCombos(): Promise<any> {
    try {
      const db = await Database.getConnection();

      // Executa as consultas do SQLite em paralelo usando o método db.all()
      const [descricaoMarca, descricaoVeiculo, descricaoEixo] = await Promise.all([
        db.all('SELECT id, descricao FROM veiculoMarcaTipo'),
        db.all('SELECT id, descricao FROM veiculoTipo'), // Ajustado nome da tabela
        db.all('SELECT id, descricao FROM eixoTipo')
      ]);

      // Retorna a estrutura limpa diretamente, sem precisar de .recordset
      return {
        marca: descricaoMarca,
        veiculoTipo: descricaoVeiculo,
        eixo: descricaoEixo
      };
    } catch (error: any) {
      console.error("Erro na query de lookups no SQLite:", error.message);
      throw error;
    }
  }
    async buscaVeiculosPorId(contratoId: number): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.all(
        'SELECT * FROM veiculo WHERE contratoId = ?', [contratoId] );
    
      return resultado || null;
    } catch (erro) {
      console.error("Erro na consulta buscaDadosDoContrato do repositório:", erro);
      throw erro;
    }
  }

    async buscaVeiculosVPR(contractId: number): Promise<any>{
     try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.all(`SELECT 
       v.id, -- Garanta que o ID primário do veículo está sendo trazido aqui
       v.placa,
       v.modelo,
       v.eixo,
       v.tipoveiculo,
       v.status,
       COALESCE(cv.saldoContaVeiculo, 0) AS saldoContaVeiculo
       FROM contaVeiculo cv
       INNER JOIN veiculo v ON cv.veiculoId = v.id
       WHERE v.contratoId = ?`, [contractId] );
    
      return resultado || 0;
    } catch (erro) {
      console.error("Erro na consulta contaContrato do repositório:", erro);
      throw erro;
    }
  }

    async buscaSaldoVeiculoVPR(contratoId: number): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação
      const resultado = await db.get(`
      SELECT 
        COALESCE(SUM(cv.saldoContaVeiculo), 0) AS total 
      FROM contaVeiculo cv
      INNER JOIN veiculo v ON cv.veiculoId = v.id
      WHERE v.contratoId = ?
    `, [contratoId]);
    
      return resultado?.total || 0;
    } catch (erro) {
      console.error("Erro na consulta buscaDadosDoContrato do repositório:", erro);
      throw erro;
    }
  }
}