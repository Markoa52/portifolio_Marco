import { Database } from '../config/sqlConfig.js'; // 🛠️ Alterado para a sua configuração do SQL Server
import { ContratoRepository } from '../repositories/cadastroContratoRepository.js';
import sqlServer from 'mssql'; // 👈 Importação obrigatória do driver do SQL Server para gerenciar a transação

const contratoRepository = new ContratoRepository(); 

class CriarContratoService {

  async processarCadastroRelacional(dadosDoPedido: any) {
    // Extrai as camadas do payload que vieram de carona na fila do RabbitMQ
    const payload = dadosDoPedido?.payload || dadosDoPedido;
    const js = payload?.js || payload?.dadosLimpos;

    console.log("👉 DADOS REAIS QUE CHEGARAM DO REACT PARA O WORKER:", JSON.stringify(js, null, 2));
        
    if (!js) {
      throw new Error("[Service] Payload 'js' ou 'dadosLimpos' não fornecido ou indefinido.");
    }

    const { 
      contextoPerson, 
      contextoEndereco, 
      contextoContrato, 
      contextoContato, 
      contextoResposnsavelLegal,
      contextoContaContrato
    } = js;
    
    // Obtém o pool de conexão global do SQL Server
    const pool = await Database.getConnection();
    
    // 🛠️ Cria o objeto de transação nativo e robusto do SQL Server
    const transacao = new sqlServer.Transaction(pool);

    try {
      console.log('⏳ [SQL Server] Iniciando transação relacional complexa de contrato...');
      
      // Abre a transação de forma isolada e segura
      await transacao.begin();

      console.log('⏳ 1/5 Gerando Contrato, Faturamento e Fatura Inicial...');
      // 2. Cria o contrato e captura o ID gerado pelo SCOPE_IDENTITY()
      const contratoId = await contratoRepository.criarContrato(contextoContrato);

      
      const tmContractId = contratoId.tmContractId;
      const contratoFaturamentoId = contratoId.contratoFaturamentoId;

      console.log('⏳ 2/5 Vinculando Empresa ao Contrato...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      contextoPerson.contractId = contratoFaturamentoId; 
      const personId = await contratoRepository.criarPerson(contextoPerson);

        const tmPersonId = personId.tmPersonId;
      const personFaturamentoId = personId.personFaturamentoId;

      console.log('⏳ 3/5 Vinculando Endereço...');
      // 4. Injeta os IDs de relacionamento no endereço antes de salvar
      contextoEndereco.personId = personFaturamentoId; 
      contextoEndereco.contractId = contratoId;
      await contratoRepository.criarEndereco(contextoEndereco);

      console.log('⏳ 4/5 Salvando Responsável Legal...');
      // 5. Injeta os IDs no responsável legal
      contextoResposnsavelLegal.personId = personFaturamentoId;
      await contratoRepository.criarResponsavelLegal(contextoResposnsavelLegal);

      console.log('⏳ 5/5 Processando Canais de Contato...');
      // 6. Cria as linhas de contato associadas
      contextoResposnsavelLegal.personId = personFaturamentoId;
      await contratoRepository.criarContato(contextoContato);

      console.log('⏳ 6/7 Processando Conta contrato...');
      // 7. Cria os contatos se existirem
        await contratoRepository.criarContaContrato(contextoContaContrato, Number(contratoId) );

      // 8. Se nenhuma tabela do fluxo falhou, confirma todas as inserções no disco de vez!
      await transacao.commit();
      
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo no SQL Server para a Person ID: ${personId}`);
      return { sucesso: true, personId };

    } catch (erro) {
      try { 
        // 8. Se qualquer tabela falhar, desfaz e limpa absolutamente TUDO das tabelas do banco
        await transacao.rollback(); 
        console.log("↩️ [SQL Server] Rollback relacional executado com sucesso.");
      } catch (erroRollback) {
        console.error("❌ [SQL Server] Falha catastrófica ao tentar executar o Rollback:", erroRollback);
      }
      
      console.error("❌ [Service] Erro no processamento em cascata. Operação cancelada.", erro);
      throw erro; 
    }
  }
}

export const cadastroContratoService = new CriarContratoService();
