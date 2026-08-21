// import sql from 'mssql';

// const config: sql.config = {
//     user: 'api_user',            // O usuário que você criou no Passo 2
//     password: 'senha123',       // A senha que você definiu no Passo 2
//     server: '127.0.0.1',         // IP local do banco
//     port: 1433,                  // Porta que ativamos no Registro do Windows
//     database: 'TollManagment', // Substitua pelo nome real do seu banco de dados
//     options: {
//         encrypt: false,          // Mantém desativado para o ambiente local
//         trustServerCertificate: true // Ignora erros de certificado autoassinado
//     }
// };

// export class Database {
//     private static pool: sql.ConnectionPool | null = null;

//     public static async getConnection(): Promise<sql.ConnectionPool> {
//         if (!this.pool) {
//             this.pool = await sql.connect(config);
//             console.log('📶 Conectado ao SQL Server via Usuário SQL com sucesso!');
//         }
//         return this.pool;
//     }
// }
