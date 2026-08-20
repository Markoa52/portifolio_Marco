import type { Request, Response } from 'express';
import { condicoesComerciaisServices } from '../services/condicoesComerciaisServices';

export class condicoesComerciaisController {
  constructor(private condicoesComerciais: condicoesComerciaisServices) {}

   async condicoesComer(req: Request, res: Response): Promise<Response> {
    try {

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID:`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.condicoesComerciais.obterDados();

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }
}



