import express from 'express';

const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { pedidoRepository } from '../repositories/pedidoRepository';
import { pedidoServices } from '../services/pedidoServices';
import { pedidoController } from '../controllers/pedidoController';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new pedidoRepository();
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorPedidoService = new pedidoServices(rabbitPublisher,repository); // Passa o entregador para o cérebro do serviço
const geradPedidoController = new pedidoController(geradorPedidoService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/pedidos/{id}:
 *   get:
 *     tags:
 *       - Pedido
 *     summary: Traz os dados do contrato pelo seu Id
 *     description: Envia o ID numérico do contrato na URL para buscar as informações detalhadas no SQL Server.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico do contrato registrado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objeto JSON contendo os dados do contrato.
 *       404:
 *         description: Contrato não localizado no banco de dados.
 *       500:
 *         description: Erro interno no servidor.
 */

// 2. CORREÇÃO DE ESCOPO: O .bind() garante que o Controller consiga acessar seus próprios métodos e serviços internos
router.get('/pedidos/:id', (req, res) => geradPedidoController.buscarPedidosId(req, res));

/**
 * @openapi
 * /api/pedido/rastreamento{id}:
 *   get:
 *     tags:
 *       - Pedido
 *     summary: Traz os dados do contrato pelo seu Id
 *     description: Envia o ID numérico do contrato na URL para buscar as informações detalhadas no SQL Server.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID numérico do contrato registrado
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objeto JSON contendo os dados do contrato.
 *       404:
 *         description: Contrato não localizado no banco de dados.
 *       500:
 *         description: Erro interno no servidor.
 */

// 2. CORREÇÃO DE ESCOPO: O .bind() garante que o Controller consiga acessar seus próprios métodos e serviços internos
router.get('/pedido/rastreamento/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradPedidoController.buscarStatusPedidosId(req, res));

/**
 * @openapi
 * /api/pedido/solicitar:
 *   post:
 *     tags:
 *       - Pedido
 *     summary: Açoes em contrato de cliente(Inserir, atualizar e excluir)
 *     description: Envia o ID numérico do contrato na URL para buscar as informações detalhadas no SQL Server.
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
 *         description: Objeto JSON contendo os dados do contrato.
 *       404:
 *         description: Contrato não localizado no banco de dados.
 *       500:
 *         description: Erro interno no servidor.
 */

// 2. CORREÇÃO DE ESCOPO: O .bind() garante que o Controller consiga acessar seus próprios métodos e serviços internos
router.post('/pedido/solicitar', authMiddlewareInstance.verificarJWT,(req, res) => geradPedidoController.pedidoSolicitacao(req, res));

export default router;
