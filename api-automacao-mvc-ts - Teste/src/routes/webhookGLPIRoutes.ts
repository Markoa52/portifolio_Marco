import express from 'express';
const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

import { webhookGLPIService } from '../services/webhookGLPIService';
import { webhookGLPIController } from '../controllers/webhookGLPIController'; 

const chamado = new webhookGLPIService();
const webhook = new webhookGLPIController(chamado);

/**
 * @openapi
 * /api/webhook:
 *   post:
 *     tags:
 *       - Webhook GLPI
 *     summary: Recebe notificações de eventos em tempo real do GLPI
 *     description: Endpoint que processa aberturas e atualizações de chamados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do chamado no GLPI
 *               status:
 *                 type: integer
 *                 description: Codigo numerico do status do chamado
 *               name:
 *                 type: string
 *                 description: Titulo ou assunto do chamado
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora de criacao do chamado
 *     responses:
 *       200:
 *         description: Notificacao recebida com sucesso.
 */
router.post('/webhook', authMiddlewareInstance.verificarJWT,(req, res) => webhook.processarWebhook(req, res));


export default router;
