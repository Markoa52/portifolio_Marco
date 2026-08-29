import { Database } from '../config/sqlConfig.js'; // 🛠️ Alterado para a sua classe de conexão SQL Server
import { ParametrizacaoRepository } from '../repositories/cadastroParametrizacaoRepository.js';
import sqlServer from 'mssql'; // 👈 Importação obrigatória do driver do SQL Server para gerenciar a transação

const criaParametrizacao = new ParametrizacaoRepository(); 

class Parametrizacao {

  async processarCadastroRelacional(payload: any) {
    // 🔍 Dupla checagem: captura o objeto independente de vir em payload.payload ou payload.dadosLimpos
    const dadosReais = payload?.payload || payload?.dadosLimpos || payload;
    if (!dadosReais) return;

    // Captura o tipo de ação enviado pelo formulário expansível
    const tipo = dadosReais.tipo || payload.task;
    
    // Obtém o pool de conexão global do SQL Server
    const pool = await Database.getConnection();
    
    // 🛠️ Cria o objeto de transação nativo do SQL Server
    const transacao = new sqlServer.Transaction(pool);

    try {
      console.log(`[SQL Server] Iniciando transação para parametrização do tipo [${tipo}]...`);
      
      // Abre a transação no banco de dados
      await transacao.begin();

      // Cenário 1: Corte de Faturamento
      if (tipo === 'tipoCorte' || tipo === 'cadastrar_categoria_pedagio') {
          await criaParametrizacao.criarCorteFaturamento(dadosReais, transacao);
      }
      
      // Cenário 2: Plano Comercializado
      else if (tipo === 'tipoComercializado' || tipo === 'cadastrar_veiculo') {
          await criaParametrizacao.criarPlanoComercializado(dadosReais, transacao);
      }
      
      // Cenário 3: Plano de Pagamento
      else if (tipo === 'tipoPagamento' || tipo === 'cadastrar_regra_tag') {
          await criaParametrizacao.criarPlanoPagamento(dadosReais, transacao);
      }

        // Cenário 4: Status do contrato
      else if (tipo === 'tipoContratoStatus' || tipo === 'cadastrar_regra_tag') {
          await criaParametrizacao.criarStatusContrato(dadosReais, transacao);
      }

       // Cenário 5: Status da fatura
      else if (tipo === 'tipoFaturaStatus' || tipo === 'cadastrar_regra_tag') {
          await criaParametrizacao.criarStatusFatura(dadosReais, transacao);
      }

      // Cenário 6: Tipo do veiculo
      else if (tipo === 'tipoVeiculo') {
          await criaParametrizacao.criarTipoVeiculo(dadosReais, transacao);
      }

      // Cenário 7: Marca do veiculo
      else if (tipo === 'marcaVeiculo') {
          await criaParametrizacao.criarMarcaVeiculo(dadosReais, transacao);
      }

      // Cenário 8: Eixo do veiculo
      else if (tipo === 'eixoVeiculo') {
          await criaParametrizacao.criarEixoVeiculo(dadosReais, transacao);
      }

      // Cenário 9: Transacao do veiculo
      else if (tipo === 'transacaoVeiculo') {
          await criaParametrizacao.criarTransacaoVeiculo(dadosReais, transacao);
      }

      // Conclui e grava as alterações no banco de dados de forma definitiva
      await transacao.commit();
      
      console.log(`[Service] Parametrização do tipo [${tipo}] salva no SQL Server com sucesso!`);
      return { sucesso: true };

    } catch (erro) {
      try { 
        // Se houver qualquer falha ou erro de constraint, desfaz tudo o que foi feito no bloco
        await transacao.rollback(); 
        console.log("[SQL Server] Rollback executado com sucesso.");
      } catch (erroRollback) {
        console.error("[SQL Server] Falha ao tentar executar Rollback:", erroRollback);
      }
      
      console.error("[Service] Erro no processamento. Transação cancelada no SQL Server.", erro);
      throw erro; 
    }
  }
}

export const criaParametrizacaoServices = new Parametrizacao();
