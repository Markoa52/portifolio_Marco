const sql = require('mssql');
const contratoRepository = require('./ContratoRepository');

class criarContrato {


  async processarCadastroRelacional(payload: any) {
    const { person, endereco, contrato, contatos } = payload;
    
    // Pega a conexão ativa do pool do SQL Server (configurado globalmente na sua app)
    const pool = await sql.connect(); 
    const transaction = new sql.Transaction(pool);

    try {
      // Inicia o BEGIN TRANSACTION
      await transaction.begin();

      // 1. Cria a Person e captura o ID gerado pelo repositório
      const personId = await contratoRepository.criarPerson(person, transaction);

      // 2. Cria o Endereço injetando a FK
      await contratoRepository.criarEndereco(endereco, personId, transaction);

      // 3. Cria as Condições Comerciais injetando a FK
      await contratoRepository.criarContrato(contrato, personId, transaction);

      // 4. Cria os contatos na mesma tabela (Telefone e Email) se existirem
      if (contatos.telefone) {
        await contratoRepository.criarContato('Telefone', contatos.telefone, personId, transaction);
      }
      if (contatos.email) {
        await contratoRepository.criarContato('Email', contatos.email, personId, transaction);
      }

      // Se todas as etapas executaram perfeitamente, commita
      await transaction.commit();
      console.log(`[Service] Transação concluída com sucesso para a Person ID: ${personId}`);
      return { sucesso: true, personId };

    } catch (erro) {
      // Se falhar em qualquer repository, aborta tudo
      await transaction.rollback();
      console.error("[Service] Erro no processamento. Transação cancelada.", erro);
      throw erro; // Repassa o erro para o Worker saber que falhou
    }
  }
}

export const cadastroContratoService = new criarContrato();