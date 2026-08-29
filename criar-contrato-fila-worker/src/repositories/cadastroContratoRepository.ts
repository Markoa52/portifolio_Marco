import { Database } from '../config/sqlConfig.js'; // 🛠️ Alterado para a sua configuração do SQL Server
import sqlServer from 'mssql'; // 👈 Importação obrigatória do driver do SQL Server

export class ContratoRepository {

  async criarContrato(contratoData: any) {
    // Obtém a conexão global mapeada do SQL Server
    const pool = await Database.getConnection();

    try {
        // ==========================================
        // 1. GRAVAÇÃO NO BANCO PRINCIPAL
        // ==========================================
        // No SQL Server, capturamos o ID gerado na hora usando a instrução SELECT SCOPE_IDENTITY()
        const queryPrincipal = `
          INSERT INTO contrato (
            dataInicio, dataEncerramento, CorteFaturamentoTipo, planoComercializadoTipo,
            valorMensalidade, valorTag, planoPagamentoTipo, diaFaturamento, diaSemanaCorte, 
            cnpj, prazoPagamento, contratoStatusId
          )
          VALUES (
            @dataInicio, @dataEncerramento, @corteFaturamento, @planoComercializado,
            @valorMensalidade, @valorTag, @planoPagamento, @diaFaturamento, @diaSemana, 
            @cnpj, @prazoPagamento, @contratoStatusId
          );
          SELECT SCOPE_IDENTITY() AS lastID;
        `;

        // Monta a requisição parametrizada (Blindada contra SQL Injection)
        const requestPrincipal = pool.request()
          .input('dataInicio', sqlServer.VarChar(18), contratoData.dataInicio)
          .input('dataEncerramento', sqlServer.VarChar(18), contratoData.dataEncerramento || null)
          .input('corteFaturamento', sqlServer.Int, contratoData.corteFaturamento)
          .input('planoComercializado', sqlServer.Int, contratoData.planoComercializado)
          .input('valorMensalidade', sqlServer.Decimal(10, 2), contratoData.valorMensalidade)
          .input('valorTag', sqlServer.Decimal(10, 2), contratoData.valorTag)
          .input('planoPagamento', sqlServer.Int, contratoData.planoPagamento)
          .input('diaFaturamento', sqlServer.Int, contratoData.diaFaturamento)
          .input('diaSemana', sqlServer.Int, contratoData.diaSemana)
          .input('cnpj', sqlServer.VarChar(18), contratoData.cnpj || contratoData.documentNumber || contratoData.documento || null)
          .input('prazoPagamento', sqlServer.Int, contratoData.prazoPagamento)
          .input('contratoStatusId', sqlServer.Int, contratoData.statusContrato || 1);

        const resultadoPrincipal = await requestPrincipal.query(queryPrincipal);
        
        // Captura o ID auto-incremental gerado pelo SQL Server
        const tmContractId = resultadoPrincipal.recordset[0].lastID;

        // ==========================================
        // 2. GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
        // ==========================================
        // Nota: No SQL Server, a sintaxe de banco anexado usa o padrão 'nome_banco.schema.tabela' (Ex: banco_fat.dbo.contrato_faturamento)
        const queryFaturamento = `
          INSERT INTO FinancialBilling.dbo.contrato_faturamento (
            dataInicio, dataEncerramento, CorteFaturamentoTipo, planoComercializadoTipo, 
            valorMensalidade, valorTag, planoPagamentoTipo, diaFaturamento, diaSemanaCorte,
            cnpj, tmContractId, prazoPagamento, contratoStatusId
          ) 
          VALUES (
            @dataInicio, @dataEncerramento, @corteFaturamento, @planoComercializado, @valorMensalidade, @valorTag, @planoPagamento, @diaFaturamento, @diaSemana,
            @cnpj, @tmContractId, @prazoPagamento, @contratoStatusId
          );
          SELECT SCOPE_IDENTITY() AS lastID;
        `;
        
        const requestFaturamento = pool.request()
          .input('dataInicio', sqlServer.VarChar(18), contratoData.dataInicio)
          .input('dataEncerramento', sqlServer.VarChar(18), contratoData.dataEncerramento || null)
          .input('corteFaturamento', sqlServer.Int, contratoData.corteFaturamento)
          .input('planoComercializado', sqlServer.Int, contratoData.planoComercializado)
          .input('valorMensalidade', sqlServer.Decimal(10, 2), contratoData.valorMensalidade)
          .input('valorTag', sqlServer.Decimal(10, 2), contratoData.valorTag)
          .input('planoPagamento', sqlServer.Int, contratoData.planoPagamento)
          .input('diaFaturamento', sqlServer.Int, contratoData.diaFaturamento)
          .input('diaSemana', sqlServer.Int, contratoData.diaSemana)
          .input('cnpj', sqlServer.VarChar(18), contratoData.cnpj || contratoData.documentNumber || contratoData.documento || null)
          .input('tmContractId', sqlServer.Int, tmContractId) // Vincula o ID gerado pelo passo anterior
          .input('prazoPagamento', sqlServer.Int, contratoData.prazoPagamento)
          .input('contratoStatusId', sqlServer.Int, 1);

        const resultadoFaturamento = await requestFaturamento.query(queryFaturamento);
        const contratoFaturamentoId = resultadoFaturamento.recordset[0].lastID;

        // ==========================================
        // 3. LOGICA DE GRAVAÇÃO DA FATURA (Preparação)
        // ==========================================
        // Converte a string de dataInicio para um objeto Date real do JavaScript
        const dataBase = new Date(`${contratoData.dataInicio}T12:00:00`);
        
        let dataFechamentoStr = '';
        let dataVencimentoStr = '';
        
        const dataFechamento = new Date(dataBase);
        
        // CÁLCULO DO FECHAMENTO (Baseado no Corte e no Dia do Faturamento)
        const tipoCorte = Number(contratoData.corteFaturamento);

        switch (tipoCorte) {
            case 1: // CASO: CORTE SEMANAL EM DIA ESPECÍFICO (Seg, Ter, Qua...)
            const diaSemanaDesejado = Number(contratoData.diaSemana); 
            
            // Descobre em qual dia da semana a data de início caiu (0 a 6)
            const diaSemanaAtual = dataFechamento.getDay(); 

            // Calcula quantos dias faltam para chegar no dia escolhido pelo cliente
            let diasAteProximoFechamento = (diaSemanaDesejado - diaSemanaAtual + 7) % 7;
            
            // Se o dia do contrato for o próprio dia do corte, agenda para a próxima semana (+7 dias)
            if (diasAteProximoFechamento === 0) {
              diasAteProximoFechamento = 7;
            }

            // 2. REGRA DE MÍNIMO DE DIAS (A MÁGICA):
            // Se a distância até a próxima segunda for menor que 7 dias (ciclo incompleto),
            // nós jogamos o fechamento para a segunda-feira da OUTRA semana (+7 dias).
            if (diasAteProximoFechamento < 5) {
              diasAteProximoFechamento += 7;
            }

            dataFechamento.setDate(dataFechamento.getDate() + diasAteProximoFechamento);
            break;

          case 2: // Exemplo: Corte de 15 dias corrido
            dataFechamento.setDate(dataFechamento.getDate() + 15);
            break;

          case 3: // Exemplo: Corte de 30 dias corrido
            dataFechamento.setDate(dataFechamento.getDate() + 30);
            break;

          default:
            // CASO PADRÃO: DIA FIXO DO MÊS (Ex: Todo dia 05, dia 10 ou fim do mês)
            if (contratoData.diaFaturamento && Number(contratoData.diaFaturamento) > 0) {
              const diaEscolhido = Number(contratoData.diaFaturamento);
              dataFechamento.setDate(diaEscolhido);

              // TRAVA MENSAL: Se a data fixa escolhida resultar em menos de 10 dias de uso 
              // a partir de hoje, a primeira fatura pula automaticamente para o mês seguinte!
              const diferencaDias = (dataFechamento.getTime() - dataBase.getTime()) / (1000 * 60 * 60 * 24);
              
              if (diferencaDias < 10) {
                dataFechamento.setMonth(dataFechamento.getMonth() + 1);
                dataFechamento.setDate(diaEscolhido); // Garante o dia no mês seguinte
              }

              // Proteção padrão para meses curtos (Fevereiro/Abril)
              if (dataFechamento.getDate() !== diaEscolhido) {
                dataFechamento.setDate(0); 
              }
            } else {
              // SE NÃO TIVER DIA FIXO: Fecha no ÚLTIMO DIA do mês atual.
              dataFechamento.setMonth(dataFechamento.getMonth() + 1);
              dataFechamento.setDate(0); 

              // TRAVA DE FIM DE MÊS: Se o contrato foi criado nos últimos 5 dias do mês,
              // acumula o uso e só fecha no último dia do PRÓXIMO mês.
              const hojeDia = dataBase.getDate();
              const ultimoDia = dataFechamento.getDate();
              if ((ultimoDia - hojeDia) < 5) {
                dataFechamento.setMonth(dataFechamento.getMonth() + 1);
                dataFechamento.setDate(0);
              }
            }
        }
        
        // Converte para String ISO limpa 'YYYY-MM-DD'
        dataFechamentoStr = dataFechamento.toISOString().split('T')[0] ?? '';
        
        // =========================================================================
        // 4. CÁLCULO DO VENCIMENTO (Baseado no Prazo de Pagamento)
        // =========================================================================
        const dataVencimento = new Date(dataFechamento);
        
        if (contratoData.prazoPagamento != null && Number(contratoData.prazoPagamento) > 0) {
          dataVencimento.setDate(dataVencimento.getDate() + Number(contratoData.prazoPagamento));
        } else {
          dataVencimento.setDate(dataVencimento.getDate() + 1);
        }
        dataVencimentoStr = dataVencimento.toISOString().split('T')[0] ?? '';
        
        // =========================================================================
        // 5. EXECUÇÃO DA INSERÇÃO DA FATURA (banco_fat.dbo.bill)
        // =========================================================================
        const queryFaturamentoBill = `
          INSERT INTO FinancialBilling.dbo.bill (contractId, dataAbertura, dataFechamento, dataVencimento, 
          status) 
          VALUES (@contractId, @dataAbertura, @dataFechamento, @dataVencimento, @status);
        `;

        const requestBill = pool.request()
          .input('contractId', sqlServer.Int, contratoFaturamentoId)
          .input('dataAbertura', sqlServer.Date, contratoData.dataInicio || "")
          .input('dataFechamento', sqlServer.Date, dataFechamentoStr)
          .input('dataVencimento', sqlServer.Date, dataVencimentoStr)
          .input('status', sqlServer.Int, 1); // 1 = Aberto/Pendente

        await requestBill.query(queryFaturamentoBill);

        console.log(`✅ Bill Gerada com sucesso! Fechamento: ${dataFechamentoStr} | Vencimento: ${dataVencimentoStr}`);
        return {
  tmContractId,            // ID do banco principal (TollManagement)
  contratoFaturamentoId    // ID do banco de faturamento (FinancialBilling)
};

    } catch (error: any) {
      console.error("❌ Erro no processamento do Contrato Repository:", error.message);
      throw error;
    }
  }

