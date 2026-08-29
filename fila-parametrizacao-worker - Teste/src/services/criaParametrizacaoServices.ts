import { Database } from '../config/sqlLiteConfig.js'; // Importa a sua nova classe de conexão
import { ParametrizacaoRepository } from '../repositories/cadastroParametrizacaoRepository.js' //ContratoRepository'; // Certifique-se de que o repositório exporta assim

const criaParametrizacao = new ParametrizacaoRepository(); 

class Parametrizacao {

  async processarCadastroRelacional(payload: any) {
    const dadosReais = payload.payload;
    if (!dadosReais) return;

    const { tipo } = dadosReais;
    const db = await Database.getConnection();

    try {
      await db.exec('BEGIN TRANSACTION');

      // Cenário 1: Corte de Faturamento
      if (tipo === 'tipoCorte') {
          await criaParametrizacao.criarCorteFaturamento(dadosReais);
      }
      
      // Cenário 2: Plano Comercializado
      else if (tipo === 'tipoComercializado') {
          await criaParametrizacao.criarPlanoComercializado(dadosReais);
      }
      
      // Cenário 3: Plano de Pagamento
      else if (tipo === 'tipoPagamento') {
          await criaParametrizacao.criarPlanoPagamento(dadosReais);
      }

       // Cenário 4: Status do contrato
      else if (tipo === 'tipoContratoStatus') {
          await criaParametrizacao.criarContratoStatus(dadosReais);
      }

      // Cenário 5: Status da fatura
      else if (tipo === 'tipoFaturaStatus') {
          await criaParametrizacao.criarFaturaStatus(dadosReais);
      }

      // Cenário 6: Tipo do veiculo
      else if (tipo === 'tipoVeiculo') {
          await criaParametrizacao.criarTipoVeiculo(dadosReais);
      }

      // Cenário 7: Marca do veiculo
      else if (tipo === 'marcaVeiculo') {
          await criaParametrizacao.criarMarcaVeiculo(dadosReais);
      }

      // Cenário 8: Eixo do veiculo
      else if (tipo === 'eixoVeiculo') {
          await criaParametrizacao.criarEixoVeiculo(dadosReais);
      }

      // Cenário 9: Transacao do veiculo
      else if (tipo === 'transacaoVeiculo') {
          await criaParametrizacao.criarTransacaoVeiculo(dadosReais);
      }



      await db.exec('COMMIT');
      console.log(`[Service] Parametrização do tipo [${tipo}] salva com sucesso!`);
      return { sucesso: true };

    } catch (erro) {
      try { await db.exec('ROLLBACK'); } catch {}
      console.error("[Service] Erro no processamento. Transação cancelada.", erro);
      throw erro; 
    }
}
}


export const criaParametrizacaoServices = new Parametrizacao();
