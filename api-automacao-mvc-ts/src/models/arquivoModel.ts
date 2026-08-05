// src/models/arquivoModel.ts
import fs from 'fs';
import path from 'path';
import os from 'os'; // Importação nativa para gerenciar o arquivo temporário
import * as xlsx from 'xlsx';
import { CAMINHO_EXCEL } from '../config/excelConfig';

export class ArquivoModel {
    // 1. Tipagem de retorno definida como um Array de objetos com chaves dinâmicas textuais
    static obterDadosBrutosBypass(): Record<string, string>[] {
        if (!fs.existsSync(CAMINHO_EXCEL)) {
            console.log(`Arquivo de e-mails não encontrado em: ${CAMINHO_EXCEL}`);
            return [];
        }

        // Caminhos para a criação da cópia temporária isolada do OneDrive
        const nomeArquivoTemp = `temp_leitura_arq_${Date.now()}.xlsx`;
        const caminhoTemporario = path.join(os.tmpdir(), nomeArquivoTemp);

        try {
            // 2. Atualiza a data de modificação no arquivo original para forçar o bypass do cache
            const tempoAtual = new Date();
            fs.utimesSync(CAMINHO_EXCEL, tempoAtual, tempoAtual);

            // 3. Cria uma cópia exata do arquivo na pasta TEMP do sistema operacional
            // Isso clona os bytes de forma atômica e dribla o bloqueio de arquivos do OneDrive
            fs.copyFileSync(CAMINHO_EXCEL, caminhoTemporario);

            // 4. Lê o buffer a partir do arquivo temporário isolado de forma limpa (mata o EBADF)
            const arquivoBuffer = fs.readFileSync(caminhoTemporario);

            const workbook = xlsx.read(arquivoBuffer, { type: 'buffer', cellDates: true });
            
            const nomePrimeiraAba = workbook.SheetNames[0]; // Captura o nome da primeira string
            if (!nomePrimeiraAba) {
                throw new Error("O arquivo Excel foi lido, mas não possui nenhuma aba (Sheet) válida.");
            }

            const abaPlanilha = workbook.Sheets[nomePrimeiraAba];
            if (!abaPlanilha) {
                throw new Error(`A aba com o nome "${nomePrimeiraAba}" não pôde ser carregada.`);
            }

            // Converte a aba validada para JSON tipando explicitamente as linhas brutas
            const dadosJsonRaw = xlsx.utils.sheet_to_json<Record<string, any>>(abaPlanilha);

            // 5. Mapeia e sanitiza as linhas e chaves aplicando tipagens estritas contra erros de índice
            return dadosJsonRaw.map((item: Record<string, any>) => {
                const linha: Record<string, string> = {};
                Object.keys(item).forEach((chave: string) => {
                    const valor = item[chave]; // Aceito sem erros porque 'chave' é garantida como string
                    linha[chave.trim()] = (valor !== null && valor !== undefined) ? valor.toString().trim() : '';
                });
                return linha;
            });

        } catch (error: any) {
            console.error("Falha crítica ao ler a planilha de arquivos via cópia temporária:", error.message);
            return [];
        } finally {
            // 6. GARANTIA: Remove o arquivo temporário do disco após o término para não acumular lixo
            if (fs.existsSync(caminhoTemporario)) {
                try {
                    fs.unlinkSync(caminhoTemporario);
                } catch (err) {
                    console.log("O arquivo temporário da planilha de arquivos será limpo pelo sistema operacional mais tarde.");
                }
            }
        }
    }
}

export const obterDadosBrutosBypass = ArquivoModel.obterDadosBrutosBypass;