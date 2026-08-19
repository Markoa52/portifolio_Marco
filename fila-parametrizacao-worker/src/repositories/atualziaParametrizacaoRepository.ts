// const sql = require('mssql');

// class ContratoRepository {
//   // ... (seus métodos antigos continuam iguais)

//   async atualizarParcialMultiTabela(payload: any, transaction: any): Promise<void> {
//     const { person, endereco, contrato, contatos } = payload;
//     const personId = person.id; // O ID continua sendo obrigatório para saber QUEM atualizar

//     // --- 1. ATUALIZAÇÃO PARCIAL DA PERSON ---
//     if (person) {
//       const req = new sql.Request(transaction);
//       req.input('id', sql.Int, personId);
//       // Se vir de fora usa o valor, se vir undefined manda null para o SQL manter o antigo
//       req.input('cnpj', sql.VarChar, person.cnpj ?? null);
//       req.input('nomeEmpresa', sql.VarChar, person.nomeEmpresa ?? null);

//       const query = `
//         UPDATE person 
//         SET cnpj = ISNULL(@cnpj, cnpj), 
//             nome_empresa = ISNULL(@nomeEmpresa, nome_empresa) 
//         WHERE id = @id;
//       `;
//       await req.query(query);
//     }

//     // --- 2. ATUALIZAÇÃO PARCIAL DO ENDEREÇO ---
//     if (endereco) {
//       const req = new sql.Request(transaction);
//       req.input('personId', sql.Int, personId);
//       req.input('cep', sql.VarChar, endereco.cep ?? null);
//       req.input('rua', sql.VarChar, endereco.rua ?? null);
//       req.input('numero', sql.VarChar, endereco.numero ?? null);
//       req.input('complemento', sql.VarChar, endereco.complemento ?? null);
//       req.input('bairro', sql.VarChar, endereco.bairro ?? null);
//       req.input('cidade', sql.VarChar, endereco.cidade ?? null);
//       req.input('estado', sql.VarChar, endereco.estado ?? null);

//       const query = `
//         UPDATE endereco 
//         SET cep = ISNULL(@cep, cep), 
//             rua = ISNULL(@rua, rua), 
//             numero = ISNULL(@numero, numero), 
//             complemento = ISNULL(@complemento, complemento), 
//             bairro = ISNULL(@bairro, bairro), 
//             cidade = ISNULL(@cidade, cidade), 
//             estado = ISNULL(@estado, estado)
//         WHERE person_id = @personId;
//       `;
//       await req.query(query);
//     }

//     // --- 3. ATUALIZAÇÃO PARCIAL DO CONTRATO ---
//     if (contrato) {
//       const req = new sql.Request(transaction);
//       req.input('personId', sql.Int, personId);
//       req.input('dataInicio', sql.Date, contrato.dataInicio ?? null);
//       req.input('planoComercializado', sql.VarChar, contrato.planoComercializado ?? null);
//       req.input('valorMensalidade', sql.Decimal(10, 2), contrato.valorMensalidade ?? null);
//       req.input('valorTag', sql.Decimal(10, 2), contrato.valorTag ?? null);
//       req.input('planoPagamento', sql.VarChar, contrato.planoPagamento ?? null);
//       req.input('dataCorteFaturamento', sql.Date, contrato.dataCorteFaturamento ?? null);
//       req.input('diaFaturamento', sql.Int, contrato.diaFaturamento ?? null);

//       const query = `
//         UPDATE contrato 
//         SET data_inicio = ISNULL(@dataInicio, data_inicio), 
//             plano_comercializado = ISNULL(@planoComercializado, plano_comercializado), 
//             valor_mensalidade = ISNULL(@valorMensalidade, valor_mensalidade), 
//             valor_tag = ISNULL(@valorTag, valor_tag), 
//             plano_pagamento = ISNULL(@planoPagamento, plano_pagamento), 
//             data_corte_faturamento = ISNULL(@dataCorteFaturamento, data_corte_faturamento), 
//             dia_faturamento = ISNULL(@diaFaturamento, dia_faturamento)
//         WHERE person_id = @personId;
//       `;
//       await req.query(query);
//     }

//     // --- 4. ATUALIZAÇÃO PARCIAL DOS CONTATOS ---
//     if (contatos) {
//       // Para telefone/e-mail, se o campo vier no payload, atualizamos o registro específico daquele tipo
//       if (contatos.telefone !== undefined) {
//         const req = new sql.Request(transaction);
//         req.input('personId', sql.Int, personId);
//         req.input('valor', sql.VarChar, contatos.telefone);
//         await req.query(`UPDATE telefone SET valor = @valor WHERE person_id = @personId AND tipo = 'Telefone';`);
//       }
//       if (contatos.email !== undefined) {
//         const req = new sql.Request(transaction);
//         req.input('personId', sql.Int, personId);
//         req.input('valor', sql.VarChar, contatos.email);
//         await req.query(`UPDATE telefone SET valor = @valor WHERE person_id = @personId AND tipo = 'Email';`);
//       }
//     }
//   }
// }

// export const contratoRepository = new ContratoRepository();
