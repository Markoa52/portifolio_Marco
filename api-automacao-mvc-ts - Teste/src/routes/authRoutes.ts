import express from 'express';

const router = express.Router();

// 1. Importação das classes do seu ecossistema desacoplado
import { RabbitMqPublisher } from '../queue/publisher';
import { authRepository } from '../repositories/authRepository';
import { authServices } from '../services/authServices';
import { authController } from '../controllers/authController';

// 2. A MONTAGEM DA ENGRENAGEM (Injeção de Dependências em Cascata)
const repository = new authRepository();
const rabbitPublisher = new RabbitMqPublisher();

// CORREÇÃO 1: Limpeza de vírgulas órfãs no construtor para evitar quebra de análise estática
const geradorAuthService = new authServices(repository, rabbitPublisher); 
const geradorAuthController = new authController(geradorAuthService);

/**
 * @openapi
 * /api/auth/usuarios:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Lista usuários e processa ações cadastrais
 *     description: Envia os dados cadastrais e os metadados de controle (protocolo e ação) no corpo da requisição para processar a persistência ou listagem.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Lucas Silva"
 *               usuario:
 *                 type: string
 *                 example: lucas.silva
 *               email:
 *                 type: string
 *                 example: lucas@empresa.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *               perfil:
 *                 type: string
 *                 enum: [atendimento, cliente]
 *                 example: atendimento
 *               protocolo:
 *                 type: string
 *                 example: "2026-09-01"
 *               acao:
 *                 type: string
 *                 example: inserir
 *     responses:
 *       200:
 *         description: Operação ou listagem processada com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes no corpo do JSON.
 *       409:
 *         description: Conflito de cadastro (Usuário ou e-mail já existente).
 *       500:
 *         description: Erro interno ao processar a requisição no servidor.
 */
router.get('/auth/usuarios', (req, res) => geradorAuthController.listarTodos(req, res));

/**
 * @openapi
 * /api/auth/usuario/buscar-por-username/{username}:
 *   get:
 *     tags:
 *       - Autenticação
 *     summary: Recupera o ID numérico do usuário pelo username
 *     description: Rota utilizada pelo mecanismo de polling do frontend para resgatar o ID gerado pelo Worker do RabbitMQ após a persistência no SQLite.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: O nome de usuário (login) do operador cadastrado.
 *         schema:
 *           type: string
 *         example: "aurelio.teste"
 *     responses:
 *       200:
 *         description: Usuário localizado no SQLite com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: O ID numérico (AUTOINCREMENT) gerado pelo banco de dados.
 *                   example: 2
 *       404:
 *         description: Usuário ainda não foi processado pelo Worker ou é inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: "Usuário ainda não processado ou inexistente."
 *       500:
 *         description: Falha interna no servidor ao consultar o banco de dados.
 */
router.get('/auth/usuario/buscar-por-username/:username', (req, res) => geradorAuthController.buscarPorUsername(req, res));

/**
 * @openapi
 * /auth/usuario/noficacao:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Recupera o ID numérico do usuário pelo username
 *     description: Rota utilizada pelo mecanismo de polling do frontend para resgatar o ID gerado pelo Worker do RabbitMQ após a persistência no SQLite.
 *     parameters:
 *       - in: path
 *         email: email
 *         required: true
 *         description: O nome de usuário (login) do operador cadastrado.
 *         schema:
 *           type: string
 *         example: "aurelio.teste@teste.com"
 *     responses:
 *       200:
 *         description: Usuário localizado no SQLite com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: O ID numérico (AUTOINCREMENT) gerado pelo banco de dados.
 *                   example: 2
 *       404:
 *         description: Usuário ainda não foi processado pelo Worker ou é inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: "Usuário ainda não processado ou inexistente."
 *       500:
 *         description: Falha interna no servidor ao consultar o banco de dados.
 */
router.post('/auth/usuario/noficacao', (req, res) => geradorAuthController.notificaUsario(req, res));

/**
 * @openapi
 * /api/auth/usuario/inativarAtivar:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza o cadastro do primeiro acesso do operador
 *     description: Envia os dados cadastrais e credenciais para criar um novo usuário operador no banco de dados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - status
 *             properties:
 *               nome:
 *                 type: number
 *                 example: "João da Silva"
 *               usuario:
 *                 type: string
 *                 example: joao.silva
 *     responses:
 *       200:
 *         description: Primeiro acesso registrado com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
 *       409:
 *         description: Usuário ou e-mail já existente no sistema.
 *       500:
 *         description: Erro interno no servidor.
 */
