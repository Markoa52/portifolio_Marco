import type { Request, Response } from 'express';
import { ContratoService } from '../services/contratoService';

export class contratoController {
  constructor(private contratoService: ContratoService) {}

  /**
   * 1. MÉTODO PARA O POST (Fila / Mensageria / RabbitMQ)
   * Este método espera receber o corpo completo (req.body) contendo protocoloId e acao.
   */

  async contratoAcoes(req: Request, res: Response): Promise<Response> {
    try {
      const dadosDoContrato = req.body;

      if (!dadosDoContrato || Object.keys(dadosDoContrato).length === 0) {
        return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
      }

      // Dispara a função do serviço que monta o RabbitMQ
      const resultado = await this.contratoService.acoes(dadosDoContrato);
      
      return res.status(200).json(resultado);
    } catch (erro: any) {
      console.error('Erro no arquivoSend (POST):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  
  async pesquisa(req: Request, res: Response): Promise<Response> {
    try {
      const dadosDoContrato = req.body;

      if (!dadosDoContrato || Object.keys(dadosDoContrato).length === 0) {
        return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
      }

      // Dispara a função do serviço que monta o RabbitMQ
      const resultado = await this.contratoService.contratoPesquisa(dadosDoContrato);
      
      return res.status(200).json(resultado);
    } catch (erro: any) {
      console.error('Erro no arquivoSend (POST):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  /**
   * 2. MÉTODO PARA O GET (Consulta Rápida de Tela / SQL Server Puro)
   * ESTE MÉTODO VAI RESOLVER O SEU ERRO! Ele não tenta ler o body, ele lê apenas o ID da URL (req.params)
   */
  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterDadosDiretosDoBanco(contractId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número ${contractId} não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  async buscarFaturaId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterFatura(contractId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número ${contractId} não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  async buscarFaturaAbertoId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterFaturaAberto(contractId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número ${contractId} não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

    async buscarFaturasId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterFaturas(contractId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número ${contractId} não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

  async ContratosDoUsuario(req: Request, res: Response): Promise<Response> {
  try {
    // 💡 CORREÇÃO: Lê o 'id' da rota (que é o ID do utilizador neste contexto)
    const { id } = req.params; 

    console.log("📡 [Controller] Buscando contratos para o Usuário ID:", id);

    if (!id || id === 'undefined') {
      return res.status(400).json({ erro: 'O parâmetro id do usuário é obrigatório.' });
    }

    // Passa o ID convertido em número para a busca no banco SQLite
    const contratos = await this.contratoService.obterContratosVinculados(Number(id));
    
    return res.status(200).json(contratos);
  } catch (error: any) {
    console.error('❌ Erro no método ContratosDoUsuario:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao listar contratos.' });
  }
}

    async buscarSaldoFaturaId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterSaldoFatura(contractId);

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número ${contractId} não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

   async contrato(req: Request, res: Response): Promise<Response> {
    try {

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID:`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const contratoLocalizado = await this.contratoService.obterContratos();

      if (!contratoLocalizado) {
        return res.status(404).json({ erro: `Contrato número não localizado no banco.` });
      }

      return res.status(200).json(contratoLocalizado);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }

      async contratoLimite(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const contractId = parseInt(String(id ?? ''));

      if (isNaN(contractId)) {
        return res.status(400).json({ erro: 'O parâmetro ID fornecido na URL deve ser um número válido.' });
      }

      console.log(`[Controller] Efetuando busca rápida no SQL Server para a tela. ID: ${contractId}`);

      // Acessa o repositório diretamente de dentro do serviço para trazer os dados sem disparar filas
      // (Se o seu service já tem o repository injetado, criamos um método leve lá ou chamamos o repo direto)
      const Limitecontrato = await this.contratoService.obterLimiteContrato(contractId);

    if (Limitecontrato === null || Limitecontrato === undefined) {
      return res.status(404).json({ erro: `Contrato ID ${Limitecontrato} ou saldoVPR não localizado no banco.` });
    }

      return res.status(200).json(Limitecontrato);
    } catch (erro: any) {
      console.error('Erro no buscarPorId (GET):', erro.message);
      return res.status(500).json({ erro: erro.message });
    }
  }
  
}



