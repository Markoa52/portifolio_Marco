// src/services/geradorApi.service.ts
import axios from 'axios';

// Instância do Axios apontando para o microsserviço (Porta 3001)
const apiGerador = axios.create({
  baseURL: 'http://localhost:3001', 
  timeout: 30000
});

// Interface para prever o formato da resposta do microsserviço
interface RespostaMicrosservico {
  urlDownload: string;
}

export const geradorApiService = {
  // Tipagem correta dos parâmetros: formato é uma string (pdf, excel) e dadosPayload é um array de objetos
  async solicitarGeracaoDeArquivo(formato: string, dadosPayload: Record<string, any>[]): Promise<string> {
    
    // O método post recebe a interface para que o TypeScript saiba o que tem dentro de 'data'
    const { data } = await apiGerador.post<RespostaMicrosservico>('/gerar', {
      tipo: formato,
      dados: dadosPayload
    });
    
    return data.urlDownload; 
  }
};
