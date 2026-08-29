import type { Request, Response } from 'express';
import { pedidoServices } from '../services/pedidoServices';

export class pedidoController {
  constructor(private pedidos: pedidoServices) {}

  async buscarPedidosId(req: Request, res: Response): Promise<Response> {
    try {

      const { id } = req.params;
      const contratoId = parseInt(String(id ?? ''));

      if (isNaN(contratoId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contratoId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.pedidos.obterPedidosContrato(contratoId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  async buscarStatusPedidosId(req: Request, res: Response): Promise<Response> {
    try {

      const { id } = req.params;
      const contratoId = parseInt(String(id ?? ''));

      if (isNaN(contratoId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contratoId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.pedidos.obterStatusPedidosContrato(contratoId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

    async pedidoSolicitacao(req: Request, res: Response): Promise<Response> {
    try {
      const dadosDoContrato = req.body;

      if (!dadosDoContrato || Object.keys(dadosDoContrato).length === 0) {
        return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
      }

      // Dispara a função do serviço que monta o RabbitMQ
      const resultado = await this.pedidos.solicitar(dadosDoContrato);
      
      return res.status(200).json(resultado);
    } catch (erro: any) {
      console.error('Erro no arquivoSend (POST):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }
}



