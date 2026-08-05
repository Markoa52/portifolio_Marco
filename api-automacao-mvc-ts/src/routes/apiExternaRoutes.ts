import express from 'express';
const router = express.Router();
import { obterDadosAPIExterna } from '../controllers/apiExternaController';

/**
 * @openapi
 * /api/externa/{cep}:
 *   get:
 *     tags:
 *       - API Externa
 *     summary: Retorna um usuário pelo ID
 *     description: Recebe o ID de um usuário na URL e retorna seus dados da Model.
 *     parameters:
 *       - in: path
 *         name: marcaVeiculo
 *         required: true
 *         description: ID único do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */

router.get('/externa/:cep', obterDadosAPIExterna);

export default router;
