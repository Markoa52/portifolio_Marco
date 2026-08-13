import {GeradorArquivosServices} from '../services/gerarArquivoFilaServices'
import { Request, Response } from 'express'; 

export class GerarArquivoFilaController {
  constructor(private geradorService: GeradorArquivosServices) {}

  async arquivoSend(req: Request, res: Response) {
    try {
      // Passa o body direto para a camada de serviços processar
      const resultado = await this.geradorService.agendarGeracaoDeRelatorio(req.body);

      return res.status(200).json(resultado);
    } catch (erro: any) {
      return res.status(400).json({ erro: erro.message });
    }
  }
}
