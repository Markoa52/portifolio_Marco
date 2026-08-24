import express from 'express'; 
import type { Request, Response } from 'express';
import { iniciarConsumers } from './src/loaders/consumerLoader.js';
import path from 'path';
import fs from 'fs';
import { Database } from './src/config/sqlConfig.js';

const app = express();
const PORT = 3001;

// 1. Descobre de forma robusta onde a pasta 'public' está, independente de onde o terminal foi aberto
const pastaPublica = path.join(process.cwd(), 'public');

console.log(`[Diagnóstico] Procurando a pasta pública em: ${pastaPublica}`);

if (fs.existsSync(pastaPublica)) {
    console.log("✅ Sucesso: A pasta 'public' foi encontrada!");
} else {
    // CORREÇÃO DE CORINGA: Se o terminal foi aberto na pasta pai de todos os projetos (ex: no envio do GitHub), 
    // precisamos ajustar o caminho para entrar na subpasta do worker primeiro
    const pastaPublicaAlternativa = path.join(process.cwd(), 'gerar-arquivo-fila-worker', 'public');
    if (fs.existsSync(pastaPublicaAlternativa)) {
         console.log("✅ Sucesso: Pasta 'public' encontrada na subpasta do microserviço!");
         app.use('/public', express.static(pastaPublicaAlternativa));
    } else {
         console.log("❌ Erro: A pasta 'public' não existe em nenhum dos caminhos conhecidos.");
    }
}

// 2. Se a primeira validação deu certo, ativa a rota estática padrão
if (!app._router?.stack.some((layer: { route: { path: string; }; }) => layer.route?.path === '/public')) {
    app.use('/public', express.static(pastaPublica));
}

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

async function inicializarAplicacao() {
  try {
    console.log('🔄 Despertando banco de dados e preparando tabelas...');
    
    // Força a execução do getConnection() logo na partida do projeto
    await Database.getConnection(); 
    
    // Só inicia os consumers e o servidor DEPOIS que o banco estiver pronto
    await iniciarConsumers();
    
    app.listen(3001, () => {
      console.log('🚀 Servidor do Microsserviço iniciado na porta 3001 com tabelas prontas!');
    });

  } catch (error) {
    console.error('❌ Falha crítica ao iniciar aplicação:', error);
    process.exit(1);
  }
}

// Dispara a inicialização
inicializarAplicacao();

// OBRIGATÓRIO: Garante que o Express fique aberto ouvindo as requisições HTTP do Polling e Navegador
app.listen(PORT, () => {
    console.log(`Servidor do Microsserviço iniciado na porta ${PORT}`);
});
