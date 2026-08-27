import {DatabaseConnection} from '../config/sqlLiteConfig.js';

export class veiculoRepository {

  async criarVeiculo(veiculoData: any, contratoId: number) {

    const db = await DatabaseConnection.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
        // 2. CORREÇÃO: Substituído todos os ':' por '?' e ajustado a coluna para 'cnjp'
        // removido o caractere quebrado ': 1' e colocado o '?' correspondente
        const query = `
          INSERT INTO veiculo (
            placa, marca, modelo, tipoVeiculo, eixo, rntc, documento, contratoId, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); -- 💡 Mudado para 9 interrogações
        `;

        // 3. CORREÇÃO: Passando o array de valores na ordem exata dos '?'
        // Executa passando as variáveis na ordem exata e com a grafia idêntica ao payload
        const resultadoPrincipal = await db.run(query, [
          veiculoData.placa || null,
          veiculoData.marca || null,
          veiculoData.modelo || null,
          veiculoData.tipoveiculo || veiculoData.tipoVeiculo || null,
          veiculoData.eixo || null,
          veiculoData.rntc || null,
          veiculoData.documento || null,
          contratoId,
          veiculoData.status || 'aguardando ativação' // CORREÇÃO: Garante que grave 'ativo' se vier em branco
        ]);

        // Captura o ID auto-incremental gerado pelo banco para este VEÍCULO
        const veiculoId = resultadoPrincipal.lastID;

        console.log(`Veiculo Gerada com sucesso! ID: ${veiculoId}`);
        return veiculoId;

    } catch (error: any) {
      console.error("Erro no processamento do veiculo Repository:", error.message);
      throw error;
    }
  }

  // Passamos o veiculoId (gerado no passo anterior) e o saldoInicial diretamente como argumentos
  async criarContaVeiculo(veiculoId: number, saldoInicial: number = 0) {
    const db = await DatabaseConnection.getConnection();
    await db.configure('busyTimeout', 5000);

    try {
        // Query direta e ultra-rápida, sem subqueries desnecessárias
        const query = `
          INSERT INTO contaVeiculo (veiculoId, saldoContaVeiculo) 
          VALUES (?, ?);
        `;

        // Passa as duas variáveis na ordem exata das colunas
        const resultado = await db.run(query, [
            veiculoId,   // 1º ? (veiculoId)
            saldoInicial // 2º ? (saldoContaVeiculo - ex: 0 ou o valor que vier da fila)
        ]);

        // Captura o ID da conta gerada
        const veiculoContaId = resultado.lastID;

        console.log(`[Repositório] Conta do veículo gravada com sucesso! ID da Conta: ${veiculoContaId}`);
        return veiculoContaId; 
    
    } catch (error: any) {
        console.error("Erro no processamento do contaVeiculo Repository:", error.message);
        throw error;
    }
}

}
