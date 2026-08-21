import { Database } from '../config/sqlLiteConfig.js'; 
import { ContratoRepository } from '../repositories/cadastroContratoRepository.js';

const contratoRepository = new ContratoRepository(); 

class CriarContratoService {

  async processarCadastroRelacional(dadosDoPedido: any) {
    const { payload } = dadosDoPedido;
    const { js } = payload;
        
    const { 
      contextoPerson, 
      contextoEndereco, 
      contextoContrato, 
      contextoContato, 
      contextoResposnsavelLegal 
    } = js;
    
    const db = await Database.getConnection();

    try {
      // 1. Inicia a transação centralizada global (Controla todas as tabelas juntas)
      await db.exec('BEGIN TRANSACTION');

      console.log('⏳ 1/5 Gerando Contrato e Faturamento...');
      // 2. Cria o contrato e captura o ID gerado (lastID)
      const contratoId = await contratoRepository.criarContrato(contextoContrato);

      console.log('⏳ 2/5 Vinculando Empresa ao Contrato...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      contextoPerson.contractId = contratoId;
      const personId = await contratoRepository.criarPerson(contextoPerson);

      console.log('⏳ 3/5 Vinculando Endereço...');
      // 4. Injeta os IDs de relacionamento no endereço antes de salvar
      contextoEndereco.personId = personId;
      contextoEndereco.contractId = contratoId;
      //contextoPerson.documentNumber = contextoContrato.cnpj;
      await contratoRepository.criarEndereco(contextoEndereco);

      console.log('⏳ 4/5 Salvando Responsável Legal...');
      // 5. Injeta o personId no responsável legal
      contextoResposnsavelLegal.personId = personId;
      //contextoPerson.documentNumber = contextoContrato.cnpj;
      await contratoRepository.criarResponsavelLegal(contextoResposnsavelLegal);

      console.log('⏳ 5/5 Processando Canais de Contato...');
      // 6. Cria os contatos se existirem
        contextoContato.personId = personId;
        await contratoRepository.criarContato(contextoContato);

      // 7. Se nenhuma query falhou em nenhuma tabela, confirma tudo no disco de vez!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${personId}`);
      return { sucesso: true, personId };

    } catch (erro) {
      // 8. Se qualquer tabela falhar (ex: erro de tipo ou campo nulo), limpa e cancela TUDO
      await db.exec('ROLLBACK');
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const cadastroContratoService = new CriarContratoService();
