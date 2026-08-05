import express from 'express';
const router = express.Router();
import { arquivo } from '../controllers/arquivoController';

/**
 * @openapi
 * /api/arquivo:
 *   post:
 *     tags:
 *       - Arquivo
 *     summary: Faz a integração com outro microserviço atraves do Axio
 *     description: Endpoint que chama outro microserviço.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoArquivo:
 *                 type: string
 *                 description: Tipo de arqquivo a ser gerado Excel ou Pdf
 *     responses:
 *       200:
 *         description: Notificacao recebida com sucesso.
 */
router.post('/gerar', arquivo);
export default router;