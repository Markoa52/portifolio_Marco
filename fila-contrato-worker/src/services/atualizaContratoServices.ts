// 1. Ajustado o nome do arquivo importado e a convenção de Letra Maiúscula
import { ContratoRepository } from '../repositories/contratoRepository.js';

export class atualizaContratoServices {
  
  // 2. CORREÇÃO: Usando "private" o TypeScript cria e salva o repositório na memória em 1 única linha!
  constructor(private contratoRepository: ContratoRepository) {}

  // 3. CORREÇÃO: Corrigido o nome do método de "consutar" para "consultar"
  async consultar(contractId: any): Promise<any> {
    // Agora o 'this.contratoRepository' existe e está totalmente tipado
    const contrato = await this.contratoRepository.findById(contractId);
    
    if (!contrato) {
      throw new Error("Contrato não encontrado no sistema.");
    }

    // Mantida a sua excelente lógica de cálculo:
    const limiteMeta = 5000.00;
    
    // Tratamento de segurança caso o campo 'gastos' venha nulo ou indefinido do SQL Server
    const gastosAtuais = contrato.gastos || 0;
    
    contrato.porcentagemConsumida = (gastosAtuais / limiteMeta) * 100;
    contrato.limiteMeta = limiteMeta;

    return contrato;
  }
}
