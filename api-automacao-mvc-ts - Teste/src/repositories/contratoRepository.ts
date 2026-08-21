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
        planoComercializacao: descricaoComer,
        planoPagamento: descricaoPag
      };
    } catch (error: any) {
      console.error("Erro na query de lookups no SQLite:", error.message);
      throw error;
    }
  }
}