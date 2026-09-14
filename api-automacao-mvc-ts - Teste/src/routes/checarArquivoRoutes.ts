import axios from 'axios';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { authMiddlewareInstance } from '../services/authMiddleware';

const router = Router();

// Aplica o middleware uma única vez para todas as rotas deste arquivo
router.use(authMiddlewareInstance.verificarJWT);

/**
 * @swagger
 * /api/checar-arquivo/{id}/{formato}:
 *   get:
 *     ... (sua doc do swagger continua igual aqui)
 */
// 🟢 CORREÇÃO: Alinhado com o Swagger (com hífen) e sem o prefixo /api (assumindo que seu index/server.ts já injeta o /api)
router.get('/checar-arquivo/:id/:formato', async (req: Request, res: Response) => {
    const { id, formato } = req.params;
    
    let nomeArquivo: string;
    let urlDoWorker: string;

    if (formato === 'excel') {
        // Remove os ":" caso o id ainda traga a string de data com caracteres inválidos
        const idLimpo = String(id).replace(/:/g, '-');
        nomeArquivo = `planilha_${idLimpo}.xlsx`;
        urlDoWorker = `http://localhost:3001/public/downloads/excel/${nomeArquivo}`;
    } else {
        nomeArquivo = `documento_${id}.pdf`;
        urlDoWorker = `http://localhost:3001/public/downloads/pdf/${nomeArquivo}`;
    }

    console.log(`[Polling] Checando existência de: ${urlDoWorker}`);

    try {
        const resposta = await axios.head(urlDoWorker);
        
        if (resposta.status === 200) {
            console.log("-> Arquivo encontrado no Worker!");
            return res.status(200).json({ 
                sucesso: true, 
                mensagem: "Arquivo gerado com sucesso!", 
                url: urlDoWorker 
            });
        }
    } catch (error: any) {
        console.log(`-> Arquivo ainda não existe na porta 3001. Status: ${error.response?.status || error.message}`);
        
        return res.status(204).json({ 
            sucesso: false, 
            mensagem: "Arquivo ainda está em processamento." 
        });
    }
});

export default router;