router.post('/auth/usuario/inativarAtivar', (req, res) => geradorAuthController.inativarAtivarUsuario(req, res));

/**
 * @openapi
 * /api/auth/usuarios/contrato/{id}:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Lista usuários e processa ações cadastrais
 *     description: Envia os dados cadastrais e os metadados de controle (protocolo e ação) no corpo da requisição para processar a persistência ou listagem.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Lucas Silva"
 *               usuario:
 *                 type: string
 *                 example: lucas.silva
 *               email:
 *                 type: string
 *                 example: lucas@empresa.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *               perfil:
 *                 type: string
 *                 enum: [atendimento, cliente]
 *                 example: atendimento
 *               protocolo:
 *                 type: string
 *                 example: "2026-09-01"
 *               acao:
 *                 type: string
 *                 example: inserir
 *     responses:
 *       200:
 *         description: Operação ou listagem processada com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes no corpo do JSON.
 *       409:
 *         description: Conflito de cadastro (Usuário ou e-mail já existente).
 *       500:
 *         description: Erro interno ao processar a requisição no servidor.
 */
router.get('/auth/usuarios/contrato/:id', (req, res) => geradorAuthController.listarUsuariosContrato(req, res));

/**
 * @openapi
 * /api/auth/usuarios/{id}/contratos:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Lista usuários e processa ações cadastrais
 *     description: Envia os dados cadastrais e os metadados de controle (protocolo e ação) no corpo da requisição para processar a persistência ou listagem.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Lucas Silva"
 *               usuario:
 *                 type: string
 *                 example: lucas.silva
 *               email:
 *                 type: string
 *                 example: lucas@empresa.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *               perfil:
 *                 type: string
 *                 enum: [atendimento, cliente]
 *                 example: atendimento
 *               protocolo:
 *                 type: string
 *                 example: "2026-09-01"
 *               acao:
 *                 type: string
 *                 example: inserir
 *     responses:
 *       200:
 *         description: Operação ou listagem processada com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes no corpo do JSON.
 *       409:
 *         description: Conflito de cadastro (Usuário ou e-mail já existente).
 *       500:
 *         description: Erro interno ao processar a requisição no servidor.
 */
router.get('/auth/usuarios/:id/contratos', (req, res) => geradorAuthController.listarTodosContratosUsuario(req, res));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza a autenticação do operador e gera um Token JWT
 *     description: Envia o usuário e a senha no corpo da requisição para validar as credenciais no banco de dados e obter o token de acesso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - senha
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Autenticação efetuada com sucesso. Retorna o Token JWT.
 *       401:
 *         description: Usuário ou senha incorretos.
 *       500:
 *         description: Erro interno no servidor.
 */

// CORREÇÃO 2: Alterado cirurgicamente de router.get para router.post 
// Isso garante o casamento perfeito com o axios.post() disparado pela sua TelaLogin.tsx!
router.post('/auth/login', (req, res) => geradorAuthController.authValida(req, res));

/**
 * @openapi
 * /api/auth/validarUsuario:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza a autenticação do operador e gera um Token JWT
 *     description: Envia o usuário e a senha no corpo da requisição para validar as credenciais no banco de dados e obter o token de acesso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - senha
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Autenticação efetuada com sucesso. Retorna o Token JWT.
 *       401:
 *         description: Usuário ou senha incorretos.
 *       500:
 *         description: Erro interno no servidor.
 */

// CORREÇÃO 2: Alterado cirurgicamente de router.get para router.post 
// Isso garante o casamento perfeito com o axios.post() disparado pela sua TelaLogin.tsx!
router.post('/auth/validarUsuario', (req, res) => geradorAuthController.authValidaUsuario(req, res));

/**
 * @openapi
 * /api/auth/confimarMFA:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza a autenticação do operador e gera um Token JWT
 *     description: Envia o usuário e a senha no corpo da requisição para validar as credenciais no banco de dados e obter o token de acesso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Autenticação efetuada com sucesso. Retorna o Token JWT.
 *       401:
 *         description: Usuário ou senha incorretos.
 *       500:
 *         description: Erro interno no servidor.
 */
// CORREÇÃO 2: Alterado cirurgicamente de router.get para router.post 
// Isso garante o casamento perfeito com o axios.post() disparado pela sua TelaLogin.tsx!
router.post('/auth/confimarMFA', (req, res) => geradorAuthController.confirmaMFAUsuario(req, res));

