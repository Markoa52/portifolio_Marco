import { Database } from '../config/sqlConfig.js';
import sql from 'mssql';

export class usuarioRepository {

  // Método usado pelo Service para registrar o novo operador em disco
  async salvarNovoUsuario(dados: any, transaction?: sql.Transaction): Promise<number> {
    try {
      // 1. Se receber uma transação, cria o Request a partir dela. Se não, usa o pool global.
      const request = transaction ? new sql.Request(transaction) : new sql.Request(await Database.getConnection());

      // 2. Adicionada a cláusula OUTPUT INSERTED.id para capturar o ID do novo usuário no SQL Server
      const query = `
        INSERT INTO Usuario.dbo.usuario  (nome, usuario, email, senha, ativo, dataCriacao, perfil) 
        OUTPUT INSERTED.id
        VALUES (@nome, @usuario, @email, @senha, 0, GETDATE(), @perfil);
      `;

      // Atalho para mapear o objeto de entrada vindo do seu payload
      const usuarioDados = dados.js.contextoUsuario;

      // 3. Executa a inserção vinculando cada campo com segurança contra SQL Injection
      const result = await request
        .input('nome', sql.VarChar, usuarioDados.nome)
        .input('usuario', sql.VarChar, usuarioDados.usuario)
        .input('email', sql.VarChar, usuarioDados.email)
        .input('senha', sql.VarChar, usuarioDados.senha)
        .input('perfil', sql.VarChar, usuarioDados.perfil)
        .query(query);

      console.log(`✅ [UsuarioRepository] Usuário ${usuarioDados.usuario} criado com sucesso no SQL Server.`);
      
      // Retorna o ID gerado (Fica na primeira linha do recordset)
      return result.recordset[0]?.id;

    } catch (error: any) {
      console.error('❌ Erro ao inserir novo usuário no repositório:', error.message);
      throw error;
    }
  }


  async atualizarUsuario(dados: any, transaction?: sql.Transaction): Promise<number> {
    try {
      // 1. Usa a transação se fornecida, caso contrário o pool global
      const request = transaction ? new sql.Request(transaction) : new sql.Request(await Database.getConnection());

      // 2. Prepara a query com os parâmetros nomeados. Adicionado OUTPUT para retornar o ID atualizado.
      const query = `
        UPDATE Usuario.dbo.usuario 
        SET senha = @senha, 
            ativo = 1 
        OUTPUT INSERTED.id
        WHERE id = @usuarioId;
      `;

      // Atalho para mapear o objeto de entrada vindo do seu payload
      const usuarioDados = dados.js.contextoUsuario;

      // 3. Executa a atualização injetando os valores com segurança
      const result = await request
        .input('senha', sql.VarChar, usuarioDados.senha)
        .input('usuarioId', sql.Int, Number(usuarioDados.usuarioId))
        .query(query);

      console.log(`✅ [UsuarioRepository] Senha atualizada e usuário ID ${usuarioDados.usuarioId} ativado com sucesso.`);
      
      return result.recordset[0]?.id || Number(usuarioDados.usuarioId);

    } catch (error: any) {
      console.error('❌ Erro ao atualizar usuário no repositório:', error.message);
      throw error;
    }
  }

  async inativarAtivarUsuario(dados: any, transaction?: sql.Transaction): Promise<void> {
    try {
      // 1. Usa a transação se fornecida, caso contrário o pool global
      const request = transaction ? new sql.Request(transaction) : new sql.Request(await Database.getConnection());

      // 2. Prepara a query trocando os "?" por parâmetros nomeados (@...)
      const query = `
        UPDATE usuario 
        SET ativo = @statusFinal 
        WHERE id = @idFinal;
      `;
      
      // Mantém as leituras com fallbacks seguros que você criou
      const statusFinal = dados.novoStatus !== undefined ? dados.novoStatus : dados.status;
      const idFinal = dados.usuarioId || dados.idUsuario;

      console.log(`💾 [Repositório SQL Server] Aplicando status ${statusFinal} no Usuário ID ${idFinal}`);

      // 3. Executa a atualização injetando os valores com segurança
      await request
        .input('statusFinal', sql.Bit, statusFinal)
        .input('idFinal', sql.Int, Number(idFinal))
        .query(query);
        
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status usuário no repositório:', error.message);
      throw error;
    }
  }

  async vincularContrato(dados: any, transaction?: sql.Transaction): Promise<void> {
    try {
      // 1. Usa a transação se fornecida, caso contrário o pool global
      const request = transaction ? new sql.Request(transaction) : new sql.Request(await Database.getConnection());

      // 2. Prepara a query com os parâmetros nomeados do SQL Server (@...)
      const query = `
        INSERT INTO Usuario.dbo.usuarioContrato (usuarioId, contratoId, vinculadoEm) 
        VALUES (@usuarioId, @contratoId, GETDATE());
      `;

      // Atalho para acessar as informações do payload com facilidade
      const contexto = dados.js.contextoUsuario;

      // 3. Executa a inserção vinculando as propriedades com segurança contra SQL Injection
      await request
        .input('usuarioId', sql.Int, Number(contexto.usuarioId))
        .input('contratoId', sql.Int, Number(contexto.contratoId)) // Use o alias correto @contractId/contratoId de acordo com sua coluna
        .query(query);

      console.log(`✅ [ContratoRepository] Usuário ID ${contexto.usuarioId} vinculado ao Contrato ID ${contexto.contratoId} com sucesso.`);

    } catch (error: any) {
      console.error('❌ Erro ao vincular contrato ao usuário no repositório:', error.message);
      throw error;
    }
  }
}
