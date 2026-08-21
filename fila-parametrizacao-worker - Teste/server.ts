import express from 'express'; 
import type { Request, Response } from 'express';
import { iniciarConsumers } from './src/loaders/consumerLoader.js';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json()); 
const PORT = 3001;

// 1. Descobre de forma robusta onde a pasta 'public' está, independente de onde o terminal foi aberto
// 1. Define os caminhos possíveis para a pasta public
const pastaPublicaLocal = path.join(process.cwd(), 'public');
const pastaPublicaMicroservico = path.join(process.cwd(), 'gerar-arquivo-fila-worker', 'public');

// 2. Libera o acesso estático para onde quer que ela esteja (o Express gerencia isso nativamente)
app.use('/public', express.static(pastaPublicaLocal));
app.use('/public', express.static(pastaPublicaMicroservico));

console.log(`[Diagnóstico] Rotas estáticas mapeadas para verificações locais e de microserviço.`);


app.get('/health', (req: Request, res: Response): void => {
    res.json({ status: 'UP' });
});

async function start(): Promise<void> {
    try {
        await iniciarConsumers();
        console.log('Todos os consumers do RabbitMQ iniciados com sucesso.');
    } catch (error: any) {
        console.error('Falha crítica ao inicializar os consumers:', error.message);
    }
}

start();

// OBRIGATÓRIO: Garante que o Express fique aberto ouvindo as requisições HTTP do Polling e Navegador
app.listen(PORT, () => {
    console.log(`Servidor do Microsserviço iniciado na porta ${PORT}`);
});
