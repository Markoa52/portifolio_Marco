import express from 'express';
import cors from 'cors';
// IMPORTANTE: Mantenha a extensão .js exigida pelo nodenext ao importar suas rotas
import gerarArquivoRoutes from './routes/gerarArquivoRoutes.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

// RECRIANDO O __dirname PARA ESMODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// ==========================================================================
// 1. CONFIGURAÇÕES E MIDDLEWARES INICIAIS
// ==========================================================================
app.use(express.json()); // Permite ler o JSON enviado via Axios pela API principal
app.use(cors());         // Permite chamadas de outros servidores/origens sem bloqueios

// CONFIGURAÇÃO DA PASTA PÚBLICA: Permite baixar arquivos salvos na pasta 'public/downloads'
app.use('/public/downloads', express.static(path.join(__dirname, '../public/downloads')));

// ==========================================================================
// 2. ROTAS DA API DO MICROSSERVIÇO
// ==========================================================================
// Registra o endpoint '/gerar' para receber os dados do Excel
app.use(gerarArquivoRoutes);

// ==========================================================================
// 3. INICIALIZAÇÃO DO SERVIDOR
// ==========================================================================
app.listen(PORT, () => {
    console.log(`\n Microsserviço de Geração de Arquivos rodando com sucesso na porta ${PORT}`);
    console.log(` Endpoint ativo para receber chamadas em: http://localhost:${PORT}/gerar\n`);
});
