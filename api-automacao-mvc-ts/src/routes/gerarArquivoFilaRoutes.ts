import express from 'express';

// 1. Importe as 3 classes do seu sistema (Fila, Service e Controller)
import { RabbitMqPublisher } from '../queue/publisher'; // Ajuste o caminho real se necessário
import { GeradorArquivosServices } from '../services/gerarArquivoFilaServices';
import { GerarArquivoFilaController } from '../controllers/gerarArquivoFilaController';

const router = express.Router();

// 2. A MONTAGEM CORRETA DA ENGRENAGEM (Injeção de Dependências em Cascata)
const rabbitPublisher = new RabbitMqPublisher(); // Primeiro cria o entregador da fila
const geradorService = new GeradorArquivosServices(rabbitPublisher); // Passa o entregador para o cérebro do serviço
const geradorController = new GerarArquivoFilaController(geradorService); // Passa o serviço para o controlador de rotas

/**
 * @openapi
 * /api/gerarArquivoSend:
 *   post:
 *     tags:
 *       - Arquivo
 *     summary: Geração de arquivos enviando objeto para fila do RabbitMq
 *     description: Mensageria
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
 *         description: Sucesso ao gerar o arquivo.
 *       500:
 *         description: Falha ao gerar o arquivo.
 */

// 3. Chame o método encapsulando em uma função seta para não perder o contexto do 'this' no TypeScript
router.post('/gerarArquivoSend', (req, res) => geradorController.arquivoSend(req, res));

export default router;
