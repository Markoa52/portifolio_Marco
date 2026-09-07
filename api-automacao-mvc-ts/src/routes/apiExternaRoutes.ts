import express from 'express';
const router = express.Router();

import { authMiddlewareInstance } from '../services/authMiddleware'; // Importa a instância da classe
router.use(authMiddlewareInstance.verificarJWT);

import {ApiExternaServices} from '../services/apiExternaServices'
import { ApiExternaController } from '../controllers/apiExternaController';

const dadosApi = new ApiExternaServices();
const api = new ApiExternaController(dadosApi)

/**
 * @openapi
 * /api/externa/{cep}:
 *   get:
 *     tags:
 *       - API Externa
 *     summary: Consulta dados de endereço por CEP
 *     description: Envia o CEP na URL para buscar as informações detalhadas de endereço.
 *     parameters:
 *       - in: path
 *         name: cep   # CORREÇÃO: Precisa ser exatamente "cep" para o Swagger injetar o valor correto!
 *         required: true
 *         description: CEP com 8 dígitos digitado pelo usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Endereço retornado com sucesso.
 *       400:
 *         description: CEP inválido ou erro na requisição.
 */
router.get('/externa/:cep', authMiddlewareInstance.verificarJWT,(req, res) => api.obterDadosAPIExterna(req, res));

export default router;
