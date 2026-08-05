import express from 'express';
const router = express.Router();
import { arquivoSend } from '../controllers/gerarArquivoFilaController';

/**
 * @openapi
 * /api/gerarArquivoSend:
 *   post:
 *     tags:
 *       - Arquivo
 *     summary: Geração de arquivos enviando objeto para fila do RabbitMq
 *     description: Mensageria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 tipoArquivo:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sucesso ao gerar o arquivo.
 *       500:
 *         description: Falha ao gerar o arquivo.
 */
router.post('/gerarArquivoSend', arquivoSend);

export default router;