  // =========================================================================
  // 6. INSERÇÃO NA TABELA PERSON (SQL SERVER)
  // =========================================================================
  async criarPerson(personData: any) {
    const pool = await Database.getConnection();

    // No SQL Server, estruturamos os parâmetros nomeados e mantemos a subquery de ID
    const query = `
      INSERT INTO person (documentNumber, nomeEmpresa, contractId) 
      VALUES (
        @documentNumber, 
        @nomeEmpresa, 
        (SELECT TOP 1 id FROM contrato WHERE cnpj = @cnpj)
      );
      SELECT SCOPE_IDENTITY() AS lastID;
    `;
    // =========================================================================
    // EXECUÇÃO DA INSERÇÃO DA PESSOA (banco_principal.dbo.person)
    // =========================================================================
    const requestPerson = pool.request()
      .input('documentNumber', sqlServer.VarChar(18), personData.cnpj)
      .input('nomeEmpresa', sqlServer.VarChar(18), personData.nomeEmpresa)
      .input('cnpj', sqlServer.VarChar(18), personData.cnpj || personData.documentNumber || personData.documento || null)

    const resultadoPerson = await requestPerson.query(query);
    
    // Guardamos o ID que o banco principal acabou de gerar para esta pessoa
const tmPersonId = resultadoPerson.recordset?.[0]?.lastID || resultadoPerson.recordset?.[0]?.LASTID;
    // ==========================================
    // GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
    // ==========================================
    const queryFaturamento = `
      INSERT INTO FinancialBilling.dbo.person_faturamento (documentNumber, nomeEmpresa, contractId, tmPersonId) 
      VALUES (@documentNumber, @nomeEmpresa, @contractId, @tmPersonId);
      SELECT SCOPE_IDENTITY() AS lastID;
    `;
    
    const requestFaturamentoPerson = pool.request()
      .input('documentNumber', sqlServer.VarChar(18), personData.cnpj)
      .input('nomeEmpresa', sqlServer.VarChar(18), personData.nomeEmpresa)
      .input('contractId', sqlServer.Int, personData.contractId || null)
      .input('tmPersonId', sqlServer.Int, tmPersonId);

    const resultadoFaturamentoPerson = await requestFaturamentoPerson.query(queryFaturamento);


 const personFaturamentoId = (resultadoFaturamentoPerson.recordset as any)[0]?.lastID;

    if (!personFaturamentoId) {
      throw new Error("[ContratoRepository] Falha ao capturar o ID gerado para person_faturamento.");
    }

    // 🔥 AJUSTE 3: Retorna os dois IDs válidos e existentes no escopo atual
    return {
      tmPersonId,             // ID do banco principal (TollManagement)
      personFaturamentoId     // ID do faturamento (FinancialBilling) - Agora ela existe!
    };
  }
  // =========================================================================
  // 7. INSERÇÃO NA TABELA ENDERECO (SQL SERVER)
  // =========================================================================
  async criarEndereco(enderecoData: any) {
    const pool = await Database.getConnection();

    const query = `
      INSERT INTO endereco (
        cep, rua, numero, bairro, cidade, estado, complemento, personId, documentNumber
      )
      VALUES (
        @cep, @rua, @numero, @bairro, @cidade, @estado, @complemento, @personId, @documentNumber
      );
      SELECT SCOPE_IDENTITY() AS lastID;
    `;

    const requestEndereco = pool.request()
      .input('cep', sqlServer.VarChar(18), enderecoData.cep)
      .input('rua', sqlServer.VarChar(18), enderecoData.rua)
      .input('numero', sqlServer.VarChar(18), enderecoData.numero)
      .input('bairro', sqlServer.VarChar(18), enderecoData.bairro)
      .input('cidade', sqlServer.VarChar(18), enderecoData.cidade)
      .input('estado', sqlServer.VarChar(18), enderecoData.estado)
      .input('complemento', sqlServer.VarChar(18), enderecoData.complemento || null)
      .input('personId', sqlServer.Int, enderecoData.personId)
      .input('documentNumber', sqlServer.VarChar(18), enderecoData.documentNumber);

    const resultadoEndereco = await requestEndereco.query(query);

    // Captura o ID gerado para este endereço no banco principal
    const tmEnderecoId = resultadoEndereco.recordset[0].lastID;

    // ==========================================
    // GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
    // ==========================================
    const queryFaturamento = `
      INSERT INTO FinancialBilling.dbo.endereco_faturamento (
        cep, rua, numero, bairro, cidade, estado, complemento, personId, tmEnderecoId, documentNumber
      ) 
      VALUES (
        @cep, @rua, @numero, @bairro, @cidade, @estado, @complemento, @personId, @tmEnderecoId, 
        @documentNumber
      );
    `;
    
    const requestFaturamentoEndereco = pool.request()
      .input('cep', sqlServer.VarChar(18), enderecoData.cep)
      .input('rua', sqlServer.VarChar(18), enderecoData.rua)
      .input('numero', sqlServer.VarChar(18), enderecoData.numero)
      .input('bairro', sqlServer.VarChar(18), enderecoData.bairro)
      .input('cidade', sqlServer.VarChar(18), enderecoData.cidade)
      .input('estado', sqlServer.VarChar(18), enderecoData.estado)
      .input('complemento', sqlServer.VarChar(18), enderecoData.complemento || null)
      .input('personId', sqlServer.Int, enderecoData.personId)
      .input('tmEnderecoId', sqlServer.Int, tmEnderecoId) // Vincula o ID gerado no passo anterior
      .input('documentNumber', sqlServer.VarChar(18), enderecoData.documentNumber);

    await requestFaturamentoEndereco.query(queryFaturamento);

    console.log(`[Serviço] Endereço cadastrado com sucesso! ID Principal: ${tmEnderecoId}`);
    return tmEnderecoId;
  }

