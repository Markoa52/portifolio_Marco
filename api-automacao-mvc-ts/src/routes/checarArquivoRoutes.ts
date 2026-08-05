import axios from 'axios';
import { Router } from 'express';
import type { Request, Response } from 'express';

// 1. Cria o roteador do Express para este arquivo isolado
const router = Router();

/**
 * @swagger
 * /api/checar-arquivo/{id}/{formato}:
 *   get:
 *     summary: Verifica se o arquivo assíncrono (Excel/PDF) já foi gerado pelo worker
 *     description: Realiza uma checagem HTTP no Worker (Porta 3001) para validar se o arquivo existe.
 *     tags:
 *       - Arquivo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do protocolo gerado na solicitação
 *       - in: path
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *         description: O formato do arquivo que está sendo monitorado
 *     responses:
 *       200:
 *         description: Status da verificação retornado com sucesso
 */
router.get('/api/checar-arquivo/:id/:formato', async (req: Request, res: Response) => {
    const { id, formato } = req.params;
    
    let nomeArquivo: string;
    let pastaEspecifica: string;
    let urlDoWorker: string;

    // Alinhamento com a estrutura do Worker (Porta 3001 e rota estática /public)
           if (formato === 'excel') {
        // REMOVIDO o "arq_" daqui, pois a variável 'id' já traz esse texto embutido
        nomeArquivo = `planilha_${id}.xlsx`;
        pastaEspecifica = 'excel';
        urlDoWorker = `http://localhost:3001/public/downloads/excel/${nomeArquivo}`;
    } else {
        nomeArquivo = `documento_${id}.pdf`;
        pastaEspecifica = 'pdf';
        urlDoWorker = `http://localhost:3001/public/downloads/pdf/${nomeArquivo}`;
    }



    console.log(`[Polling] Checando existência de: ${urlDoWorker}`);

    try {
        // Faz a requisição HEAD para verificar se o arquivo existe fisicamente no Worker
        const resposta = await axios.head(urlDoWorker);
        
        if (resposta.status === 200) {
            console.log("-> Arquivo encontrado no Worker!");
            // CORREÇÃO CRÍTICA: Envia a resposta HTTP de sucesso de volta para o seu Frontend!
            return res.status(200).json({ 
                sucesso: true, 
                mensagem: "Arquivo gerado com sucesso!", 
                url: urlDoWorker 
            });
        }
    } catch (error: any) {
        console.log(`-> Arquivo ainda não existe na porta 3001. Código: ${error.response?.status || error.message}`);
        
        // CORREÇÃO CRÍTICA: Retorna status 204 (No Content) ou 404 para o Frontend entender que deve continuar tentando
        return res.status(204).json({ 
            sucesso: false, 
            mensagem: "Arquivo ainda está em processamento." 
        });
    }
});

// 3. Exporta o roteador para ser usado no arquivo principal do servidor
export default router;
