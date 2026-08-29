import type { Request, Response } from 'express';
// No CommonJS da API Principal, imports locais não levam extensão no caminho
import { webhookPedagioService } from '../services/webhookPedagioService';

export class dashboardController{
constructor(private glpi:webhookPedagioService ){}

async obterDadosAPI(req: Request, res: Response): Promise<Response | void>{
    try {
        // Chama o método da model que já foi convertido e tipado anteriormente
        const { linhas } = await this.glpi.obterTodos();

        let naoAtendidos = 0;
        let atendidos = 0;
        let pendentes = 0;
        let fechados = 0;
        
        // Define o array de números de forma estrita para o TypeScript
        const tempos: number[] = [];

        for (const colunas of linhas) {
            // No exceljs, as colunas da matriz 'values' começam no índice 1 (o índice 0 fica vazio)
            // Certifique-se de que os índices 3 e 5 batem com a posição real das colunas na planilha
            const status = colunas[3];
            const tempo = parseFloat(colunas[5]) || 0;

            if (status === 'Não Atendido') naoAtendidos++;
            if (status === 'Atendido / Em Processamento') atendidos++;
            if (status === 'Pendente (Cliente)') pendentes++;
            if (status === 'Resolvido / Fechado') fechados++;
            if (tempo > 0) tempos.push(tempo);
        }

        const tempoMedio = tempos.length > 0 
            ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) 
            : 0;

        // O 'return' garante o encerramento do fluxo e evita o erro ERR_HTTP_HEADERS_SENT
        return res.json({ naoAtendidos, atendidos, pendentes, fechados, tempoMedio });

    } catch (e: any) {
        console.error("Erro na controller de dashboard do GLPI:", e.message);
        return res.status(500).json({ erro: e.message });
    }
};
}