  // =========================================================================
  // 8. INSERÇÃO NA TABELA CONTATO (SQL SERVER)
  // =========================================================================
  async criarContato(contatoData: any) {
    const pool = await Database.getConnection();

    const query = `
      INSERT INTO contato (telefone, email, personId) 
      VALUES (@telefone, @email, @personId);
    `;

    const requestContato = pool.request()
      .input('telefone', sqlServer.VarChar(18), contatoData.telefone)
      .input('email', sqlServer.VarChar(18), contatoData.email)
      .input('personId', sqlServer.Int, contatoData.personId);

    await requestContato.query(query);

    console.log(`[Serviço] Contato gravado com sucesso para a Person ID: ${contatoData.personId}`);
  }

  // =========================================================================
  // 9. INSERÇÃO NA TABELA RESPONSAVEL LEGAL (SQL SERVER)
  // =========================================================================
  async criarResponsavelLegal(responsavelLegalData: any) {
    const pool = await Database.getConnection();

    const query = `
      INSERT INTO responsavelLegal (nome, personId, documentNumber)
      VALUES (@nome, @personId, @documentNumber);
    `;

    const requestResponsavel = pool.request()
      .input('nome', sqlServer.VarChar(18), responsavelLegalData.responsavelLegal)
      .input('personId', sqlServer.Int, responsavelLegalData.personId)
      .input('documentNumber', sqlServer.VarChar(18), responsavelLegalData.documentNumber);

    await requestResponsavel.query(query);
    
    console.log(`[Serviço] Responsável legal (${responsavelLegalData.responsavelLegal}) cadastrado com sucesso!`);
  }

