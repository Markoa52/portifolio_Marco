// contratoService.js
export class ContratoService {
  // O Service recebe o Repository de fora (Injeção de Dependência)
  constructor(contratoRepository) {
    this.contratoRepository = contratoRepository;
  }

  async obterDetalhesDoContrato(contractId) {
    const contrato = await this.contratoRepository.findById(contractId);
    
    if (!contrato) {
      throw new Error("Contrato não encontrado no sistema.");
    }

    // Aplica uma lógica de negócio: calcula a porcentagem de consumo
    const limiteMeta = 5000.00;
    contrato.porcentagemConsumida = (contrato.gastos / limiteMeta) * 100;
    contrato.limiteMeta = limiteMeta;

    return contrato;
  }
}
