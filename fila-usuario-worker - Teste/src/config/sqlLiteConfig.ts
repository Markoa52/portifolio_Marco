import { open, Database as SQLiteInstance } from 'sqlite'; 
import sqlite3 from 'sqlite3';
import path from 'node:path';
import fs from 'node:fs';

export class DatabaseConnection {
    private static instance: SQLiteInstance<sqlite3.Database, sqlite3.Statement> | null = null;

    public static async getConnection(): Promise<SQLiteInstance<sqlite3.Database, sqlite3.Statement>> {
        if (!this.instance) {
            const pastaCompartilhada = 'C:\\Site\\7-API-Microservicos_fullStack-V4';

            if (!fs.existsSync(pastaCompartilhada)) {
                fs.mkdirSync(pastaCompartilhada, { recursive: true });
            }

            const caminhoPrincipal = path.join(pastaCompartilhada, 'TollManagement.db');
            // 💡 PASSO Novo: Monta o caminho do segundo banco de dados
            const caminhoUsuarios = path.join(pastaCompartilhada, 'Usuario.db'); 
            
            console.log(`\n 💾 [SQLite] Abrindo arquivo de banco de dados: ${caminhoPrincipal}`);

            this.instance = await open({
                filename: caminhoPrincipal, 
                driver: sqlite3.Database
            });

            // 💡 PASSO Novo: Vincula o banco de contratos à conexão atual do Usuario.db
            // Usamos a cláusula 'as contrato' para que o SQLite saiba como procurar a tabela
            await this.instance.exec(`ATTACH DATABASE '${caminhoUsuarios.replace(/\\/g, '\\\\')}' AS contrato;`);
            console.log(`🔗 [SQLite] Banco secundário Contrato.db vinculado com sucesso!`);

            await this.instance.exec('PRAGMA foreign_keys = ON;');
            
            console.log('[SQLite] Conectado com sucesso ao banco principal Usuario.db!');
        }
        return this.instance;
    }
}
