import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Captura todas as requisições que começam com /api
      '/api': {
        target: 'http://127.0.0.1:3000', // Força o IP local da sua API Principal
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Erro no Proxy do Vite:', err);
          });
        },
      },
      // Captura os arquivos estáticos do Worker
      '/public': {
        target: 'http://127.0.0.1:3001', // Força o IP local do Worker
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
