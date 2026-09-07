import sql from 'mssql';
import { Database } from '../config/sqlConfig.js'; 
import { usuarioRepository } from '../repositories/usuarioRepository.js';

const usuarioRepo = new usuarioRepository(); 

class usuarioService {

  async processarCadastroRelacional(dadosDoUsuario: any) {
    const { payload } = dadosDoUsuario;
    const { js } = payload;
    const { metadata, contextoUsuario } = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    // 1. Obtém o pool de conexões do SQL Server
    const pool = await Database.getConnection();
    
    // 2. Cria a instância de transação isolada do mssql
    const transaction = new sql.Transaction(pool);
    let transacaoIniciada = false;

    try {
      // 3. Inicia a transação centralizada global
      await transaction.begin();
      transacaoIniciada = true;
      console.log('⚡ Transação iniciada com sucesso no SQL Server.');

      let usuarioIdRetorno: any = "";

      if (js.metadata.tipoAcao === 'novoUsuario') {
        console.log('⏳ 1/4 Gerando cadastro do usuário no SQL Server...');
        // 💡 Passamos a 'transaction' como argumento para o repositório
        usuarioIdRetorno = await usuarioRepo.salvarNovoUsuario(payload, transaction);

        // Correção lógica: Se NÃO vier um ID válido, dispara o erro
        if (!usuarioIdRetorno || isNaN(Number(usuarioIdRetorno))) {
          throw new Error("Falha Crítica: O usuário não foi gerado pelo SQL Server");
        }
      }

      if (js.contextoUsuario.tipoAcao === 'vincularContrato') {
         console.log('⏳ 2/4 Vincular contrato ao usuário no SQL Server...');
         await usuarioRepo.vincularContrato(payload, transaction);
      }

      if (js.metadata.tipoAcao === 'atualizarUsuario') {
        console.log('⏳ 3/4 Gerando atualização do usuário no SQL Server...');
        usuarioIdRetorno = await usuarioRepo.atualizarUsuario(payload, transaction);

        if (!usuarioIdRetorno || isNaN(Number(usuarioIdRetorno))) {
          throw new Error("Falha Crítica: O usuário não foi atualizado pelo SQL Server");
        }
      }

      if (js.contextoUsuario.tipoAcao === 'ativarInativar') {
         console.log('⏳ 4/4 Inativar/Ativar usuário no SQL Server...');
         await usuarioRepo.inativarAtivarUsuario(contextoUsuario, transaction);
      }

      // 4. Confirma todas as alterações no banco de dados de vez
      await transaction.commit();
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo para o Usuário ID: ${usuarioIdRetorno}`);
      return { sucesso: true, usuario: usuarioIdRetorno };

    } catch (erro) {
      // 5. Se qualquer operação falhar, desfaz tudo de forma segura
      if (transacaoIniciada) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error("⚠️ Falha ao tentar executar o rollback da transação:", rollbackError);
        }
      }
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQL Server.", erro);
      throw erro; 
    }
  }
}

export const UsuarioService = new usuarioService();
