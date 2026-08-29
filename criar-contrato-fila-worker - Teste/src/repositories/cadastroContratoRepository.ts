import {Database} from '../config/sqlLiteConfig.js';

export class ContratoRepository {

  async criarContrato(contratoData: any) {
    const db = await Database.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
        // 2. CORREÇÃO: Substituído todos os ':' por '?' e ajustado a coluna para 'cnjp'
        // removido o caractere quebrado ': 1' e colocado o '?' correspondente
        const query = `
          INSERT INTO contrato (
            dataInicio, dataEncerramento, CorteFaturamentoTipo, planoComercializadoTipo,
            valorMensalidade, valorTag, planoPagamentoTipo, diaFaturamento, diaSemanaCorte, cnpj, prazoPagamento, contratoStatusId
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); -- 11 interrogações para 11 colunas
        `;

        // 3. CORREÇÃO: Passando o array de valores na ordem exata dos '?'
        const resultadoPrincipal = await db.run(query, [
          contratoData.dataInicio,
          contratoData.dataEncerramento || null,
          contratoData.corteFaturamento,
          contratoData.planoComercializado,
          contratoData.valorMensalidade,
          contratoData.valorTag,
          contratoData.planoPagamento,
          contratoData.diaFaturamento,
          contratoData.diaSemana,
          contratoData.cnpj, 
          contratoData.prazoPagamento,
          contratoData.statusContrato || 1 // Usa o status enviado ou 1 como padrão
        ]);

        // Captura o ID auto-incremental gerado pelo banco principal TollManagement
        const tmContractId = resultadoPrincipal.lastID;

        // ==========================================
        // GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
        // ==========================================
        const queryFaturamento = `
          INSERT INTO banco_fat.contrato_faturamento (
            dataInicio, dataEncerramento, CorteFaturamentoTipo, planoComercializadoTipo, valorMensalidade, valorTag, planoPagamentoTipo, diaFaturamento, diaSemanaCorte,
            cnpj, tmContractId, prazoPagamento, contratoStatusId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // CORREÇÃO: Injetado o 'tmContractId' gerado no passo anterior e alinhado propriedades
        const resultadoFaturamento = await db.run(queryFaturamento, [
          contratoData.dataInicio, 
          contratoData.dataEncerramento ||null, 
          contratoData.corteFaturamento, 
          contratoData.planoComercializado, 
          contratoData.valorMensalidade, 
          contratoData.valorTag, 
          contratoData.planoPagamento, 
          contratoData.diaFaturamento, 
          contratoData.diaSemana,
          contratoData.cnpj, 
          tmContractId, // 👈 Vincula o ID real gerado pelo banco principal
          contratoData.prazoPagamento, 
          1 // contratoStatusId ativo
        ]);

        const contratoFaturamentoId = resultadoFaturamento.lastID;

        // ==========================================
        // GRAVAÇÃO DA FATURA (banco_fat.bill)
        // ==========================================
        const queryFaturamentoBill = `
          INSERT INTO banco_fat.bill (contractId, dataAbertura, dataFechamento, dataVencimento, status
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        // 1. Converte a string de dataInicio para um objeto Date real do JavaScript
        const dataBase = new Date(`${contratoData.dataInicio}T12:00:00`);
        
        let dataFechamentoStr = '';
        let dataVencimentoStr = '';
        
        const dataFechamento = new Date(dataBase);
        
        // =========================================================================
        // 2. CÁLCULO DO FECHAMENTO (Baseado no Corte e no Dia do Faturamento)
        // =========================================================================
        const tipoCorte = Number(contratoData.corteFaturamento);

        switch (tipoCorte) {
            case 1: // NOVO CASO: CORTE SEMANAL EM DIA ESPECÍFICO (Seg, Ter, Qua...)
            // 'diaSemanaEscolhido' deve vir do formulário como número (1 = Segunda, 2 = Terça...)
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

              // Proteção padrão do SQLite para meses curtos (Fevereiro/Abril)
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
        // 3. CÁLCULO DO VENCIMENTO (Baseado no Prazo de Pagamento)
        // =========================================================================
        const dataVencimento = new Date(dataFechamento);
        
        if (contratoData.prazoPagamento != null && Number(contratoData.prazoPagamento) > 0) {
          dataVencimento.setDate(dataVencimento.getDate() + Number(contratoData.prazoPagamento));
        } else {
          dataVencimento.setDate(dataVencimento.getDate() + 1);
        }
        dataVencimentoStr = dataVencimento.toISOString().split('T')[0] ?? '';
        
        // Executa a query da Fatura/Bill vinculada ao faturamento
        await db.run(queryFaturamentoBill, [
          contratoFaturamentoId, 
          contratoData.dataInicio ?? "", 
          dataFechamentoStr, 
          dataVencimentoStr, 
          1 // status: Aberto/Pendente
        ]);

        console.log(`✅ Bill Gerada com sucesso! Fechamento: ${dataFechamentoStr} | Vencimento: ${dataVencimentoStr}`);
        return tmContractId;

    } catch (error: any) {
      console.error("❌ Erro no processamento do Contrato Repository:", error.message);
      throw error;
    }
  }

    // Removido o parâmetro transaction, pois o SQLite usa a mesma conexão "db"
    async criarPerson(personData: any) {
    const db = await Database.getConnection();

    // 1. CORREÇÃO: Trocado os ':' por '?' e ajustado os nomes das tabelas/colunas
    // (Mudado de contract para contrato, e de cnpj para cnjp para bater com seu CREATE TABLE)
    const query = `
      INSERT INTO person (documentNumber, nomeEmpresa, contractId) 
      VALUES (
        ?, 
        ?, 
        (SELECT id from contrato where cnpj = ?)
      );
    `;

    // 2. CORREÇÃO: Passando as variáveis em uma Array [] na ordem exata dos '?'
    const resultado = await db.run(query, [
        personData.cnpj,         // 1º ? (documentNumber)
        personData.nomeEmpresa,  // 2º ? (nomeEmpresa)
        personData.cnpj          // 3º ? (Para o SELECT interno da subquery)
    ]);

    // Guardamos o ID que o banco principal acabou de gerar para esta pessoa
    const tmPersonId = resultado.lastID;

    // ==========================================
    // GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
    // ==========================================
    const queryFaturamento = `
      INSERT INTO banco_fat.person_faturamento (documentNumber, nomeEmpresa, contractId, tmPersonId) 
      VALUES (?, ?, ?, ?)
    `;
    
    // CORREÇÃO: Ajustado de 'documentNUmber' para 'cnpj' e injetado o tmPersonId automático
    await db.run(queryFaturamento, [
        personData.cnpj, 
        personData.nomeEmpresa, 
        personData.contractId || null,
        tmPersonId
    ]);

    // 3. Retorna o ID gerado para quem chamou o serviço usar como FK
    return tmPersonId; 
}

   async criarEndereco(enderecoData: any) {
    const db = await Database.getConnection();

    // 1. CORREÇÃO: Trocado os ':' por '?' e limpa a subquery desnecessária.
    // Usamos o 'personId' direto no array de valores.
    const query = `
      INSERT INTO endereco (
        cep, rua, numero, bairro, cidade, estado, complemento, personId, documentNumber
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); -- 9 interrogações para as 9 colunas
    `;

    // 2. CORREÇÃO: Executa a primeira query passando o array ordenado de variáveis
    // Ajustado de 'documentNUmber' para 'documentNumber' para evitar erros de undefined
    const resultado = await db.run(query, [
      enderecoData.cep,               // 1
      enderecoData.rua,               // 2
      enderecoData.numero,            // 3
      enderecoData.bairro,            // 4
      enderecoData.cidade,            // 5
      enderecoData.estado,            // 6
      enderecoData.complemento || null, // 7
      enderecoData.personId,          // 8
      enderecoData.documentNumber     // 9
    ]);

    // Captura o ID gerado para este endereço no banco principal
    const tmEnderecoId = resultado.lastID;

    // ==========================================
    // GRAVAÇÃO NO BANCO ANEXADO (FinancialBilling)
    // ==========================================
    // CORREÇÃO: Adicionados as 10 interrogações para bater com as 10 colunas da tabela
    const queryFaturamento = `
      INSERT INTO banco_fat.endereco_faturamento (
        cep, rua, numero, bairro, cidade, estado, complemento, personId, tmEnderecoId, documentNumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // CORREÇÃO: Array completo preenchido na ordem exata e injetado o tmEnderecoId automático
    await db.run(queryFaturamento, [
      enderecoData.cep,               // 1
      enderecoData.rua,               // 2
      enderecoData.numero,            // 3
      enderecoData.bairro,            // 4
      enderecoData.cidade,            // 5
      enderecoData.estado,            // 6
      enderecoData.complemento || null, // 7
      enderecoData.personId,          // 8 (ID relacional da pessoa no faturamento)
      tmEnderecoId,                   // 9 (O ID que acabou de ser gerado acima!)
      enderecoData.documentNumber     // 10
    ]);

    console.log(`[Serviço] Endereço cadastrado com sucesso! ID Principal: ${tmEnderecoId}`);
    return tmEnderecoId;
}

async criarContato(contatoData: any) {
    const db = await Database.getConnection();

    // 1. CORREÇÃO: Trocado os ':' por '?' e ajustado o nome da tabela para 'contato'
    // Conforme o seu script de tabelas: contato (id, telefone, email, personId)
    const query = `
      INSERT INTO contato (telefone, email, personId) 
      VALUES (?, ?, ?);
    `;

    // 2. CORREÇÃO: Mapeia o valor para a coluna certa baseado no tipo que veio do formulário

    // 3. Executa a query passando as variáveis ordenadas no array []
    await db.run(query, [
        contatoData.telefone, // 1º ? (telefone)
        contatoData.email,    // 2º ? (email)
        contatoData.personId       // 3º ? (personId)
    ]);

    console.log(`[Serviço] Contato do tipo "${contatoData}" gravado com sucesso!`);
}

async criarResponsavelLegal(responsavelLegalData: any) {
    const db = await Database.getConnection();

    // 1. CORREÇÃO: Alinhado com o seu CREATE TABLE: responsavelLegal (nome, personId)
    // Trocado os ':' por '?' e removida a vírgula órfã e a subquery.
    const query = `
      INSERT INTO responsavelLegal (nome, personId, documentNumber)
      VALUES (?, ?, ?);
    `;

    // 2. CORREÇÃO: Executa a query passando o array ordenado de variáveis.
    // Usamos o personId que você já tem disponível no escopo do seu worker/serviço.
    await db.run(query, [
        responsavelLegalData.responsavelLegal,    // 1º ? (nome)
        responsavelLegalData.personId, // 2º ? (personId - ID gerado no criarPerson)
        responsavelLegalData.documentNumber 
    ]);
    
    console.log(`[Serviço] Responsável legal (${responsavelLegalData.responsavelLegal}) cadastrado com sucesso!`);
}

async criarContaContrato(ContaContratoData: any, contratoId: number) {
    const db = await Database.getConnection();

    // 1. CORREÇÃO: Alinhado com o seu CREATE TABLE: responsavelLegal (nome, personId)
    // Trocado os ':' por '?' e removida a vírgula órfã e a subquery.
    const query = `
      INSERT INTO contaContrato (cnpj, contratoId, limiteContrato, saldoContrato)
      VALUES (?, ?, ?, ?);
    `;

    // 2. CORREÇÃO: Executa a query passando o array ordenado de variáveis.
    // Usamos o personId que você já tem disponível no escopo do seu worker/serviço.
    await db.run(query, [
        ContaContratoData.cnpj,    // 1º ? (nome)
        contratoId, // 2º ? (personId - ID gerado no criarPerson)
        ContaContratoData.limiteContrato,
        0
    ]);
    
    console.log(`[Serviço] conta contrato (${ContaContratoData.contaContrato}) cadastrado com sucesso!`);
 }
}
