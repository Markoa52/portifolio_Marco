import { open, Database as SQLiteInstance } from 'sqlite'; // 💡 CORREÇÃO 1: Apelidamos o tipo importado para 'SQLiteInstance'
import sqlite3 from 'sqlite3';
import path from 'node:path';
import fs from 'node:fs';

// CORREÇÃO 2: Renomeamos a sua classe para DatabaseConnection para evitar conflitos de nomes
export class DatabaseConnection {
    // Tipagem robusta do driver para garantir que as propriedades .lastID e .changes funcionem nos repositórios
    private static instance: SQLiteInstance<sqlite3.Database, sqlite3.Statement> | null = null;

    public static async getConnection(): Promise<SQLiteInstance<sqlite3.Database, sqlite3.Statement>> {
        if (!this.instance) {
            // 1. Define o caminho absoluto da sua pasta mestre no Windows
            const pastaCompartilhada = 'C:\\Site\\7-API-Microservicos_fullStack-V4';

            // 2. Garante que a pasta física exista antes de criar o arquivo
            if (!fs.existsSync(pastaCompartilhada)) {
                fs.mkdirSync(pastaCompartilhada, { recursive: true });
            }

            // 3. Monta o caminho apenas do banco principal TollManagement
            const caminhoPrincipal = path.join(pastaCompartilhada, 'TollManagement.db');

            console.log(`\n [SQLite] Abrindo arquivo de banco de dados: ${caminhoPrincipal}`);

            // 4. Abre a instância do banco de forma assíncrona
            this.instance = await open({
                filename: caminhoPrincipal, 
                driver: sqlite3.Database
            });

            // 5. Ativa o suporte a chaves estrangeiras no arquivo físico
            await this.instance.exec('PRAGMA foreign_keys = ON;');
            
            console.log('[SQLite] Conectado com sucesso ao banco principal TollManagement.db!');
        }
        return this.instance;
    }
}
