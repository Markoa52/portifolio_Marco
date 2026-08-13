// contratoRepository.js
export class ContratoRepository {
  async findById(contractId) {
    // Aqui simularia um "SELECT * FROM contratos WHERE id = contractId"
    if (contractId === "1") {
      return { id: "1", nome: "Teste", saldo: 1000.00, gastos: 3200.00 };
    }
    return null;
  }
}