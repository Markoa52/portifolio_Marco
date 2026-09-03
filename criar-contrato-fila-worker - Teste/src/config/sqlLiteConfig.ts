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
            
            // ... Seus comandos CREATE TABLE continuam exatamente iguais abaixo ...

            
            // ... Seus comandos CREATE TABLE continuam exatamente iguais abaixo ...

            console.log(' Banco FinancialBilling.db e Usuario.db anexado com sucesso!');

            // 4. CRIAÇÃO DAS TABELAS (Garantindo a execução síncrona dos blocos)
            console.log('Criando tabelas no banco de dados...');

            //await this.instance.exec(`UPDATE contaVeiculo set saldoContaVeiculo=68.90 where id=1;`);
            //await this.instance.exec(`UPDATE contaVeiculo set saldoContaVeiculo=50 where id=2;`);

            //await this.instance.exec(`UPDATE banco_user.usuario set perfil='atendimento' where id=3;`);
            //await this.instance.exec(`UPDATE banco_user.usuario set perfil='admin' where id=1;`);
            //await this.instance.exec(`DROP TABLE banco_user.usuarioContrato`);
            //await this.instance.exec(`DROP TABLE ContaVeiculo`);
            //await this.instance.exec(`DROP TABLE contaContrato`);
            //await this.instance.exec(`INSERT INTO tag (cnpj, contratoId, limiteContrato, saldoContrato) VALUES ('01111101101', 1, 5000, 0)`);

            //await this.instance.exec(`INSERT INTO pedidoTagRastreamento (dataRegistro, statusPedidoId, pedidoTagId) VALUES ('2026-08-28', 3, 1)`);
            //await this.instance.exec(`UPDATE pedidoTagRastreamento set statusPedidoId=2 where id=3;`);
          
            //await this.instance.exec(` ALTER TABLE banco_user.usuario ADD COLUMN perfil;`);

            //   await this.instance.exec(`
            //   ALTER TABLE contrato ADD COLUMN diaSemanaCorte;
            //   ALTER TABLE banco_fat.contrato_faturamento ADD COLUMN diaSemanaCorte;
            // `);

            //await this.instance.exec(`DELETE FROM sqlite_sequence;`)
            //await this.instance.exec(`DELETE FROM banco_fat.sqlite_sequence;`);

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
              CREATE TABLE IF NOT EXISTS contaContrato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cnpj TEXT,
                contratoId INTEGER,
                limiteContrato REAL,
                saldoContrato REAL,
                FOREIGN KEY (contratoId) REFERENCES contrato(id)
              );

            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS lancamentoContabilContrato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contaContratoId INTEGER,
                valorTransacao REAL,
                saldoAposTransacao REAL,
                trasacaoProcessamentoId INTEGER,
                transacaoContratoTipo INTEGER,
                FOREIGN KEY (contaContratoId) REFERENCES contaContrato(id),
                FOREIGN KEY (trasacaoProcessamentoId) REFERENCES trasacaoProcessamento(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS trasacaoProcessamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contratoId INTEGER,
                valorTransacaoPedagio REAL,
                valorCobradoPedagio REAL,
                valorCobradoValePedagio REAL,
                valorReembolso REAL,
                pracaPedagio TEXT,
                documentoEmbarcador TEXT,
                recargaValePedagioId INETEGER,
                statusViagemTipo INTEGER,
                FOREIGN KEY (contratoId) REFERENCES contrato(id),
                FOREIGN KEY (recargaValePedagioId) REFERENCES recargaValePedagio(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS recargaValePedagio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contratoId INTEGER,
                trasacaoProcessamentoId INTEGER,
                valorRecarga REAL,
                FOREIGN KEY (contratoId) REFERENCES contrato(id),
                FOREIGN KEY (trasacaoProcessamentoId) REFERENCES trasacaoProcessamento(id)
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

             await this.instance.exec(`
               CREATE TABLE IF NOT EXISTS veiculo (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 placa TEXT NOT NULL,
                 marca TEXT,
                 modelo TEXT,
                 tipoveiculo TEXT,
                 eixo TEXT,
                 rntc TEXT,
                 documento TEXT,
                 contratoId INTEGER,
                 status TEXT DEFAULT 'aguardando ativação', -- NOVO CAMPO: Inicia automaticamente como 'ativo'
                 FOREIGN KEY (contratoId) REFERENCES contrato(id)
               );
             `);

              await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS contaVeiculo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                veiculoId INTEGER,
                saldoContaVeiculo REAL,
                FOREIGN KEY (veiculoId) REFERENCES veiculo(id)
              );

            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS lancamentoContabilVeiculo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contaVeiculoId INTEGER,
                valorTransacao REAL,
                saldoAposTransacao REAL,
                trasacaoProcessamentoId INTEGER,
                transacaoVeiculoTipo INTEGER,
                recargaValePedagioId INETEGER,
                pagamentoPix INTEGER,
                pagamentoCartao INTEGER,
                FOREIGN KEY (contaVeiculoId) REFERENCES contaVeiculo(id),
                FOREIGN KEY (trasacaoProcessamentoId) REFERENCES trasacaoProcessamento(id),
                FOREIGN KEY (recargaValePedagioId) REFERENCES recargaValePedagio(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS relatorioBillItem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                billItemId INTEGER,
                billItemTipo REAL,
                contratoId INTEGER,
                valor REAL,
                FOREIGN KEY (contratoId) REFERENCES contrato(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS relatorioPassagem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contratoId INTEGER,
                dataInicio DATE,
                dataFim DATE,
                valorTransacaoPedagio REAL,
                valorCobradoPedagio REAL,
                valorCobradoValePedagio REAL,
                valorReembolso REAL,
                pracaPedagio TEXT,
                trasacaoProcessamentoId INTEGER,
                status INTEGER,
                valor REAL,
                FOREIGN KEY (contratoId) REFERENCES contrato(id),
                FOREIGN KEY (trasacaoProcessamentoId) REFERENCES trasacaoProcessamento(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS relatorioExtrato (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contratoId INTEGER,
                dataViagem DATE,
                valorTransacaoPedagio REAL,
                valorCobradoPedagio REAL,
                valorCobradoValePedagio REAL,
                valorReembolso REAL,
                pracaPedagio TEXT,
                trasacaoProcessamentoId INTEGER,
                extratoTipo INTEGER,
                FOREIGN KEY (contratoId) REFERENCES contrato(id),
                FOREIGN KEY (trasacaoProcessamentoId) REFERENCES trasacaoProcessamento(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS tag (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                contratoId INTEGER,
                pedidoTagId INTEGER,
                serial TEXT,
                disponivel INTEGER,
                FOREIGN KEY (contratoId) REFERENCES contrato(id)
              );
            `);

            //await this.instance.exec(`INSERT INTO tag (dataRegistro, contratoId, pedidoTagId, serial, disponivel) VALUES ('2026-08-31', 1, 1, '011111123654', 1)`);
            //await this.instance.exec(`INSERT INTO tag (dataRegistro, contratoId, pedidoTagId, serial, disponivel) VALUES ('2026-08-31', 1, 1, '011111123655', 1)`);
            //await this.instance.exec(`INSERT INTO tag (dataRegistro, contratoId, pedidoTagId, serial, disponivel) VALUES ('2026-08-31', 1, 1, '011111123656', 1)`);
            //await this.instance.exec(`INSERT INTO tag (dataRegistro, contratoId, pedidoTagId, serial, disponivel) VALUES ('2026-08-31', 1, 1, '011111123657', 1)`);
            //await this.instance.exec(`INSERT INTO tag (dataRegistro, contratoId, pedidoTagId, serial, disponivel) VALUES ('2026-08-31', 1, 1, '011111123658', 1)`);

          await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS pedidoTag (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                nomeComprador TEXT,
                telefone TEXT,
                email TEXT,
                quantidade INTEGER,
                valorUnidade REAL,
                valorTotal REAL,
                enderecoEntrega TEXT,
                contratoId INTEGER,
                responsavelRecebimento TEXT,
                usuarioPedido INTEGER,
                FOREIGN KEY (contratoId) REFERENCES contrato(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS pedidoTagRastreamento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                statusPedidoId INTEGER,
                pedidoTagId INTEGER,
                FOREIGN KEY (pedidoTagId) REFERENCES pedidoTag(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS contratoVeiculoTag (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                tagId INTEGER,
                contratoVeiculoTagStatusTipo INTEGER,
                contratoVeiculoTagServiceTipo,
                FOREIGN KEY (tagId) REFERENCES tag(id)
              );
            `);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS osaManufaturaTag (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                lote INTEGER,
                serial INTEGER
              );
            `);

            await this.instance.exec(`CREATE TABLE IF NOT EXISTS contratoVeiculoTagServiceTipo (id INTEGER PRIMARY KEY AUTOINCREMENT,descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS contratoVeiculoTagStatusTipo (id INTEGER PRIMARY KEY AUTOINCREMENT,descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS statusPedidoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descrição TEXT);`);

            await this.instance.exec(`CREATE TABLE IF NOT EXISTS veiculoMarcaTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS veiculoModeloTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS veiculoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS eixoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);


            await this.instance.exec(`CREATE TABLE IF NOT EXISTS corteFaturamentoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS planoComercializadoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS planoPagamentoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS contratoStatusTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS statusViagemTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS transacaoVeiculoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS transacaoContratoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS extratoTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.contratoVeiculoTag (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataRegistro TEXT,
                TmTagId INTEGER,
                contratoVeiculoTagStatusTipo INTEGER,
                contratoVeiculoTagServiceTipo
              );
            `);
            
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

            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_fat.billItem (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                billId INTEGER,
                billItemTipo INTEGER,
                contractId INTEGER,
                dataRegistro TEXT,
                valor TEXT,
                FOREIGN KEY (billId) REFERENCES bill(id)
              );
            `);

            await this.instance.exec(`CREATE TABLE IF NOT EXISTS banco_fat.billStatusTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);
            await this.instance.exec(`CREATE TABLE IF NOT EXISTS banco_fat.billItemTipo (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT);`);

            //await this.instance.exec(`INSERT INTO banco_fat.billItem (billId, billItemTipo, contractId, dataRegistro, valor) VALUES (null, 9, 1, datetime('now', 'localtime'), 100);`);
            //await this.instance.exec(`INSERT INTO banco_fat.billItem (billId, billItemTipo, contractId, dataRegistro, valor) VALUES (null, 9, 1, datetime('now', 'localtime'), 630);`);

            //await this.instance.exec(`DROP TABLE banco_fat.bill_item`);
            //await this.instance.exec(`DROP TABLE veiculo`);
            //await this.instance.exec(`DELETE FROM banco_fat.bill where id=2`);
            //await this.instance.exec(`INSERT INTO banco_fat.bill (contractId, dataAbertura, dataFechamento, dataVencimento, status) VALUES (1, '2026-07-14', '2026-08-14', '2026-08-26', 4);`);

            //await this.instance.exec(`UPDATE banco_fat.bill set status=3 where id=3`);


            // TABELAS NO BANCO DE USUARIO (banco_user)
            await this.instance.exec(`
              CREATE TABLE IF NOT EXISTS banco_user.usuario (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                usuario TEXT,
                email TEXT,
                senha TEXT,
                ativo INTEGER,
                dataCriacao TEXT,
                perfil TEXT
              );
            `);

            await this.instance.exec(`
               CREATE TABLE IF NOT EXISTS banco_user.usuarioContrato (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               usuarioId INTEGER NOT NULL,
               contratoId INTEGER NOT NULL, -- Mantemos o ID do contrato guardado aqui
               vinculadoEm DATETIME DEFAULT CURRENT_TIMESTAMP,
               
               -- CHAVE ESTRANGEIRA LOCAL: Funciona perfeitamente porque 'usuarios' está no mesmo arquivo
               FOREIGN KEY (usuarioId) REFERENCES usuario(id) ON DELETE CASCADE,
               
               -- REMOVIDO: FOREIGN KEY (contratoId) REFERENCES contrato(id)
               
               -- TRAVA DE DUPLICIDADE: Continua a impedir o mesmo vínculo repetido
               UNIQUE(usuarioId, contratoId)
               );
            `);

            console.log('[Sucesso] Todas as tabelas relacionais foram geradas e persistidas!');
        }
        return this.instance;
    }
}
