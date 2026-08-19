import {Database} from '../config/sqlLiteConfig.js';

export class ParametrizacaoRepository {

  async criarCorteFaturamento(contratoData: any) {
    const db = await Database.getConnection();

    try {

        // 2. Query ajustada com os parâmetros nomeados do SQLite (usando dois-pontos)
        const query = `INSERT INTO corteFaturamentoTipo (descricao) VALUES (:descricao);`;

        // 3. Executa a query injetando o objeto com os parâmetros mapeados
        await db.run(query, {
            ':descricao': contratoData.js || null
        });

        // 4. Se tudo correu bem até aqui, confirma e salva as alterações
        await db.exec('COMMIT');
        console.log('Contrato criado e transação confirmada com sucesso!');

   } catch (erro: any) {
    // Tenta fazer o rollback apenas se a transação ainda estiver pendente no SQLite
    try {
        await db.exec('ROLLBACK');
    } catch (rollbackError) {
        // Ignora silenciosamente o erro de "no transaction is active"
    }

    console.error("[Service] Erro no processamento da parametrização. Operação cancelada.", erro.message);
    throw erro; // Repassa o erro original (no such table) para o seu Consumer tratar
 }
}

// Removido o parâmetro transaction, pois o SQLite usa a mesma conexão "db"
async criarPlanoComercializado(personData: any) {
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

   async criarPlanoPagamento(enderecoData: any) {
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

export const parametrizacaoRepository = new ParametrizacaoRepository();
