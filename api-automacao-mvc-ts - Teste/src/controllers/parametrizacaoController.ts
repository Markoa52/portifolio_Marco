import type { Request, Response } from 'express';
import {ParametrizacaoService} from '../services/parametrizacaoService';

export class parametrizacaoController {
  constructor(private parametrizacaoService: ParametrizacaoService) {}

    async parametrizacao(req: Request, res: Response): Promise<Response> {
    try {
      const dadosDoContrato = req.body;

      if (!dadosDoContrato || Object.keys(dadosDoContrato).length === 0) {
        return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
      }

      // Dispara a função do serviço que monta o RabbitMQ
      const resultado = await this.parametrizacaoService.parametrizacaoAacoes(dadosDoContrato);
      return res.status(200).json(resultado);
    } catch (erro: any) {
      console.error('Erro no arquivoSend (POST):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }
}