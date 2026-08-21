import { Database } from '../config/sqlLiteConfig.js'; // Mantém a sua classe Singleton estruturada

export class ParametrizacaoRepository {

  async criarCorteFaturamento(dados: any) {
    try {  
      const db = await Database.getConnection();
      
      // 1. Executa o INSERT usando placeholders (?) e o array de dados
      const resultado = await db.run(
        `INSERT INTO corteFaturamentoTipo (descricao) VALUES (?);`,
        [dados.js] // Substitui o antigo dados.js
      );

      // 2. No SQLite, usamos o lastID para buscar o registro inserido se quiser retorná-lo
      if (resultado.lastID) {
        const registroCriado = await db.get(
          `SELECT * FROM corteFaturamentoTipo WHERE id = ?;`,
          [resultado.lastID]
        );
        return registroCriado; // Retorna o objeto literal { id, descricao }
      }
      return null; 

    } catch (erro) {
      console.error("Erro na consulta do repositório (corteFaturamentoTipo):", erro);
      throw erro;
    }
  }

  async criarPlanoComercializado(dados: any) {
    try {  
      const db = await Database.getConnection();
      
      // Ajustado o nome da tabela para bater exatamente com o seu CREATE TABLE antigo: planoComercializadoTipo
      const resultado = await db.run(
        `INSERT INTO planoComercializadoTipo (descricao) VALUES (?);`,
        [dados.js]
      );

      if (resultado.lastID) {
        const registroCriado = await db.get(
          `SELECT * FROM planoComercializadoTipo WHERE id = ?;`,
          [resultado.lastID]
        );
        return registroCriado;
      }
      return null; 

    } catch (erro) {
      console.error("Erro na consulta do repositório (planoComercializadoTipo):", erro);
      throw erro;
    }
  }

  async criarPlanoPagamento(dados: any) {
    try {  
      const db = await Database.getConnection();
      
      const resultado = await db.run(
        `INSERT INTO planoPagamentoTipo (descricao) VALUES (?);`,
        [dados.js]
      );

      if (resultado.lastID) {
        const registroCriado = await db.get(
          `SELECT * FROM planoPagamentoTipo WHERE id = ?;`,
          [resultado.lastID]
        );
        return registroCriado;
      }
      return null; 

    } catch (erro) {
      console.error("Erro na consulta do repositório (planoPagamentoTipo):", erro);
      throw erro;
    }
  }
}

export const parametrizacaoRepository = new ParametrizacaoRepository();
