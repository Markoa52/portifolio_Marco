import express from 'express';

const router = express.Router();

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
router.get('/contratos', (req, res) => geradorController.contrato(req, res));

/**
 * @openapi
 * /api/contrato{id}:
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
router.get('/contrato/:id', (req, res) => geradorController.buscarPorId(req, res));

/**
 * @openapi
 * /api/contrato:
 *   get:
 *     tags:
 *       - Contrato
 *     summary: Açoes em contrato de cliente(Inserir, atualizar e excluir)
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
router.post('/contrato', (req, res) => geradorController.contratoAcoes(req, res));

export default router;
