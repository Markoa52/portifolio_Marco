// const ExcelJS = require('exceljs');
// const fs = require('fs');
// const xlsx = require('xlsx');

// const { CONEXAO_RABBIT } = require('../config/rabbitConfig'); 

// class gerarArquivoModel {
//     static obterDadosGerarArquivo() {
//         if (!fs.existsSync(CAMINHO_EXCEL)) return [];

//         const tempoAtual = new Date();
//         fs.utimesSync(CAMINHO_EXCEL, tempoAtual, tempoAtual);

//         const descritorArquivo = fs.openSync(CAMINHO_EXCEL, 'r');
//         const arquivoBuffer = fs.readFileSync(descritorArquivo);
//         fs.closeSync(descritorArquivo);

//         const workbook = xlsx.read(arquivoBuffer, { type: 'buffer', cellDates: true });
//         const primeiraAba = workbook.SheetNames[0];
//         const dadosJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets[primeiraAba]);

//         return dadosJsonRaw.map(item => {
//             const linha = {};
//             Object.keys(item).forEach(chave => {
//                 let valor = item[chave];
//                 linha[chave.trim()] = (valor !== null && valor !== undefined) ? valor.toString().trim() : '';
//             });
//             return linha;
//         });
//     }

//     static async salvarNoSharepoint(dadosParaSalvar) {
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.readFile(CAMINHO_EXCEL);
//         const worksheet = workbook.worksheets[0]; 

//         // CORREÇÃO: Usando a variável configurada globalmente (NOME_TABELA = 'Tabela1')
//         try {
//             worksheet.removeTable(NOME_TABELA);
//         } catch (e) {
//             console.log("ℹ️ Tabela antiga não encontrada ao salvar, criando uma nova...");
//         }

//         const totalLinhas = worksheet.rowCount;
//         if (totalLinhas > 1) {
//             for (let i = 2; i <= totalLinhas; i++) {
//                 worksheet.getRow(i).values = [];
//             }
//         }

//         const novasLinhasMatriz = [];
//         dadosParaSalvar.forEach(item => {
//             novasLinhasMatriz.push([
//                 item.Data || item.data || '',
//                 item.Assunto || item.assunto || '',
//                 item.Email || item.email || '',
//                 item.Acoes || item.acoes || ''
//             ]);
//         });

//         // CORREÇÃO: Aplicado o NOME_TABELA correto aqui também
//         worksheet.addTable({
//             name: NOME_TABELA,
//             ref: 'A1',
//             headerRow: true,
//             columns: [
//                 { name: 'Data' }, { name: 'Assunto' }, { name: 'Email' }, { name: 'Acoes' }
//             ],
//             rows: novasLinhasMatriz
//         });

//         await workbook.xlsx.writeFile(CAMINHO_EXCEL);
//         const agora = new Date();
//         fs.utimesSync(CAMINHO_EXCEL, agora, agora);
//     }
// }

// module.exports = gerarArquivoModel;