  async criarContaContrato(ContaContratoData: any, contratoId: number, transaction?: sqlServer.Transaction) {
  try {
    // Se receber uma transação, cria o request nela. Caso contrário, usa o pool global.
    const request = transaction 
      ? new sqlServer.Request(transaction) 
      : (await Database.getConnection()).request();

    // SQL Server usa parâmetros nomeados (@parametro)
    const query = `
      INSERT INTO contaContrato (cnpj, contratoId, limiteContrato, saldoContrato)
      VALUES (@cnpj, @contratoId, @limiteContrato, @saldoContrato);
    `;

    // Mapeamento e tipagem estrita dos inputs contra SQL Injection
    await request
      .input('cnpj', sqlServer.VarChar, ContaContratoData.cnpj || null)
      .input('contratoId', sqlServer.Int, contratoId)
      .input('limiteContrato', sqlServer.Decimal(18, 2), ContaContratoData.limiteContrato || 0)
      .input('saldoContrato', sqlServer.Decimal(18, 2), 0) // Define o saldo inicial zerado
      .query(query);
      
    console.log(`[Serviço] conta contrato (${ContaContratoData.contaContrato}) cadastrado com sucesso!`);
    
  } catch (erro) {
    console.error("Erro no processamento do criarContaContrato Repository:", erro);
    throw erro;
  }
}
}
