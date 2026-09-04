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
router.post('/auth/usuarios/vincular-contrato', (req, res) => geradorAuthController.vincularContrato(req, res));

export default router;
