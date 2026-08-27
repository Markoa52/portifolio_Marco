import type { Request, Response } from 'express';
import { condicoesComerciaisServices } from '../services/condicoesComerciaisServices';
import { veiculoServices } from '../services/veiculoServices';

export class veiculoController {
  constructor(private veiculos: veiculoServices) {}

   async veiculosCombos(req: Request, res: Response): Promise<Response> {
    try {

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID:`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.veiculos.obterCombos();

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

    async veiculosId(req: Request, res: Response): Promise<Response> {
    try {

      const { id } = req.params;
      const contratoId = parseInt(String(id ?? ''));

      if (isNaN(contratoId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contratoId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.veiculos.obterVeiculosContrato(contratoId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  async saldoId(req: Request, res: Response): Promise<Response> {
    try {

      const { id } = req.params;
      const contratoId = parseInt(String(id ?? ''));

      if (isNaN(contratoId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contratoId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const saldoLocalizado = await this.veiculos.obterSaldoVPRContrato(contratoId);

    if (saldoLocalizado === null || saldoLocalizado === undefined) {
      return res.status(404).json({ erro: `Contrato ID ${contratoId} ou saldoVPR não localizado no banco.` });
    }

    return res.status(200).json(saldoLocalizado);

    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

    async veiculosSaldoVPR(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const saldoVPR= await this.veiculos.obterVeiculosSaldoVPR(contractId);

    if (saldoVPR === null || saldoVPR === undefined) {
      return res.status(404).json({ erro: `Contrato ID ${saldoVPR} ou saldoVPR não localizado no banco.` });
    }

      return res.status(200).json(saldoVPR);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

    async veiculoAcoes(req: Request, res: Response): Promise<Response> {
    try {
      const dadosDoContrato = req.body;

      if (!dadosDoContrato || Object.keys(dadosDoContrato).length === 0) {
        return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
      }

      // Dispara a função do serviço que monta o RabbitMQ
      const resultado = await this.veiculos.acoes(dadosDoContrato);
      
      return res.status(200).json(resultado);
    } catch (erro: any) {
      console.error('Erro no arquivoSend (POST):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }
}



