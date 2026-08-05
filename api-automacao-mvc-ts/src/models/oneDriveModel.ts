// src/models/oneDriveModel.ts
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os'; // ADICIONE ESTE IMPORT NATÍVO
import * as xlsx from 'xlsx';
import { CAMINHO_EXCEL, NOME_TABELA } from '../config/excelConfig';

// IMPORTAÇÃO DA NOVA INTERFACE ISOLADA
import { DadosLinhaSharepoint } from '../types/oneDrive';

export class OneDriveModel {
    static obterDadosBrutosBypass(): Record<string, string>[] {
        if (!fs.existsSync(CAMINHO_EXCEL)) {
            console.log(`Arquivo original não encontrado em: ${CAMINHO_EXCEL}`);
            return [];
        }

        // Caminhos para a criação da cópia temporária isolada do OneDrive
        const nomeArquivoTemp = `temp_leitura_${Date.now()}.xlsx`;
        const caminhoTemporario = path.join(os.tmpdir(), nomeArquivoTemp);

        try {
            // 1. Atualiza a data de modificação no arquivo original para forçar o bypass
            const tempoAtual = new Date();
            fs.utimesSync(CAMINHO_EXCEL, tempoAtual, tempoAtual);

            // 2. Cria uma cópia exata do arquivo na pasta TEMP do Windows/Linux
            // Isso clona os bytes sem precisar de descritores abertos e dribla o bloqueio do OneDrive
            fs.copyFileSync(CAMINHO_EXCEL, caminhoTemporario);

            // 3. Lê o buffer a partir do arquivo temporário isolado
            const arquivoBuffer = fs.readFileSync(caminhoTemporario);

            // 4. Faz o parse do Excel com a biblioteca xlsx
            const workbook = xlsx.read(arquivoBuffer, { type: 'buffer', cellDates: true });
            
            const nomePrimeiraAba = workbook.SheetNames[0]; // Pega a primeira string com segurança
            if (!nomePrimeiraAba) {
                throw new Error("O arquivo Excel foi lido, mas não possui nenhuma aba.");
            }

            const abaPlanilha = workbook.Sheets[nomePrimeiraAba];
            if (!abaPlanilha) {
                throw new Error(`A aba com o nome "${nomePrimeiraAba}" não pôde ser carregada.`);
            }

            const dadosJsonRaw = xlsx.utils.sheet_to_json<Record<string, any>>(abaPlanilha);

            // 5. Mapeia e sanitiza as linhas e chaves
            return dadosJsonRaw.map((item: Record<string, any>) => {
                const linha: Record<string, string> = {};
                Object.keys(item).forEach((chave: string) => {
                    const valor = item[chave];
                    linha[chave.trim()] = (valor !== null && valor !== undefined) ? valor.toString().trim() : '';
                });
                return linha;
            });

        } catch (error: any) {
            console.error("Falha crítica ao ler a planilha via arquivo temporário:", error.message);
            return [];
        } finally {
            // 6. GARANTIA: Remove o arquivo temporário do disco após o término para não acumular lixo
            if (fs.existsSync(caminhoTemporario)) {
                try {
                    fs.unlinkSync(caminhoTemporario);
                } catch (err) {
                    console.log("Não foi possível deletar o arquivo temporário, o sistema limpará depois.");
                }
            }
        }
    }
    
    // 2. Parâmetro tipado para receber a estrutura das linhas do Sharepoint
        static async salvarNoSharepoint(dadosParaSalvar: DadosLinhaSharepoint[]): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(CAMINHO_EXCEL);
        
        // 1. Captura a primeira planilha da lista
        const worksheet = workbook.worksheets[0]; 

        // CORREÇÃO DEFENSIVA: Se a planilha não existir, lança um erro antes de quebrar as linhas abaixo
        if (!worksheet) {
            throw new Error(`A planilha dentro do arquivo Excel localizado em ${CAMINHO_EXCEL} não foi encontrada.`);
        }

        // 2. Agora o TypeScript sabe 100% que 'worksheet' existe e não é undefined
        try {
            if ((worksheet as any)._tables) {
                (worksheet as any)._tables = {};
            }
        } catch (e) {
            console.log("ℹNão foi possível limpar a estrutura da tabela antiga, recriando...");
        }

        const totalLinhas = worksheet.rowCount;
        if (totalLinhas > 1) {
            for (let i = 2; i <= totalLinhas; i++) {
                worksheet.getRow(i).values = [];
            }
        }

        const novasLinhasMatriz: string[][] = [];
        dadosParaSalvar.forEach(item => {
            novasLinhasMatriz.push([
                item.Data || item.data || '',
                item.Assunto || item.assunto || '',
                item.Email || item.email || '',
                item.Acoes || item.acoes || ''
            ]);
        });

        worksheet.addTable({
            name: NOME_TABELA,
            ref: 'A1',
            headerRow: true,
            columns: [
                { name: 'Data' }, { name: 'Assunto' }, { name: 'Email' }, { name: 'Acoes' }
            ],
            rows: novasLinhasMatriz
        });

        await workbook.xlsx.writeFile(CAMINHO_EXCEL);
        const agora = new Date();
        fs.utimesSync(CAMINHO_EXCEL, agora, agora);
    }
}
