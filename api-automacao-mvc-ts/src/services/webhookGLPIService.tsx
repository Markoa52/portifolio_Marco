// src/models/chamadoModel.ts
import ExcelJS from 'exceljs';
import fs from 'fs';
// No CommonJS da API Principal, imports locais não levam extensão no caminho
import { CAMINHO_EXCELW, NOME_TABELA } from '../config/excelConfig';

import {IRetornoObterTodos} from '../types/IRetornoObterTodos';

export class webhookGLPIService {
    // 1. Tipagem do retorno do método de leitura envelopado em uma Promise
        async obterTodos(): Promise<IRetornoObterTodos> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(CAMINHO_EXCELW);
        
        // Captura a primeira aba da lista de planilhas
        const worksheet = workbook.worksheets[0];

        // PROTEÇÃO CONTRA UNDEFINED: Garante ao compilador que a aba foi carregada com sucesso
        if (!worksheet) {
            throw new Error(`A aba principal não foi encontrada no arquivo Excel em: ${CAMINHO_EXCELW}`);
        }

        const linhas: any[][] = [];

        if (worksheet.rowCount > 1) {
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const rowValues = worksheet.getRow(i).values;
                // No exceljs, rowValues pode vir como um objeto ou array de CellValue
                if (rowValues && Array.isArray(rowValues) && rowValues.length > 1) {
                    linhas.push(rowValues);
                }
            }
        }
        return { workbook, worksheet, linhas };
    }

    // 2. Tipagem estrita dos parâmetros recebidos: instâncias legítimas do exceljs e matriz de linhas
        async salvarHistorico(workbook: ExcelJS.Workbook, todasAsLinhas: any[][]): Promise<void> {
        const worksheet = workbook.worksheets[0];
        
        if (!worksheet) {
            throw new Error(`Falha ao salvar histórico: Aba principal não pôde ser lida no workbook.`);
        }

        // LIMPEZA SEGURA CONTRA O ERRO DE REMOVETABLE:
        // Assim como na outra model, limpamos o dicionário de tabelas oculto da biblioteca
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

        worksheet.addTable({
            name: NOME_TABELA,
            ref: 'A1',
            headerRow: true,
            columns: [
                { name: 'ID' }, { name: 'Titulo' }, { name: 'Status' },
                { name: 'Data Criacao' }, { name: 'Tempo Espera (Min)' }, { name: 'Payload Completo' }
            ],
            rows: todasAsLinhas
        });

        await workbook.xlsx.writeFile(CAMINHO_EXCELW);
        const agora = new Date();
        fs.utimesSync(CAMINHO_EXCELW, agora, agora);
    }
}
