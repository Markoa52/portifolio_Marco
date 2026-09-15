import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import fs from 'node:fs'; // Essencial para criar a pasta física caso ela não exista

export class Database {
    private static instance: SQLiteDatabase | null = null;

    public static async getConnection(): Promise<SQLiteDatabase> {
        if (!this.instance) {
            // 1. Define o caminho absoluto exato fornecido por você
            const pastaCompartilhada = 'C:\\Site\\7-API-Microservicos_fullStack-V4';

            // 2. Garante que a estrutura de pastas exista no Windows antes de criar os arquivos
            if (!fs.existsSync(pastaCompartilhada)) {
                fs.mkdirSync(pastaCompartilhada, { recursive: true });
            }

            // 3. Monta o caminho dos dois arquivos de banco dentro da pasta escolhida
            const caminhoUsuario= path.join(pastaCompartilhada, 'Usuario.db');
            const caminhoFaturamento = path.join(pastaCompartilhada, 'FinancialBilling.db');
            const caminhoPrincipal = path.join(pastaCompartilhada, 'TollManagement.db');

            // 4. Inicializa o faturamento externamente
            const dbFatProvisorio = await open({
                filename: caminhoFaturamento,
                driver: sqlite3.Database
            });
            await dbFatProvisorio.close();

            const dbUserProvisorio = await open({
                filename: caminhoUsuario,
                driver: sqlite3.Database
            });
            await dbUserProvisorio.close();

            // 5. Abre o banco principal na pasta central
            this.instance = await open({
                filename: caminhoPrincipal, 
                driver: sqlite3.Database
            });
            
            console.log(`BANCOS COMPARTILHADOS ATIVOS EM: ${pastaCompartilhada}`);

            // 6. Anexa usando o caminho absoluto correto
            await this.instance.exec(`ATTACH DATABASE '${caminhoFaturamento}' AS banco_fat`);
            await this.instance.exec(`ATTACH DATABASE '${caminhoUsuario}' AS banco_user`);
        }
        return this.instance;
    }
}
