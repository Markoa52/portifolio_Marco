import { Router } from 'express';
import { TransacaoController } from '../controllers/transacaoController';
import { authMiddlewareInstance } from '../services/authMiddleware';

const router = Router();
const transacaoController = new TransacaoController();

/**
 * @swagger
 * /api/transacao/receber-dados:
 *   post:
 *     summary: Recebe dados de transações e pedágios de sistemas externos
 *     tags:
 *       - Integração
 *     security:
 *       - BearerAuth: []
 */
router.post('/transacao/receber-dados', authMiddlewareInstance.verificarJWT, // Reutiliza seu middleware de segurança
  (req, res) => transacaoController.receberDadosViagem(req, res)
);

export default router;
