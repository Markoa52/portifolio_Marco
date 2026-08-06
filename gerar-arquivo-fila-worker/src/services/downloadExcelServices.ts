// src/services/geraArquivoExcel.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const geraArquivoExcelDw = async (payload: any): Promise<string> => {
  try {
    const dados = payload && payload.js ? payload.js : payload;
    
    // CAPTURA O ID ENVIADO PELA CONTROLLER (Ou gera um fallback se não vier)
    const protocoloId = payload && payload.protocoloId ? payload.protocoloId : Date.now();

    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      throw new Error("Os dados fornecidos para gerar o Excel não são um array ou estão vazios.");
    }

    const planilha = XLSX.utils.json_to_sheet(dados);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Dados");

    // Opcional: Ajuste de largura das colunas
    const larguras = Object.keys(dados[0] || {}).map(chave => ({
      wch: Math.max(...dados.map((item: any) => String(item[chave] || '').length + 3), 10)
    }));
    planilha['!cols'] = larguras;
    
    // CORREÇÃO CRÍTICA: O nome do arquivo agora usa obrigatoriamente o protocoloId
    const nomeDoArquivo = `planilha_${protocoloId}.xlsx`;
     // CORREÇÃO 2: Ajuste no caminho absoluto para garantir que a pasta 'public' seja criada fora de 'src/'
    const caminhoDestino = path.join(__dirname, '..', '..', 'public', 'downloads', 'excel', nomeDoArquivo);
    const urlGerada = `http://localhost:3001/downloads/excel/${nomeDoArquivo}`;

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