/**
 * @openapi
 * /api/auth/primeiro-acesso:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza o cadastro do primeiro acesso do operador
 *     description: Envia os dados cadastrais e credenciais para criar um novo usuário operador no banco de dados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *               usuario:
 *                 type: string
 *                 example: joao.silva
 *               email:
 *                 type: string
 *                 example: joao@empresa.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Primeiro acesso registrado com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
 *       409:
 *         description: Usuário ou e-mail já existente no sistema.
 *       500:
 *         description: Erro interno no servidor.
 */
router.post('/auth/primeiro-acesso', (req, res) => geradorAuthController.registrarPrimeiroAcesso(req, res));

/**
 * @openapi
 * /api/auth/usuarios/vincular-contrato:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza o cadastro do primeiro acesso do operador
 *     description: Envia os dados cadastrais e credenciais para criar um novo usuário operador no banco de dados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - usuario
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "João da Silva"
 *               usuario:
 *                 type: string
 *                 example: joao.silva
 *               email:
 *                 type: string
 *                 example: joao@empresa.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Primeiro acesso registrado com sucesso.
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
 *       409:
 *         description: Usuário ou e-mail já existente no sistema.
 *       500:
 *         description: Erro interno no servidor.
 */
router.post('/auth/usuarios/vincular-contrato', (req, res) => geradorAuthController.vincularContrato(req, res));

/**
 * @openapi
 * /api/auth/usuario/{usuarioId}/contrato/{contratoId}:
 *   delete:
 *     tags:
 *       - Autenticação
 *     summary: Revoga o vínculo entre um usuário e um contrato
 *     description: Remove a permissão de acesso de um operador a um contrato específico no ecossistema TollManagement.
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário operador
 *         example: 1
 *       - in: path
 *         name: contratoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato que será revogado
 *         example: 45
 *     responses:
 *       200:
 *         description: Vínculo removido/revogado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 mensagem:
 *                   type: string
 *                   example: "Vínculo removido com sucesso."
 *       400:
 *         description: Parâmetros obrigatórios ausentes ou inválidos na URL.
 *       404:
 *         description: Usuário ou vínculo de contrato não encontrado.
 *       500:
 *         description: Erro interno ao processar a exclusão do vínculo.
 */
router.delete('/auth/usuario/:usuarioId/contrato/:contratoId', (req, res) => geradorAuthController.deletarVinculoContratoUsuario(req, res));

/**
 * @openapi
 * /api/auth/ExcluirUsuario:
 *   delete:
 *     tags:
 *       - Autenticação
 *     summary: Revoga o vínculo entre um usuário e um contrato
 *     description: Remove a permissão de acesso de um operador a um contrato específico no ecossistema TollManagement.
 *     parameters:
 *       - in: path
 *         name: idUsuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário operador
 *         example: 1
 *       - in: path
 *         name: idContrato
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato que será revogado
 *         example: 45
 *     responses:
 *       200:
 *         description: Vínculo removido/revogado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 mensagem:
 *                   type: string
 *                   example: "Vínculo removido com sucesso."
 *       400:
 *         description: Parâmetros obrigatórios ausentes ou inválidos na URL.
 *       404:
 *         description: Usuário ou vínculo de contrato não encontrado.
 *       500:
 *         description: Erro interno ao processar a exclusão do vínculo.
 */
router.delete('/auth/ExcluirUsuario/:usuarioid/contrato/:contratoid', (req, res) => geradorAuthController.deletarUsuario(req, res));

/**
 * @openapi
 * /api/auth/atualizaUsuario/{id}:
 *   put:
 *     tags:
 *       - Autenticação
 *     summary: Revoga o vínculo entre um usuário e um contrato
 *     description: Remove a permissão de acesso de um operador a um contrato específico no ecossistema TollManagement.
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário operador
 *         example: 1
 *       - in: path
 *         name: contratoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do contrato que será revogado
 *         example: 45
 *     responses:
 *       200:
 *         description: Vínculo removido/revogado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 mensagem:
 *                   type: string
 *                   example: "Vínculo removido com sucesso."
 *       400:
 *         description: Parâmetros obrigatórios ausentes ou inválidos na URL.
 *       404:
 *         description: Usuário ou vínculo de contrato não encontrado.
 *       500:
 *         description: Erro interno ao processar a exclusão do vínculo.
 */
router.put('/auth/atualizaUsuario/:id', (req, res) => geradorAuthController.atualizarUsuario(req, res));

export default router;
