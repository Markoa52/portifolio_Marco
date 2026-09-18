import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { transacaoRepository } from '../repositories/transacaoRepository.js';
import { rabbitMqPublisherInstance } from '../queues/publisher.js';

const transacaoRepo = new transacaoRepository(); 

export class transacaoService {

  async processarCadastroRelacional(dadosDoPedido: any) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    
    const db = await DatabaseConnection.getConnection();

    // 🟢 Criamos variáveis de escopo no topo para que o RabbitMQ consiga lê-las fora do bloco IF
    let idFinalGuardado = 0; 
    let status ='';

    try {
      // 1. Inicia a transação centralizada global (SQLite)
      await db.exec('BEGIN TRANSACTION');

      if (js.contratoId && js.valorTransacao !== undefined) {
        console.log('⏳ 2/2 Processando saldos (Cobrança Mista) via Repositório...');
      
        const contratoId = Number(js.contratoId);
        const placa = String(js.placaVeiculo);
        const valorTotalNecessario = Number(js.valorTransacao); 
        const valorEstorno = Number(js.valorReembolso || 0);
      
        // 1. FLUXO ISOLADO: REEMBOLSO / ESTORNO
        if (valorEstorno > 0) {
          console.log(`💰 [Mecanismo de Reembolso] Devolvendo ${valorEstorno} para o Contrato ${contratoId}`);

          await transacaoRepo.reembolsarSaldoContrato(contratoId, valorEstorno);

          const idGeradoNoBanco = await transacaoRepo.inserirTransacaoViagem({
            contratoId, 
            valorPedagio: js.valorTransacao, 
            valorCobradoPedagio: js.valorCobradoPedagio,
            valorVPR: js.valorCobradoValePedagio,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            transacaoTipo: js.transacaoVeiculoTipo,  
            praca: `REEMBOLSO - ${js.pracaPedagio}`, 
            documento: js.documentoEmbarcador, 
            recargaVPR: js.recargaValePedagioId, 
            status: js.statusViagemTipo, 
            data: js.dataRegistro
          });

          idFinalGuardado = idGeradoNoBanco; // Alimenta o escopo global

          await transacaoRepo.inserirRelatorioExtrato({
            contratoId, 
            data: js.dataViagem, 
            valorPedagio: js.valorTransacao, 
            valorCobrado: js.valorCobradoPedagio, 
            valorVPR: js.valorCobradoValePedagio,  
            valorEstorno: valorEstorno, 
            praca: `REEMBOLSO - ${js.pracaPedagio}`, 
            placa: js.placaVeiculo, 
            id: idGeradoNoBanco, 
            tipo: 'extrato'
          });

          // Confirma o reembolso no banco antes de sair da função
          await db.exec('COMMIT');
          return; 
        }
      
        // 2. BUSCA DE SALDOS ATUAIS
        const registroSaldo = await transacaoRepo.buscarSaldoContrato(contratoId);
        const registroSaldoVeiculo = await transacaoRepo.buscarSaldoVeiculo(contratoId, placa);
      
        if (!registroSaldo) {
          throw new Error(`Falha Crítica: Registro de saldo do contrato não encontrado para o ID ${contratoId}.`);
        }
      
        const saldoContratoDisponivel = Number(registroSaldo.saldoContrato || 0); 
        const saldoVeiculoDisponivel = registroSaldoVeiculo ? Number(registroSaldoVeiculo.saldoContaVeiculo || 0) : 0; 
      
        let valorDebitadoDoContrato = 0;
        let valorDebitadoDoVeiculo = 0;
        let cobrouComSucesso = false;
        let statusFinal = js.statusViagemTipo || 'Processada';
      
        // 3. ENGENHARIA DA COBRANÇA MISTA
        if (saldoContratoDisponivel >= valorTotalNecessario) {
          valorDebitadoDoContrato = valorTotalNecessario;
          cobrouComSucesso = true;
        } 
        else {
          const restanteNecessario = valorTotalNecessario - saldoContratoDisponivel; 
      
          if (saldoVeiculoDisponivel >= restanteNecessario) {
            valorDebitadoDoContrato = saldoContratoDisponivel; 
            valorDebitadoDoVeiculo = restanteNecessario;       
            cobrouComSucesso = true;
            statusFinal = 'Processada - Cobrança Mista';
          } else {
            statusFinal = 'Não processada erro - Saldo Insuficiente Total';
          }
        }

        status = statusFinal;
      
        // 4. EXECUÇÃO DOS DÉBITOS NO BANCO
        if (cobrouComSucesso) {
          if (valorDebitadoDoContrato > 0) {
            await transacaoRepo.debitarSaldoContrato(contratoId, valorDebitadoDoContrato);           
          }
          if (valorDebitadoDoVeiculo > 0) {
            await transacaoRepo.debitarSaldoVeiculo(contratoId, valorDebitadoDoVeiculo, placa);
          }
        }
      
        // 5. GRAVAÇÕES HISTÓRICAS E AUDITORIA
        const idPassagemSucesso = await transacaoRepo.inserirTransacaoViagem({
            contratoId, 
            valorPedagio: valorTotalNecessario, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorVPR: valorDebitadoDoVeiculo,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            transacaoTipo: js.transacaoVeiculoTipo,  
            praca: js.pracaPedagio ? js.pracaPedagio : `REEMBOLSO - ${js.pracaPedagio}`, 
            documento: js.documentoEmbarcador, 
            recargaVPR: js.recargaValePedagioId, 
            statusFinal,
            data: js.dataRegistro
        });
      
        idFinalGuardado = idPassagemSucesso; // Alimenta o escopo global

        if (cobrouComSucesso) {
          if (valorDebitadoDoContrato > 0) {
          await transacaoRepo.inserirRegistroLancamentoContabilConta({
            contaContratoId: registroSaldo.id, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            trasacaoId: idFinalGuardado,
            transacaoTipo: js.trnsacaoContratoTipo || null,
            data: js.dataRegistro       
            });  

          }
          if (valorDebitadoDoVeiculo > 0) {
            await transacaoRepo.inserirRegistroLancamentoContabilVeiculo({
            registroSaldoVeiculo, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            trasacaoId: idFinalGuardado,
            data: js.dataRegistro       
            });  
          }
        }

        if (cobrouComSucesso) {
          await transacaoRepo.inserirRelatorioPassagem({
            contratoId, 
            dataInicio: js.dataRegistro, 
            dataFim: null, 
            valorPedagio: js.valorTransacao, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorVPR: valorDebitadoDoVeiculo,  
            valorEstorno: valorEstorno, 
            praca: js.pracaPedagio,        
            trasacaoId: idPassagemSucesso,
            status: js.statusViagemTipo,
            valor: null,
            placa: js.placaVeiculo,
          });
      
          await transacaoRepo.inserirRelatorioExtrato({
            contratoId, 
            dataInicio: js.dataRegistro, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorPedagio: js.valorTransacao, 
            valorVPR: valorDebitadoDoVeiculo,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            praca: js.pracaPedagio, 
            trasacaoId: idPassagemSucesso,
            extratoTipo: null
          });
        }
      }

      // 2. Se nenhuma query falhou em nenhuma tabela, confirma tudo de vez no arquivo SQLite!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema local foi salvo para a Transação ID: ${idFinalGuardado}`);

      console.log("🔍 [Debug Check] Dados para envio da fila:", {
        contratoId: js?.contratoId,
        valorTransacao: js?.valorTransacao,
        transacaoVeiculoTipo: js?.transacaoVeiculoTipo,
        tipoDesteCampo: typeof js?.transacaoVeiculoTipo
      });

      // --- FASE EXTERNA: ENVIO PARA O SEGUNDO WORKER (Faturamento) ---
      if (rabbitMqPublisherInstance && js.contratoId && js.valorTransacao !== undefined && Number(js.transacaoVeiculoTipo) === 1 && status !== 'Não processada erro - Saldo Insuficiente Total') {
        
        const filaFaturamento = 'reports.v1.trigger.fila-faturamento-cliente';
        const EXCHANGE = 'reports.exchange';
        const ROUTING_KEY = filaFaturamento; 

        const payloadFatura = {
          task: 'registrar-passagem-fatura',
          billId: null,
          billItemTipo: js.transacaoVeiculoTipo,
          contratoId: Number(js.contratoId),
          data: new Date().toISOString(),
          valor: Number(js.valorTransacao),
          passagemId: Number(idFinalGuardado), // 🟢 CORREÇÃO: Usa a variável unificada correta
          placa: js.placaVeiculo || '-'
        };

        await rabbitMqPublisherInstance.publishEvent(EXCHANGE, ROUTING_KEY, payloadFatura);
        console.log(`🚀 [Mensageria] Evento enviado com sucesso para a Exchange: ${EXCHANGE} com o ID primitivo: ${idFinalGuardado}`);
      }

      return { sucesso: true, transacaoId: idFinalGuardado };

    } catch (erro) {
      try { await db.exec('ROLLBACK'); } catch (rbErr) {}
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const transacao = new transacaoService();
