import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';

export class Database {
    // Armazena a instância única da conexão com o SQLite
    private static instance: SQLiteDatabase | null = null;

    public static async getConnection(): Promise<SQLiteDatabase> {
        if (!this.instance) {
            // Abre a conexão apontando para um arquivo local
            this.instance = await open({
                filename: './meubanco.db', // Nome do arquivo que será criado no seu projeto
                driver: sqlite3.Database
            });
            
            console.log('Conectado ao SQLite com sucesso! Arquivo: ./meubanco.db');
        }
        return this.instance;
    }
}
