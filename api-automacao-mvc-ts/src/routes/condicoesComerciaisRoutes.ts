import express from 'express';

const router = express.Router();

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { ContratoRepository } from '../repositories/contratoRepository';
import { condicoesComerciaisServices } from '../services/condicoesComerciaisServices';
import { condicoesComerciaisController } from '../controllers/condicoesComerciaisController';

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new ContratoRepository();
const geradorService = new condicoesComerciaisServices(repository); // Passa o entregador para o cérebro do serviço
const geradorController = new condicoesComerciaisController(geradorService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/configuracao/lookups:
 *   get:
 *     tags:
 *       - Condicoes comerciais
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
router.get('/configuracao/lookups', (req, res) => geradorController.condicoesComer(req, res));

export default router;
