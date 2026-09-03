import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { usuarioRepository } from '../repositories/usuarioRepository.js';

const usuarioRepo = new usuarioRepository(); 

class usuarioService {

  async processarCadastroRelacional(dadosDoUsuario: any) {

    const { payload } = dadosDoUsuario;
    const { js } = payload;
    const { metadata, contextoUsuario } = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    const db = await DatabaseConnection.getConnection();

    try {
      // 1. Inicia a transação centralizada global (Controla todas as tabelas juntas)
      await db.exec('BEGIN TRANSACTION');

     let usuario="";

      if(js.metadata.tipoAcao==='novoUsuario'){
      console.log('⏳ 1/4 Gerando cadastro do usuario...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      const usuario = await usuarioRepo.salvarNovoUsuario(payload);

      if (!isNaN(Number(usuario))) {
      throw new Error("Falha Crítica: O usuario não foi gerado pelo SQLite");
    }
  }

    if(js.contextoUsuario.tipoAcao==='vincularContrato'){
       console.log('⏳ 2/4 Vincular contrato ao usuário......');
       await usuarioRepo.vincularContrato(payload);
    }

    if(js.metadata.tipoAcao==='atualizarUsuario'){
      console.log('⏳ 3/4 Gerando cadastro do usuario...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      const usuario = await usuarioRepo.atualizarUsuario(payload);

      if (!isNaN(Number(usuario))) {
      throw new Error("Falha Crítica: O usuario não foi gerado pelo SQLite");
      }
     }

      if(js.contextoUsuario.tipoAcao==='ativarInativar'){
       console.log('⏳ 4/4 InativarAtivar usuário......');
       await usuarioRepo.inativarAtivarUsuario(contextoUsuario);
    }

      await db.exec('COMMIT');
      console.log(`\n [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${usuario }`);
      return { sucesso: true, usuario};

    } catch (erro) {
      // 8. Se qualquer tabela falhar (ex: erro de tipo ou campo nulo), limpa e cancela TUDO
      await db.exec('ROLLBACK');
      console.error("↩[Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const UsuarioService = new usuarioService();
