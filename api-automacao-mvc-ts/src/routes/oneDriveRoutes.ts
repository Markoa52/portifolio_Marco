import express from 'express';
const router = express.Router();
import { salvarDados } from '../controllers/oneDriveController';
import { obterDados } from '../controllers/oneDriveController';

/**
 * @openapi
 * /api/dados:
 *   get:
 *     tags:
 *       - Automação OneDrive
 *     summary: Obtem os dados brutos de e-mail com bypass de cache do OneDrive
 *     description: Força o touch no arquivo Email.xlsx e extrai os dados limpos no formato JSON.
 *     responses:
 *       200:
 *         description: Array contendo a lista de registros extraídos da planilha.
 */
router.get('/dados', obterDados);

/**
 * @openapi
 * /api/salvar:
 *   post:
 *     tags:
 *       - Automação OneDrive
 *     summary: Salva novos registros formatados na planilha do OneDrive
 *     description: Limpa a tabela antiga e reinjeta a matriz estruturada para o Power Automate ler.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 Data:
 *                   type: string
 *                 Assunto:
 *                   type: string
 *                 Email:
 *                   type: string
 *                 Acoes:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sucesso na gravação do arquivo.
 *       500:
 *         description: Falha ao tentar manipular ou salvar o arquivo.
 */
router.post('/salvar', salvarDados);

export default router;
