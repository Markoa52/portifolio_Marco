const sql = require('sqlite3');
import {Database} from '../config/sqlLiteConfig.js';

export class ContratoRepository {

  async criarContrato(contratoData: any) {
    const db = await Database.getConnection();

    try {
        // 1. Inicia a transação no SQLite
        await db.exec('BEGIN TRANSACTION');

        // 2. Query ajustada com os parâmetros nomeados do SQLite (usando dois-pontos)
        const query = `
          INSERT INTO contrato (dataInicio,corteFaturamentoTipo,planoComercializadoTipo,
          valorMensalidade,valorTag,planoPagamentoTipo,diaFaturamento, documentNumber)
          VALUES (
            :dataInicio, :corteFaturamento, :planoComercializado, :valorMensalidade, 
            :valorTag, :planoPagamento, :diaFaturamento, 
            :documentNumber
          );
        `;

        // 3. Executa a query injetando o objeto com os parâmetros mapeados
        await db.run(query, {
            ':dataInicio': contratoData.dataInicio || null,
            ':CorteFaturamentoTipo': contratoData.dataCorteFaturamento || null,
            ':planoComercializadoTipo': contratoData.planoComercializado,
            ':valorMensalidade': contratoData.valorMensalidade,
            ':valorTag': contratoData.valorTag,
            ':planoPagamentoTipo': contratoData.planoPagamento,
            ':diaFaturamento': contratoData.diaFaturamento,
            ':documentNumber': contratoData.documentNUmber // Mantido o U maiúsculo do seu código original
        });

        // 4. Se tudo correu bem até aqui, confirma e salva as alterações
        await db.exec('COMMIT');
        console.log('Contrato criado e transação confirmada com sucesso!');

    } catch (error) {
        // 5. Se houver qualquer erro, desfaz as alterações feitas nesta transação
        await db.exec('ROLLBACK');
        console.error('Erro na transação, feito Rollback:', error);
        throw error; // Recomenda-se relançar o erro para quem chamou a função saber que falhou
    }
}

// Removido o parâmetro transaction, pois o SQLite usa a mesma conexão "db"
async criarPerson(personData: any) {
    const db = await Database.getConnection();

    // 1. Ajusta a query trocando os '@' por ':' e removendo o SELECT SCOPE_IDENTITY()
    const query = `
      INSERT INTO person (cnpj, nome_empresa, reposnsavelLegal, contractId) 
      VALUES (
        :documentNumber, 
        :nomeEmpresa, 
        :reposnsavelLegal
        (SELECT id FROM contrato WHERE documentNumber = :cnpj)
      );
    `;

    // 2. No SQLite, usamos o .run() para INSERTs. Ele devolve um objeto com informações da operação.
    const resultado = await db.run(query, { 
        ':Id': personData.Id,
        ':documentNumber': personData.cnpj,
        ':nomeEmpresa': personData.nomeEmpresa
    });

    // 3. O resultado.lastID contém exatamente o ID da linha que acabou de ser inserida (substitui o SCOPE_IDENTITY)
    return resultado.lastID; 
}

   async criarEndereco(enderecoData: any) {
    const db = await Database.getConnection();

    // 1. Ajusta a query trocando os '@' por ':' e corrigindo a quantidade de colunas/valores
    const query = `
      INSERT INTO endereco (
        cep, rua, numero, bairro,
        bairro, cidade, estado, complemento, person_id
      )
      VALUES (
        :cep, :rua, :numero, 
        :bairro, :cidade, :estado, :complemento, 
        :(SELECT id FROM person WHERE cnpj = :documentNumber)
      );
    `;

    // 2. Executa a query passando todos os inputs mapeados no objeto de parâmetros
    await db.run(query, {
        ':cep': enderecoData.cep,
        ':rua': enderecoData.rua,
        ':numero': enderecoData.numero,
        ':bairro': enderecoData.bairro,
        ':cidade': enderecoData.cidade,
        ':estado': enderecoData.estado,
        ':complemento': enderecoData.complemento || null, // Garante NULL se vier vazio
        ':documentNumber': enderecoData.documentNUmber // Mantido o U maiúsculo conforme seu padrão
    });
}

async criarContato(tipo: any, valor: any, personId: any) {
    const db = await Database.getConnection();

    // 1. Ajusta a query trocando os '@' por ':'
    const query = `
      INSERT INTO telefone (tipo, valor, person_id) 
      VALUES (:tipo, :valor, :personId);
    `;

    // 2. Executa a query injetando as variáveis passadas nos argumentos da função
    await db.run(query, {
        ':tipo': tipo,
        ':valor': valor,
        ':personId': personId // O ID numérico que você recebeu do 'criarPerson' (resultado.lastID)
    });
}

}

module.exports = new ContratoRepository();
