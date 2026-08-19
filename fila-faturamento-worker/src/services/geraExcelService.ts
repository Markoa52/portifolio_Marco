// src/services/geraArquivoExcel.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import XLSX from 'xlsx';

// No CommonJS da API Principal, imports locais não levam extensão no caminho
import { CAMINHO_EXCELF, NOME_TABELA } from '../config/excelConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const geraArquivoExcel = async (payload: any): Promise<string> => {
  try {
    const listaItens = payload?.js || payload?.payload?.js;

        // VALIDAÇÃO: Impede que o "for" execute se a lista não for um array válido
    if (!listaItens || !Array.isArray(listaItens)) {
        console.error("[Erro Crítico] A propriedade 'js' está ausente ou não é um array:", payload);
        throw new Error("payload is not iterable: O array 'js' não pôde ser encontrado.");
    }

            const totalLinha = listaItens.length;
    console.log(`[PDF] Iniciando processamento do protocolo: ${payload.protocoloId || 'sem_id'} com ${totalLinha} linhas.`);

            // CORREÇÃO: Voltamos para o índice 0, que agora conterá os dados reais da primeira fatura
        // Captura a primeira linha para pegar o bill_id do nome do arquivo
    const primeiraLinha = listaItens[0];
    const fatura = primeiraLinha?.bill_id;

  if (!fatura) {
        throw new Error("A propriedade 'bill_id' não foi encontrada na primeira linha do array 'js'.");
    }
    
    // 1. Captura o ID do protocolo enviado pela nova Controller
    const protocoloId = payload && payload.protocoloId ? payload.protocoloId : Date.now();



    if (!listaItens || !Array.isArray(listaItens) || listaItens.length === 0) {
      throw new Error("Os dados fornecidos para gerar o Excel não são um array ou estão vazios.");
    }

    const planilha = XLSX.utils.json_to_sheet(listaItens);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Dados");

    // Opcional: Ajuste de largura das colunas
    const larguras = Object.keys(listaItens[0] || {}).map(chave => ({
      wch: Math.max(...listaItens.map((item: any) => String(item[chave] || '').length + 3), 10)
    }));
    planilha['!cols'] = larguras;
    
    // CORREÇÃO CRÍTICA: O nome do arquivo agora usa obrigatoriamente o protocoloId
    const nomeDoArquivo = `${fatura}_planilha_${protocoloId}.xlsx`;
     // CORREÇÃO 2: Ajuste no caminho absoluto para garantir que a pasta 'public' seja criada fora de 'src/'
    const caminhoDestino = path.join(__dirname, '..', '..', 'public', 'downloads', 'excel', nomeDoArquivo);
    const urlGerada = `http://localhost:3001/downloads/excel/${nomeDoArquivo}`;

    // Salvo o link retornado para a planilha
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(CAMINHO_EXCELF);
        
        // Captura a primeira aba da lista de planilhas
        const worksheet = workbook.worksheets[0];
        
        if (!worksheet) {
            throw new Error(`Falha ao salvar histórico: Aba principal não pôde ser lida no workbook.`);
        }
        
        // LIMPEZA SEGURA CONTRA O ERRO DE REMOVETABLE:
        try {
            if ((worksheet as any)._tables) {
                (worksheet as any)._tables = {};
            }
        } catch (e) {
            console.log("ℹNão foi possível redefinir a tabela do GLPI, sobrepondo dados...");
        }
        
        const totalLinhas = worksheet.rowCount;
        if (totalLinhas > 1) {
            worksheet.spliceRows(2, totalLinhas - 1);
        }
        
        // ==========================================
        // CORREÇÃO: Estruturando a linha corretamente
        // ==========================================
        // Cada elemento do array 'dadosDaLinha' corresponde a uma coluna na mesma ordem:
        // [cod_cli, bill_id, link_excel, link_pdf, link_nf]
    
            for (const item of listaItens) {
    
            const dadosDaLinha = [
            item.cod_cli,       // cod_cli (deixe null ou passe o valor se tiver)
            item.bill_id,       // bill_id (deixe null ou passe o valor se tiver)
            null,       // link_excel (deixe null se for preencher depois)
            urlGerada,  // link_pdf -> Aqui entra a sua URL gerada na 4ª coluna!
            null        // link_nf
           ];
    
           worksheet.addTable({
               name: NOME_TABELA,
               ref: 'A2',
               headerRow: false,
               columns: [
                   { name: 'cod_cli' }, 
                   { name: 'bill_id' }, 
                   { name: 'link_excel' },
                   { name: 'link_pdf' }, // Vai receber o valor correspondente do array (urlGerada)
                   { name: 'link_nf' }
               ],
               // Passamos a linha dentro de um array [dadosDaLinha], pois rows aceita múltiplas linhas
               rows: [dadosDaLinha] 
           });
          }

          await workbook.xlsx.writeFile(CAMINHO_EXCELF);
          const agora = new Date();
          fs.utimesSync(CAMINHO_EXCELF, agora, agora);

         const pastaDestino = path.dirname(caminhoDestino);
         if (!fs.existsSync(pastaDestino)) {
           fs.mkdirSync(pastaDestino, { recursive: true });
         }
     
         XLSX.writeFile(livro, caminhoDestino);
         console.log(`[Excel] Arquivo gerado com sucesso: ${nomeDoArquivo}`);
         
         return urlGerada;
     
       } catch (error: any) {
         console.error("Erro interno no serviço de Excel:", error.message);
         throw new Error(`Falha ao gerar o arquivo Excel: ${error.message}`);
       }
};

