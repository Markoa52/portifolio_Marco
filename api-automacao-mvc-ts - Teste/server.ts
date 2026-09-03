import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

//import { connectRabbit } from './src/config/rabbitConfig';

// 1. Primeiramente, importe as rotas novas
import checarArquivoRoutes from './src/routes/checarArquivoRoutes.js';

// ==========================================================================
// 3. IMPORTAÇÃO DAS ROTAS (Movido para o topo)
// ==========================================================================
import webhookGLPIRoutes from './src/routes/webhookGLPIRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import oneDriveRoutes from './src/routes/oneDriveRoutes';
import apiExternaRoutes from './src/routes/apiExternaRoutes';
import gerarArquivoRoutes from './src/routes/gerarArquivoAxiosRoutes';
import gerarArquivoFilaRoutes from './src/routes/gerarArquivoFilaRoutes';
import contratoRoutes from './src/routes/contratoRoutes';
import parametrizacaoRoutes from './src/routes/parametrizacaoRoutes.js';
import condicoesComerciaisRoutes from './src/routes/condicoesComerciaisRoutes.js'
import veiculoRoutes from './src/routes/veiculoRoutes.js'
import pedidoRoutes from './src/routes/pedidoRoutes.js'
import tag from './src/routes/tagRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
// ==========================================================================
// INICIALIZAÇÃO CRÍTICA (DEVE SER A PRIMEIRA COISA)
// ==========================================================================
const app = express();
// Diz ao Express para liberar o acesso direto aos arquivos da pasta public via navegador
app.use('/downloads', express.static(path.join(process.cwd(), 'public', 'downloads')));
const PORT = 3000;

// ==========================================================================
// 1. CONFIGURAÇÕES E MIDDLEWARES INICIAIS (OBRIGATÓRIO LOGO APÓS O APP)
// ==========================================================================
app.use(express.json()); // Agora o Express consegue povoar o req.body corretamente
app.use(cors()); 

// Middleware Anti-Cache
app.use((req, res, next) => {
    if (req.url === '/' || req.url.endsWith('.html') || req.url.endsWith('.css')) {
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
    next();
});

// ==========================================================================
// 2. CONFIGURAÇÃO E DOCUMENTAÇÃO SWAGGER (Agora PORT e app já existem)
// ==========================================================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Automação IMONITORE',
            version: '1.0.0',
            description: 'Documentação das rotas de Webhook GLPI, OneDrive e Dashboard',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor Local'
            }
        ],
    },
    apis: ['./src/routes/*.ts', './src/routes/**/*.ts'] 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==========================================================================
// REGISTRO DAS ROTAS
// ==========================================================================
app.use('/api', webhookGLPIRoutes);      
app.use('/api', oneDriveRoutes);   
app.use('/api', dashboardRoutes);       
app.use('/api', apiExternaRoutes);  
app.use('/api', gerarArquivoRoutes);  
app.use('/api', gerarArquivoFilaRoutes); 
app.use('/api', checarArquivoRoutes); // 🌟 Colocado junto com as outras usando
app.use('/api', contratoRoutes);
app.use('/api', parametrizacaoRoutes)
app.use('/api', condicoesComerciaisRoutes)
app.use('/api', veiculoRoutes)
app.use('/api', pedidoRoutes)
app.use('/api', tag)
app.use('/api', authRoutes)

app.use(cors()); // 🌟 2. Ative o CORS antes de qualquer rota!
app.use(express.json());

// ==========================================================================
// 4. ARQUIVOS ESTÁTICOS DO FRONTEND (REACT / DIST)
// ==========================================================================
// app.use(express.static(path.join(__dirname, 'automacao-react', 'dist')));

// app.get('/*any', (req, res) => {
//   res.sendFile(path.join(__dirname, 'automacao-react', 'dist', 'index.html'));
// });

// ==========================================================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// ==========================================================================
app.listen(PORT, () => {
    console.log(`\n Servidor MVC IMONITORE rodando com sucesso na porta ${PORT}`);
    console.log(`Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
    console.log(`Interface Frontend activa em: http://localhost:${PORT}\n`);
});

// async function iniciarServidor() {
//     try {
//         await connectRabbit();

//         app.listen(PORT, () => {
//             console.log(`Servidor rodando na porta ${PORT}`);
//         });

//     } catch (erro) {
//         console.error('Erro ao iniciar servidor:', erro);
//     }
// }

// iniciarServidor();