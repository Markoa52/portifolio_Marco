import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { veiculoRepository } from '../repositories/veiculoRepository.js';

const veiculoRepo = new veiculoRepository(); 

class criaVeiculoService {

  async processarCadastroRelacional(dadosDoPedido: any) {

    const { payload } = dadosDoPedido;
    const { js } = payload;
    const { metadata, contextoVeiculo } = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    const db = await DatabaseConnection.getConnection();

    try {
      // 1. Inicia a transação centralizada global (Controla todas as tabelas juntas)
      await db.exec('BEGIN TRANSACTION');

      console.log('⏳ 1/3 Gerando cadastro do veiculo...');
      // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      const veiculoIdReal = await veiculoRepo.criarVeiculo(contextoVeiculo, contratoIdReal);

      if (!veiculoIdReal || isNaN(Number(veiculoIdReal))) {
      throw new Error("Falha Crítica: O ID do veículo não foi gerado pelo SQLite. Abortando conta.");
    }

      console.log('⏳ 2/3 Gerando conta de veiculo......');
      const saldoInicial = Number(contextoVeiculo?.saldoInicial || 0);
      const contaIdReal = await veiculoRepo.criarContaVeiculo(veiculoIdReal, saldoInicial);

      await db.exec('COMMIT');
      console.log(`\n [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${contaIdReal }`);
      return { sucesso: true, contaIdReal  };

    } catch (erro) {
      // 8. Se qualquer tabela falhar (ex: erro de tipo ou campo nulo), limpa e cancela TUDO
      await db.exec('ROLLBACK');
      console.error("↩[Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const CriaVeiculoService = new criaVeiculoService();
