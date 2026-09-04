import type { Request, Response } from 'express';
import { veiculoServices } from '../services/veiculoServices';
import * as xlsx from 'xlsx';
import * as fs from 'fs';

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
    const dadosRecebidos = req.body;

    if (!dadosRecebidos || Object.keys(dadosRecebidos).length === 0) {
      return res.status(400).json({ erro: 'O corpo da requisição POST não pode ser vazio.' });
    }

// =========================================================================
// CENÁRIO A: O frontend enviou um lote (Array) vindo da Planilha CSV
// =========================================================================
if (Array.isArray(dadosRecebidos)) {
  console.log(`[Controller Lote] Analisando lote de ${dadosRecebidos.length} veículos...`);
  
  const processadosComSucesso: any[] = [];
  const rejeitadosDuplicados: any[] = [];

  for (const payloadIndividual of dadosRecebidos) {
    // CORREÇÃO 1: Lê aceitando qualquer variação de escrita da propriedade placa
    const contexto = payloadIndividual.contextoVeiculo || {};
    const placaBruta = contexto.placa || contexto.Placa || contexto.PLACA || '';
    const placa = String(placaBruta).toUpperCase().trim();
    const modelo = contexto.modelo || 'Não informado';

    // TRAVA DE SEGURANÇA: Se a linha veio sem placa válida, pula para não bater falso-positivo no COUNT
    if (!placa || placa === 'UNDEFINED') {
      console.warn("[Lote] Linha ignorada por estar vazia ou sem propriedade 'placa' válida.");
      continue;
    }

    // 🔍 Consulta se a placa já existe no SQLite
   const existe = await this.veiculos.placaExiste(placa); 

    if (existe) {
      rejeitadosDuplicados.push({
        placa,
        modelo,
        motivo: "Veículo já cadastrado no sistema."
      });
      console.warn(`[Lote] Placa ${placa} pulada por duplicidade.`);
      continue; 
    }

    // Se está livre, publica no RabbitMQ garantindo a placa limpa
    payloadIndividual.contextoVeiculo.placa = placa;
    await this.veiculos.acoes(payloadIndividual);
    
    processadosComSucesso.push({
      placa,
      modelo,
      protocolo: payloadIndividual.metadata?.protocoloId || `PROT-${Date.now()}`
    });
  }

  return res.status(200).json({
    sucesso: true,
    resumo: {
      totalGeral: dadosRecebidos.length,
      totalSucesso: processadosComSucesso.length,
      totalErro: rejeitadosDuplicados.length,
      sucessos: processadosComSucesso,
      erros: rejeitadosDuplicados
    }
  });
}

    // =========================================================================
    // 💡 CENÁRIO B: Cadastro unitário tradicional (Formulário manual da tela)
    // =========================================================================
    const placaUnitária = dadosRecebidos.contextoVeiculo?.placa;

    console.log(`🔍 [Controller Unitário] Validando placa manual: ${placaUnitária}`);
    
    // 🚀 TRAVA IMEDIATA: Se a placa já existir, responde com erro 400 na hora!
    const placaExiste = await this.veiculos.placaExiste(placaUnitária);
    
    if (placaExiste) {
      return res.status(400).json({ 
        erro: `O veículo com a placa "${placaUnitária}" já está cadastrado no sistema.` 
      });
    }

    // Se passou na validação, envia para a fila do RabbitMQ
    const resultado = await this.veiculos.acoes(dadosRecebidos);
    return res.status(200).json(resultado);

  } catch (erro: any) {
    console.error('❌ Erro no método veiculoAcoes com validação:', erro.message);
    return res.status(500).json({ erro: erro.message });
  }
}

}



