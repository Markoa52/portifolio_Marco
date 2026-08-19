// const sql = require('mssql');
// import { contratoRepository } from '../repositories/atualziaParametrizacaoRepository.js';

// class CadastroContratoService {


//   async processarAtualizacaoParcial(payload: any): Promise<{ sucesso: boolean }> {
//     if (!payload.person || !payload.person.id) {
//       throw new Error("O ID da Person é obrigatório para atualizações parciais.");
//     }

//     const pool = await sql.connect();
//     const transaction = new sql.Transaction(pool);

//     try {
//       await transaction.begin();

//       // Dispara a atualização dinâmica mapeada no repositório
//       await contratoRepository.atualizarParcialMultiTabela(payload, transaction);

//       await transaction.commit();
//       console.log(`[Service] Atualização parcial concluída para o ID ${payload.person.id}`);
//       return { sucesso: true };

//     } catch (erro) {
//       await transaction.rollback();
//       console.error("[Service] Erro na atualização parcial. Operação desfeita.", erro);
//       throw erro;
//     }
//   }
// }
// export const cadastroContratoService = new CadastroContratoService();