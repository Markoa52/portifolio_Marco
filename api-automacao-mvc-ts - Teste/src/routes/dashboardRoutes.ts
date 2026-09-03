import express from 'express';
const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

import { webhookGLPIService } from '../services/webhookGLPIService';
import { dashboardController } from '../controllers/dashboardController';

const dadosService = new webhookGLPIService();
const dadosController = new dashboardController(dadosService);

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
router.post('/dadosChamados', authMiddlewareInstance.verificarJWT,(req, res) => dadosController.obterDadosAPI(req, res));

export default router;

