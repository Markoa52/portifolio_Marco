import express from 'express';

const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { veiculoRepository } from '../repositories/veiculoRepository';
import { veiculoServices } from '../services/veiculoServices';
import { veiculoController } from '../controllers/veiculoController';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new veiculoRepository();
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorVeiculoService = new veiculoServices(rabbitPublisher,repository); // Passa o entregador para o cérebro do serviço
const geradorVeiculoController = new veiculoController(geradorVeiculoService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/veiculo/lookups:
 *   get:
 *     tags:
 *       - Veiculo
 *     summary: Traz os dados de todos das condiçoes comerciais
 *     description: Envia o ID numérico do contrato na URL para buscar as informações detalhadas no SQL Server.
 *     responses:
 *       200:
 *         description: Objeto JSON contendo os dados do contrato.
 *       404:
 *         description: Contrato não localizado no banco de dados.
 *       500:
 *         description: Erro interno no servidor.
 */

// 2. CORREÇÃO DE ESCOPO: O .bind() garante que o Controller consiga acessar seus próprios métodos e serviços internos
router.get('/veiculo/lookups', (req, res) => geradorVeiculoController.veiculosCombos(req, res));

/**
 * @openapi
 * /api/veiculo/{id}:
 *   get:
 *     tags:
 *       - Veiculo
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
router.get('/veiculo/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorVeiculoController.veiculosId(req, res));

/**
 * @openapi
 * /api/veiculo/saldoVPR/{id}:
 *   get:
 *     tags:
 *       - Veiculo
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
router.get('/veiculo/saldoVPR/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorVeiculoController.saldoId(req, res));

/**
 * @openapi
 * /api/veiculo/VPR/{id}:
 *   get:
 *     tags:
 *       - Veiculo
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
router.get('/veiculo/VPR/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorVeiculoController.veiculosSaldoVPR(req, res));

/**
 * @openapi
 * /api/veiculo/VPR/{id}:
 *   get:
 *     tags:
 *       - Veiculo
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
router.get('/veiculo/vincular-tag/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorVeiculoController.veiculosId(req, res));

/**
 * @openapi
 * /api/veiculo/acoes:
 *   post:
 *     tags:
 *       - Veiculo
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
router.post('/veiculo/acoes', authMiddlewareInstance.verificarJWT,(req, res) => geradorVeiculoController.veiculoAcoes(req, res));

export default router;
