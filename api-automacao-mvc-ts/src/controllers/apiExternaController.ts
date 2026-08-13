import { Request, Response } from 'express'; 

// 1. O import da Model precisa usar exatamente o nome da classe exportada
import { ApiExternaServices } from '../services/apiExternaServices';

export class ApiExternaController{

    constructor(private apiCep: ApiExternaServices) {}

    async obterDadosAPIExterna(req: Request, res: Response): Promise<Response> {
    try {

      const { cep } = req.params; 

        if (!cep) {
        return res.status(400).json({ erro: "O CEP é obrigatório." });
      }

      // 3. CORREÇÃO: Finalizada a chamada chamando o método real do seu Service
      const resultado = await this.apiCep.obterDadosApi(cep);

      return res.status(200).json(resultado);
    } catch (erro: any) {
      return res.status(400).json({ erro: erro.message });
    }
  }
}

