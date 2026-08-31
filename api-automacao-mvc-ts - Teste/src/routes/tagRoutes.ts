import express from 'express';

const router = express.Router();

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { tagRepository } from '../repositories/tagRepository';
import { tagServices } from '../services/tagServices';
import { tagController } from '../controllers/tagController';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new tagRepository();
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorTagService = new tagServices(rabbitPublisher,repository); // Passa o entregador para o cérebro do serviço
const geradorTagController = new tagController(geradorTagService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/tag/ativas/{id}:
 *   get:
 *     tags:
 *       - Tag
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
router.get('/tag/ativas/:id', (req, res) => geradorTagController.tagEstoqueId(req, res));

/**
 * @openapi
 * /api/tag/estoque/{id}:
 *   get:
 *     tags:
 *       - Tag
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
router.get('/tag/estoque/:id', (req, res) => geradorTagController.tagEstoqueId(req, res));

/**
 * @openapi
 * /api/tag/bloqueadas/{id}:
 *   get:
 *     tags:
 *       - Tag
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
//router.get('/tag/vinculartag/:id', (req, res) => geradorTagController.veiculosId(req, res));

/**
 * @openapi
 * /api/tag/bonificadas/{id}:
 *   get:
 *     tags:
 *       - Tag
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
//router.get('/tag/bonificadas/:id', (req, res) => geradorTagController.veiculosId(req, res));

/**
 * @openapi
 * /api/tag/acoes:
 *   post:
 *     tags:
 *       - Tag
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
router.post('/tag/acoes', (req, res) => geradorTagController.tagAcoes(req, res));

export default router;
