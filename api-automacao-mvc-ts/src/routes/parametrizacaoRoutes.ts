import express from 'express';

const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { ParametrizacaoService } from '../services/parametrizacaoService';
import { parametrizacaoController } from '../controllers/parametrizacaoController';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorService = new ParametrizacaoService(rabbitPublisher); // Passa o entregador para o cérebro do serviço
const geradorController = new parametrizacaoController(geradorService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/parametrizacao:
 *   post:
 *     tags:
 *       - Parametrizacao
 *     summary: Cria parametrização
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
 *                 tipoParam:
 *                   type: string
 *       200:
 *         description: Objeto JSON contendo os dados do contrato.
 *       404:
 *         description: Contrato não localizado no banco de dados.
 *       500:
 *         description: Erro interno no servidor.
 */
// 2. CORREÇÃO DE ESCOPO: O .bind() garante que o Controller consiga acessar seus próprios métodos e serviços internos
router.post('/parametrizacao', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.parametrizacao(req, res));

export default router;
