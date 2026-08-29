import sql from 'mssql';

export class veiculoRepository {

  async criarVeiculo(veiculoData: any, contratoId: number, transaction: sql.Transaction) {
  try {
      // Cria o request vinculado diretamente à transação ativa recebida por parâmetro
      const request = new sql.Request(transaction);

      // SQL Server usa parâmetros nomeados (@parametro) e retorna o ID criado com OUTPUT INSERTED.id
      const query = `
        INSERT INTO veiculo (
          placa, marca, modelo, tipoVeiculo, eixo, rntc, documento, contratoId, status
        )
        OUTPUT INSERTED.id
        VALUES (
          @placa, @marca, @modelo, @tipoVeiculo, @eixo, @rntc, @documento, @contratoId, @status
        );
      `;

      // Mapeamento e tipagem dos parâmetros para evitar SQL Injection
      const resultado = await request
        .input('placa', sql.VarChar, veiculoData.placa || null)
        .input('marca', sql.VarChar, veiculoData.marca || null)
        .input('modelo', sql.VarChar, veiculoData.modelo || null)
        .input('tipoVeiculo', sql.VarChar, veiculoData.tipoveiculo || veiculoData.tipoVeiculo || null)
        .input('eixo', sql.VarChar, veiculoData.eixo || null)
        .input('rntc', sql.VarChar, veiculoData.rntc || null)
        .input('documento', sql.VarChar, veiculoData.documento || null)
        .input('contratoId', sql.Int, contratoId)
        .input('status', sql.VarChar, veiculoData.status || 'aguardando ativação')
        .query(query);

      // Captura o ID gerado que foi retornado pelo OUTPUT
      const veiculoId = resultado.recordset[0]?.id;

      console.log(`Veiculo Gerado com sucesso! ID: ${veiculoId}`);
      return veiculoId;

  } catch (error: any) {
    console.error("Erro no processamento do veiculo Repository:", error.message);
    throw error;
  }
}

// Passamos o veiculoId (gerado no passo anterior) e o saldoInicial diretamente como argumentos
async criarContaVeiculo(veiculoId: number, saldoInicial: number = 0, transaction: sql.Transaction) {
  try {
      // Cria o request vinculado à mesma transação
      const request = new sql.Request(transaction);

      const query = `
        INSERT INTO contaVeiculo (veiculoId, saldoContaVeiculo) 
        OUTPUT INSERTED.id
        VALUES (@veiculoId, @saldoContaVeiculo);
      `;

      const resultado = await request
        .input('veiculoId', sql.Int, veiculoId)
        .input('saldoContaVeiculo', sql.Decimal(18, 2), saldoInicial) // Ajustado para Decimal se for campo de valor/moeda
        .query(query);

      // Captura o ID da conta gerada retornado pelo OUTPUT
      const veiculoContaId = resultado.recordset[0]?.id;

      console.log(`[Repositório] Conta do veículo gravada com sucesso! ID da Conta: ${veiculoContaId}`);
      return veiculoContaId; 
  
  } catch (error: any) {
      console.error("Erro no processamento do contaVeiculo Repository:", error.message);
      throw error;
  }
}

}
