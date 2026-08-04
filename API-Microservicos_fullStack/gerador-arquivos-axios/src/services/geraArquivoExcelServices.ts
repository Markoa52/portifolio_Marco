// src/services/geraArquivoPdf.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx'; // ou 'exceljs' dependendo da biblioteca que você usa

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Certifique-se de que a função tem o 'export' na frente do 'const'
export const geraArquivoExcel = async (dados: any): Promise<string> => {
  try {

    // 1. Cria a estrutura da planilha com seus dados coletados
    const planilha = XLSX.utils.json_to_sheet(dados);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Dados");

    // Opcional: Ajusta a largura das colunas dinamicamente para não truncar os dados
    const larguras = Object.keys(dados[0] || {}).map(chave => ({
    wch: Math.max(...dados.map((item: { [x: string]: any; }) => String(item[chave] || '').length + 3), 10)
    }));
    planilha['!cols'] = larguras;
    
    const nomeDoArquivo = `planilha_${Date.now()}.xlsx`;
    const caminhoDestino = path.join(__dirname, '../../public/downloads/excel', nomeDoArquivo);
    const urlGerada: string = `http://localhost:3001/public/downloads/excel/${nomeDoArquivo}`;

    // Garante que a pasta física existe antes de escrever
    const pastaDestino = path.dirname(caminhoDestino);
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    // 3. Salva o arquivo fisicamente no disco do servidor
    XLSX.writeFile(livro, caminhoDestino);

    return urlGerada;

  } catch (error) {
    throw new Error("Falha ao gerar o PDF");
  }
};
