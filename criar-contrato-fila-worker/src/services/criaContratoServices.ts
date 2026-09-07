import sql from 'mssql';
import { Database } from '../config/sqlConfig.js'; 
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
      contextoResposnsavelLegal,
      contextoContaContrato
    } = js;
    
    // 1. Obtém o pool de conexões do SQL Server
    const pool = await Database.getConnection();
    
    // 2. Cria uma instância de transação isolada do mssql
    const transaction = new sql.Transaction(pool);
    
    // Variável de controle para o TypeScript saber se a transação chegou a começar
    let transacaoIniciada = false;

    try {
      // 3. Inicia a transação centralizada global no SQL Server
      await transaction.begin();
      transacaoIniciada = true; // Define como true apenas após o sucesso do .begin()
      console.log('⚡ Transação iniciada com sucesso no SQL Server.');

      console.log('⏳ 1/7 Gerando Contrato e Faturamento...');
      const contratoId = await contratoRepository.criarContrato(contextoContrato, transaction);

      console.log('⏳ 2/7 Vinculando Empresa ao Contrato...');
      contextoPerson.contractId = contratoId;
      const personId = await contratoRepository.criarPerson(contextoPerson, transaction);

      console.log('⏳ 3/7 Vinculando Endereço...');
      contextoEndereco.personId = personId;
      contextoEndereco.contractId = contratoId;
      await contratoRepository.criarEndereco(contextoEndereco, transaction);

      console.log('⏳ 4/7 Salvando Responsável Legal...');
      contextoResposnsavelLegal.personId = personId;
      await contratoRepository.criarResponsavelLegal(contextoResposnsavelLegal, transaction);

      console.log('⏳ 5/7 Processando Canais de Contato...');
      contextoContato.personId = personId;
      await contratoRepository.criarContato(contextoContato, transaction);

      console.log('⏳ 6/7 Processando Conta contrato...');
      await contratoRepository.criarContaContrato(contextoContaContrato, Number(contratoId), transaction);

      // 4. Se todas as tabelas foram inseridas com sucesso, confirma tudo no banco!
      await transaction.commit();
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${personId}`);
      return { sucesso: true, personId };

    } catch (erro) {
      // 5. Se qualquer tabela falhar, desfaz TODAS as alterações automaticamente
      // Usamos a nossa flag de controle para fazer o rollback de forma totalmente segura
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

export const cadastroContratoService = new CriarContratoService();
