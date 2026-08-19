import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function iniciarConsumers(): Promise<void> {
    const pasta = path.join(__dirname, '../consumers');

    // Verifica se a pasta existe antes de ler para evitar quebras
    if (!fs.existsSync(pasta)) {
        console.error(`A pasta de consumers não foi encontrada em: ${pasta}`);
        return;
    }

    const arquivos = fs.readdirSync(pasta);

    for (const arquivo of arquivos) {
        // Ajustado para aceitar tanto .js (produção/compilado) quanto .ts (desenvolvimento com tsx)
        if (arquivo.endsWith('Consumer.js') || arquivo.endsWith('Consumer.ts')) {
            
            const caminhoCompleto = path.join(pasta, arquivo);
            
            // CORREÇÃO CRÍTICA: Converte o caminho do Windows em uma URL de arquivo válida (file:///) para o import()
            const urlDoModulo = pathToFileURL(caminhoCompleto).href;

            console.log(`Iniciando ${arquivo}...`);

            // Importação dinâmica nativa do ES Modules
            const modulo = await import(urlDoModulo);

            // Executa a função exportada. 
            // Se você usou "export default", chama modulo.default(). Se usou "export function iniciarConsumer", chama modulo.iniciarConsumer().
            if (typeof modulo.default === 'function') {
                await modulo.default();
            } else if (typeof modulo.iniciarConsumer === 'function') {
                await modulo.iniciarConsumer();
            } else {
                console.warn(`Aviso: O arquivo ${arquivo} não exporta uma função padrão (default) ou 'iniciarConsumer'.`);
            }
        }
    }
}
