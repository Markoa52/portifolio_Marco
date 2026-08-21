import { ContratoRepository } from '../repositories/contratoRepository'; // 👈 1. IMPORTA O SEU REPOSITÓRIO DO BANCO

export class condicoesComerciaisServices {
  // 👈 2. INJETA O REPOSITÓRIO DO SQL SERVER NO CONSTRUTOR JUNTO COM O RABBIT
  constructor(private contratoRepository: ContratoRepository ) {}

    // Adicione este método dentro da classe ContratoService no seu arquivo contratoService.ts:
async obterDados(): Promise<any> {
  // Faz o select puro no SQL Server usando o repositório que já injetamos lá no construtor
  const CondicoesComerciaisCombos = await this.contratoRepository.buscarCondicoesComerciaisCombos()
  return CondicoesComerciaisCombos;
}

}
