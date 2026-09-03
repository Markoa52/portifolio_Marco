import express from 'express';
import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe

const router = express.Router();

router.use(authMiddlewareInstance.verificarJWT);

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { ContratoService } from '../services/contratoService';
import { contratoController } from '../controllers/contratoController';
import { ContratoRepository } from '../repositories/contratoRepository';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new ContratoRepository();
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorService = new ContratoService(rabbitPublisher, repository); // Passa o entregador para o cérebro do serviço
const geradorController = new contratoController(geradorService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/contratos:
 *   get:
 *     tags:
 *       - Contrato
 *     summary: Traz os dados de todos os contrato
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
router.get('/contratos', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.contrato(req, res));

/**
 * @openapi
 * /api/contrato/{id}:
 *   get:
 *     tags:
 *       - Contrato
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
router.get('/contrato/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.buscarPorId(req, res));

/**
 * @openapi
 * /api/contrato/fatura{id}:
 *   get:
 *     tags:
 *       - Fatura
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
router.get('/contrato/fatura/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.buscarFaturaId(req, res));

/**
 * @openapi
 * /api/fatura/aberto{id}:
 *   get:
 *     tags:
 *       - Fatura
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
router.get('/fatura/aberto/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.buscarFaturaAbertoId(req, res));

/**
 * @openapi
 * /api/contrato/faturas/{id}:
 *   get:
 *     tags:
 *       - Fatura
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
router.get('/contrato/faturas/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.buscarFaturasId(req, res));

/**
 * @openapi
 * /api/fatura/saldo{id}:
 *   get:
 *     tags:
 *       - Fatura
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
router.get('/fatura/saldo/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.buscarSaldoFaturaId(req, res));

/**
 * @openapi
 * /api/contrato/saldo{id}:
 *   get:
 *     tags:
 *       - Contrato
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
router.get('/contrato/limite/:id', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.contratoLimite(req, res));

/**
 * @openapi
 * /api/contrato/pesquisa:
 *   post:
 *     tags:
 *       - Contrato
 *     summary: Verifica se o contrato existe
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
router.post('/contrato/pesquisa', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.pesquisa(req, res));

/**
 * @openapi
 * /api/contrato/acoes:
 *   post:
 *     tags:
 *       - Contrato
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
router.post('/contrato/acoes', authMiddlewareInstance.verificarJWT,(req, res) => geradorController.contratoAcoes(req, res));

export default router;
