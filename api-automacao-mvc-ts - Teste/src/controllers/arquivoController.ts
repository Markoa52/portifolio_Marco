import { ArquivoModel } from '../models/arquivoModel';
import { geradorApiService } from '../services/geradorArquivosServices';
import type { Request, Response } from 'express';

export const arquivo = async (req: Request, res: Response): Promise<Response | void> => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    try {
        console.log(`📡 [OneDrive Bypass] Solicitando dados reais do disco às ${new Date().toLocaleTimeString()}`);

        //Nesse ponto que chama o metodo da Model para obeter os dados da planilha
        const dadosLimpos = ArquivoModel.obterDadosBrutosBypass();
        //res.json(dadosLimpos);

        const payload = req.body;

        const dadosExtraidos = dadosLimpos;
        let formatoDesejado = payload.tipoArquivo; // ex: 'pdf' ou 'excel'

        if (formatoDesejado && typeof formatoDesejado === 'string') {
       // REMOVE QUEBRAS DE LINHA, ESPAÇOS E ASPAS SIMPLES/DUPLAS
          formatoDesejado = formatoDesejado
          .replace(/['"\n\r]/g, '') // Remove aspas simples, duplas e quebras de linha
          .trim();                  // Remove espaços em branco nas pontas
        }

        console.log("FORMATO SANITIZADO:", formatoDesejado); // Deve imprimir exatamente: excel

        // 2. Delega a comunicação com o microsserviço para a camada de Service
        const linkDownload = await geradorApiService.solicitarGeracaoDeArquivo(formatoDesejado, dadosExtraidos);

        // 3. Devolve a resposta final para o cliente
        return res.json({
        sucesso: true,
        url: linkDownload
      });

    } catch (error: any) {
  console.error('Erro na controller de arquivo:', error.message);
  
  // O 'return' garante que o Express encerre a execução aqui e não tente enviar cabeçalhos novamente
  return res.status(500).json({ 
    erro: 'Não foi possível gerar o arquivo na aplicação externa.',
    detalhes: error.message 
  });
}

};
