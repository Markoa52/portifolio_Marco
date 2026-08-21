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
            const caminhoFaturamento = path.join(pastaCompartilhada, 'FinancialBilling.db');
            const caminhoPrincipal = path.join(pastaCompartilhada, 'TollManagement.db');

            // 4. Inicializa o faturamento externamente
            const dbFatProvisorio = await open({
                filename: caminhoFaturamento,
                driver: sqlite3.Database
            });
            await dbFatProvisorio.close();

            // 5. Abre o banco principal na pasta central
            this.instance = await open({
                filename: caminhoPrincipal, 
                driver: sqlite3.Database
            });
            
            console.log(`BANCOS COMPARTILHADOS ATIVOS EM: ${pastaCompartilhada}`);

            // 6. Anexa usando o caminho absoluto correto
            await this.instance.exec(`ATTACH DATABASE '${caminhoFaturamento}' AS banco_fat`);
            
            // ... Seus comandos CREATE TABLE continuam exatamente iguais abaixo ...

            
            // ... Seus comandos CREATE TABLE continuam exatamente iguais abaixo ...

            console.log(' Banco FinancialBilling.db anexado com sucesso!');

            // 4. CRIAÇÃO DAS TABELAS (Garantindo a execução síncrona dos blocos)
            console.log('Criando tabelas no banco de dados...');

            //   await this.instance.exec(`
            //   ALTER TABLE contrato ADD COLUMN diaSemanaCorte;
            //   ALTER TABLE banco_fat.contrato_faturamento ADD COLUMN diaSemanaCorte;
            // `);

            // await this.instance.exec(`DELETE FROM sqlite_sequence;`)
            // await this.instance.exec(`DELETE FROM banco_fat.sqlite_sequence;`);

            // await this.instance.exec(`
            //   DELETE FROM contrato;
            //   DELETE FROM person; -- Adicionada para limpar as pessoas também
            //   DELETE FROM endereco;
            //   DELETE FROM contato;
            //   DELETE FROM responsavelLegal;
            //   DELETE FROM banco_fat.contrato_faturamento;
            //   DELETE FROM banco_fat.person_faturamento;
            //   DELETE FROM banco_fat.endereco_faturamento;
            //   DELETE FROM banco_fat.bill;
            // `);


            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS contrato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataInicio TEXT,
                dataEncerramento TEXT,
                CorteFaturamentoTipo INTEGER,
                planoComercializadoTipo INTEGER,
                valorMensalidade REAL,
                valorTag REAL,
                planoPagamentoTipo INTEGER,
                diaFaturamento INTEGER,
                cnjp TEXT,
                prazoPagamento INTEGER,
                diaSemanaCorte INTEGER,
                contratoStatusId INTEGER
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS person (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                documentNumber TEXT,
                nomeEmpresa TEXT,
                contractId INTEGER,
                FOREIGN KEY (contractId) REFERENCES contrato(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS endereco (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cep TEXT,
                rua TEXT,
                numero TEXT,
                bairro TEXT,
                cidade TEXT,
                estado TEXT,
                complemento TEXT,
                personId INTEGER,
                documentNumber TEXT,
                FOREIGN KEY (personId) REFERENCES person(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS contato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telefone TEXT,
                email TEXT,
                personId INTEGER,
                FOREIGN KEY (personId) REFERENCES person(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS responsavelLegal (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                personId INTEGER,
                documentNumber TEXT,
                FOREIGN KEY (personId) REFERENCES person(id)
              );
            `);

            await this.instance.exec(`CREATE TABLE IF NOT EXISTS corteFaturamentoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS planoComercializadoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS planoPagamentoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS contractoStatusTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);

            // TABELAS NO BANCO DE FATURAMENTO (banco_fat)
            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.contrato_faturamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataInicio TEXT,
                dataEncerramento TEXT,
                CorteFaturamentoTipo INTEGER,
                planoComercializadoTipo INTEGER,
                valorMensalidade REAL,
                valorTag REAL,
                planoPagamentoTipo INTEGER,
                diaFaturamento INTEGER,
                cnpj TEXT,
                tmContractId INTEGER,
                prazoPagamento INTEGER,
                diaSemanaCorte INTEGER,
                contratoStatusId INTEGER
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.person_faturamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                documentNumber TEXT,
                nomeEmpresa TEXT,
                contractId INTEGER,
                tmPersonId INTEGER,
                FOREIGN KEY (contractId) REFERENCES contrato_faturamento(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.endereco_faturamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cep TEXT,
                rua TEXT,
                numero TEXT,
                bairro TEXT,
                cidade TEXT,
                estado TEXT,
                complemento TEXT,
                personId INTEGER,
                tmEnderecoId INTEGER,
                documentNumber TEXT,
                FOREIGN KEY (personId) REFERENCES person_faturamento(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.bill (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contractId INTEGER,
                dataAbertura TEXT,
                dataFechamento TEXT,
                dataVencimento TEXT,
                status INTEGER,
                FOREIGN KEY (contractId) REFERENCES contrato_faturamento(id)
              );
            `);

            await this.instance.exec(`CREATE TABLE IF NOT EXISTS banco_fat.billStatusTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);

            console.log('[Sucesso] Todas as tabelas relacionais foram geradas e persistidas!');
        }
        return this.instance;
    }
}
