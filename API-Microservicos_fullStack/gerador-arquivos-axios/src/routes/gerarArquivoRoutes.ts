import express from 'express';
// CORREÇÃO: O nome dentro das chaves deve ser exatamente 'geradorController'
import { geradorController } from '../controllers/geraArquivoController.js';

const router = express.Router();

// Define o endpoint que sua API principal vai chamar via Axios
router.post('/gerar', geradorController.processarDocumento);

export default router;


