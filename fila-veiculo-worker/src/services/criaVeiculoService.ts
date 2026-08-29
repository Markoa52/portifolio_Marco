import sql from 'mssql';
import { Database } from '../config/sqlConfig.js'; // Ajuste o caminho para seu novo arquivo de conexão mssql
import { veiculoRepository } from '../repositories/veiculoRepository.js';

const veiculoRepo = new veiculoRepository(); 

class criaVeiculoService {

  async processarCadastroRelacional(dadosDoPedido: any) {

    const { payload } = dadosDoPedido;
    const { js } = payload;
    const { metadata, contextoVeiculo } = js;
    const contratoIdReal = Number(metadata.contratoId);
    
    // Pega o pool de conexões principal do SQL Server
    const pool = await Database.getConnection();
    
    // 1. Cria o objeto de transação oficial do mssql
    const transaction = new sql.Transaction(pool);

    try {
      // 2. Inicia a transação centralizada global no banco
      await transaction.begin();
      console.log('⏳ 1/3 Gerando cadastro do veiculo...');

      // 💡 IMPORTANTE: Passamos a 'transaction' como argumento para o repositório 
      // para que os inserts rodem dentro do mesmo bloco transacional
      const veiculoIdReal = await veiculoRepo.criarVeiculo(contextoVeiculo, contratoIdReal, transaction);

      if (!veiculoIdReal || isNaN(Number(veiculoIdReal))) {
        throw new Error("Falha Crítica: O ID do veículo não foi gerado pelo SQL Server. Abortando conta.");
      }

      console.log('⏳ 2/3 Gerando conta de veiculo......');
      const saldoInicial = Number(contextoVeiculo?.saldoInicial || 0);
      
      // Repassamos a transação aqui também
      const contaIdReal = await veiculoRepo.criarContaVeiculo(veiculoIdReal, saldoInicial, transaction);

      // 3. Se tudo deu certo, confirma as alterações permanentemente
      await transaction.commit();
      console.log(`\n [Sucesso Total] Todo o ecossistema foi salvo para a Conta ID: ${contaIdReal}`);
      return { sucesso: true, contaIdReal };

    } catch (erro) {
  console.error("Erro detectado. Iniciando cancelamento...");
  
  // Tenta o rollback. Se a transação já fechou por erro do banco, ele falha silenciosamente
  try {
    await transaction.rollback();
  } catch (rollbackErro) {
    // Evita travar a aplicação caso o rollback seja redundante
    console.log("Transação já havia sido encerrada pelo banco de dados.");
  }

  console.error("↩[Rollback Executado] Transação cancelada por completo no SQL Server.", erro);
  throw erro; 
}

  }
}

export const CriaVeiculoService = new criaVeiculoService();
