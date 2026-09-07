import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';

export class Database {
    private static instance: SQLiteDatabase | null = null;

    public static async getConnection(): Promise<SQLiteDatabase> {
        if (!this.instance) {
            // 1. Aponta exatamente para a pasta central de microsserviços
            const pastaCompartilhada = 'C:\\Site\\7-API-Microservicos_fullStack-V4';

            const caminhoUsuario = path.join(pastaCompartilhada, 'Usuario.db');
            const caminhoFaturamento = path.join(pastaCompartilhada, 'FinancialBilling.db');
            const caminhoPrincipal = path.join(pastaCompartilhada, 'TollManagement.db');

            // 2. Abre o arquivo do banco principal que já contém as tabelas
            this.instance = await open({
                filename: caminhoPrincipal, 
                driver: sqlite3.Database
            });
            
            console.log(`[Microsserviço 2] Conectado ao banco compartilhado com sucesso!`);

            // 3. ANEXA O SEGUNDO BANCO (FinancialBilling)
            await this.instance.exec(`ATTACH DATABASE '${caminhoFaturamento}' AS banco_fat`);
            await this.instance.exec(`ATTACH DATABASE '${caminhoUsuario}' AS banco_user`);
            
            // 4. CONFIGURAÇÃO DE SEGURANÇA CONTRA CONCORRÊNCIA (MUITO IMPORTANTE!)
            // Avisa o SQLite para aguardar até 5 segundos (5000ms) se o outro microsserviço
            // estiver gravando algo no mesmo instante, evitando o erro "database is locked"
            await this.instance.configure('busyTimeout', 5000);
            
            console.log('🔗 [Microsserviço 2] Banco de Faturamento anexado e filas de espera prontas.');
        }
        return this.instance;
    }
}
