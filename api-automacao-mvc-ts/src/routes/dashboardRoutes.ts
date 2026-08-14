import express from 'express';
const router = express.Router();

import { webhookGLPIService } from '../services/webhookGLPIService';
import { dashboardController } from '../controllers/dashboardController';

const glpiService = new webhookGLPIService();
const dashboard = new dashboardController(glpiService);

/**
 * @openapi
 * /api/dadosChamados:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Retorna os contadores consolidados de chamados para o Dashboard
 *     description: Lê a folha do Excel e calcula em tempo real o total de chamados por categoria e a média geral de tempo de espera.
 *     responses:
 *       200:
 *         description: Objeto JSON contendo os contadores estruturados para o JavaScript do ecrã.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 naoAtendidos:
 *                   type: integer
 *                 atendidos:
 *                   type: integer
 *                 pendentes:
 *                   type: integer
 *                 fechados:
 *                   type: integer
 *                 tempoMedio:
 *                   type: integer
 */

router.get('/dadosChamados', (req, res) => dashboard.obterDadosAPI(req, res));

export default router;

