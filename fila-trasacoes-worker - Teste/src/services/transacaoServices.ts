import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { transacaoRepository } from '../repositories/transacaoRepository.js';
import amqp from 'amqplib';

const transacaoRepo = new transacaoRepository(); 

export class transacaoService {

  async processarCadastroRelacional(dadosDoPedido: any, canalRabbit?: amqp.Channel) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    
    const db = await DatabaseConnection.getConnection();

    try {
      // 1. Inicia a transação centralizada global (SQLite)
      await db.exec('BEGIN TRANSACTION');

      //let transacaoId = payload.id || js.id || 0;

      if (js.contratoId && js.valorCobradoPedagio !== undefined) {
        console.log('⏳ 2/2 Processando saldos (Cobrança Mista) via Repositório...');
      
        const contratoId = Number(js.contratoId);
        const valorTotalNecessario = Number(js.valorTransacao); // Ex: 150
        const valorEstorno = Number(js.valorReembolso || 0);
      
        // 1. FLUXO ISOLADO: REEMBOLSO / ESTORNO
        if (valorEstorno > 0) {
          console.log(`💰 [Mecanismo de Reembolso] Devolvendo ${valorEstorno} para o Contrato ${contratoId}`);

          await transacaoRepo.reembolsarSaldoContrato(contratoId, valorEstorno);

          const transacaoId = await transacaoRepo.inserirTransacaoViagem({
            contratoId, valorPedagio: js.valorTransacao, valorVPR: js.valorCobradoValePedagio,  valorEstorno: valorEstorno, placa: js.placaVeiculo, 
            transacaoTipo: js.transacaoVeiculoTipo,  praca: `REEMBOLSO - ${js.pracaPedagio}`, documento: js.documentoEmbarcador, recargaVPR: js.recargaValePedagio, 
            status: js.statusViagemTipo, data: js.dataRegistro
          });
          await transacaoRepo.inserirRelatorioExtrato({
            contratoId, data: js.dataViagem, valorPedagio: js.valorTransacao, valorCobrado: js.valorCobradoPedagio, valorVPR: js.valorCobradoValePedagio,  valorEstorno: valorEstorno, 
            praca: `REEMBOLSO - ${js.pracaPedagio}`, placa: js.placaVeiculo, id: transacaoId, tipo: 'extrato'
          });
          return; // Encerra o fluxo de reembolso
        }
      
        // 2. BUSCA DE SALDOS ATUAIS
        const registroSaldo = await transacaoRepo.buscarSaldoContrato(contratoId);
        const registroSaldoVeiculo = await transacaoRepo.buscarSaldoVeiculo(contratoId);
      
        if (!registroSaldo) {
          throw new Error(`Falha Crítica: Registro de saldo do contrato não encontrado para o ID ${contratoId}.`);
        }
      
        const saldoContratoDisponivel = Number(registroSaldo.saldoContrato || 0); // Ex: 50
        const saldoVeiculoDisponivel = registroSaldoVeiculo ? Number(registroSaldoVeiculo.saldoVeiculo || 0) : 0; // Ex: 200
      
        let valorDebitadoDoContrato = 0;
        let valorDebitadoDoVeiculo = 0;
        let cobrouComSucesso = false;
        let statusFinal = js.statusViagemTipo || 'Processada';
      
        // 3. ENGENHARIA DA COBRANÇA MISTA
        if (saldoContratoDisponivel >= valorTotalNecessario) {
          // Cenário A: O contrato cobre tudo sozinho (150 de 150)
          valorDebitadoDoContrato = valorTotalNecessario;
          cobrouComSucesso = true;
        } 
        else {
          // Cenário B: O contrato não cobre tudo. Vamos ver se o veículo cobre o RESTANTE
          const restanteNecessario = valorTotalNecessario - saldoContratoDisponivel; // Ex: 150 - 50 = 100
      
          if (saldoVeiculoDisponivel >= restanteNecessario) {
            // O veículo tem saldo suficiente para pagar o que sobrou (ex: tem 200, só precisa de 100)
            valorDebitadoDoContrato = saldoContratoDisponivel; // Raspa os 50 do contrato
            valorDebitadoDoVeiculo = restanteNecessario;       // Pega os 100 do veículo
            cobrouComSucesso = true;
            statusFinal = 'Processada - Cobrança Mista';
          } else {
            // Cenário C: Mesmo juntando o saldo do contrato + veículo, não dá para pagar os 150
            statusFinal = 'Não processada erro - Saldo Insuficiente Total';
          }
        }
      
        // 4. EXECUÇÃO DOS DÉBITOS NO BANCO (Apenas se a cobrança foi autorizada)
        if (cobrouComSucesso) {
          if (valorDebitadoDoContrato > 0) {
            await transacaoRepo.debitarSaldoContrato(contratoId, valorDebitadoDoContrato);
          }
          if (valorDebitadoDoVeiculo > 0) {
            await transacaoRepo.debitarSaldoVeiculo(contratoId, valorDebitadoDoVeiculo);
          }
        }
      
        // 5. GRAVAÇÕES HISTÓRICAS E AUDITORIA (Mantém o rastro no banco independente de ter saldo ou não)
        const transacao = await transacaoRepo.inserirTransacaoViagem({
            contratoId, 
            valorPedagio: valorTotalNecessario, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorVPR: valorDebitadoDoVeiculo,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            transacaoTipo: js.transacaoVeiculoTipo,  
            praca: `REEMBOLSO - ${js.pracaPedagio}`, 
            documento: js.documentoEmbarcador, 
            recargaVPR: js.recargaValePedagio, 
            status: js.statusViagemTipo,
            data: js.dataRegistro
        });
      
        if (cobrouComSucesso) {
          await transacaoRepo.inserirRelatorioPassagem({
            contratoId, 
            dataInicio: js.dataRegistro, 
            dataFim: null, 
            valorPedagio: js.valorTransacao, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorVPR: js.valorCobradoValePedagio,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            praca: js.pracaPedagio, 
            trasacaoId: transacao,
            status: js.statusViagemTipo,
            valor: null
          });
      
          // Registra no extrato detalhado o débito total aplicado
          await transacaoRepo.inserirRelatorioExtrato({
            contratoId, 
            dataInicio: js.dataRegistro, 
            valorCobradoPedagio: valorDebitadoDoContrato,
            valorPedagio: js.valorTransacao, 
            valorVPR: js.valorCobradoValePedagio,  
            valorEstorno: valorEstorno, 
            placa: js.placaVeiculo, 
            praca: js.pracaPedagio, 
            trasacaoId: transacao,
            extratoTipo: null
          });
        }
      }

      // 2. Se nenhuma query falhou em nenhuma tabela, confirma tudo de vez no arquivo SQLite!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema local foi salvo para a Transação ID: ${transacao}`);

      // --- FASE EXTERNA: ENVIO PARA O SEGUNDO WORKER (Faturamento) ---
      if (canalRabbit && js.contratoId && js.valorCobradoPedagio !== undefined) {
        const filaFaturamento = 'fila-faturamento-cliente';
        await canalRabbit.assertQueue(filaFaturamento, { durable: true });

        const payloadFatura = {
          task: 'registrar-passagem-fatura',
          passagemId: transacao,
          contratoId: Number(js.contratoId),
          valorA_Faturar: Number(js.valorCobradoPedagio),
          documentoCliente: js.documentoEmbarcador || '',
          detalhes: `Passagem em ${js.pracaPedagio || 'Praça Não Informada'}`
        };

        canalRabbit.sendToQueue(filaFaturamento, Buffer.from(JSON.stringify(payloadFatura)), { persistent: true });
        console.log(`🚀 [Mensageria] Evento enviado para a '${filaFaturamento}'`);
      }

      return { sucesso: true, transacao };

    } catch (erro) {
      // 3. Se qualquer método do repositório falhar, o rollback desfaz todas as alterações locais
      try { await db.exec('ROLLBACK'); } catch (rbErr) {}
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const transacao = new transacaoService();
