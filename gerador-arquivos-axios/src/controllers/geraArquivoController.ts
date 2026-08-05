// src/controllers/gerarArquivoController.ts (No Microsserviço - 3001)
import type { Request, Response } from 'express';
import { geraArquivoPdf } from '../services/geraArquivoPdfServices.js';
import { geraArquivoExcel } from '../services/geraArquivoExcelServices.js';

export const geradorController = {
  async processarDocumento(req: Request, res: Response): Promise<Response | void> {
    try {
      const { tipo, dados } = req.body; 

      let urlDoArquivo = '';

      if (tipo === 'pdf') {
        urlDoArquivo = await geraArquivoPdf(dados);
      } else if (tipo === 'excel') {
        urlDoArquivo = await geraArquivoExcel(dados);
      } else {
        // CORREÇÃO: Adicione 'return' aqui para parar a execução imediatamente
        return res.status(400).json({ erro: 'Formato de arquivo não suportado.' });
      }

      // CORREÇÃO: Adicione 'return' aqui para enviar o link e encerrar com sucesso
      return res.json({
        urlDownload: urlDoArquivo
      });

    } catch (error: any) {
      console.error('Erro ao gerar arquivo no microsserviço:', error.message);
      
      // CORREÇÃO: Adicione 'return' aqui para evitar que tente responder de novo caso caia no catch
      return res.status(500).json({ erro: 'Erro interno ao gerar o arquivo.' });
    }
  }
};
