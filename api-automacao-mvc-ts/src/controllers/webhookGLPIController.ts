import type { Request, Response } from 'express';
import { webhookGLPIService } from '../services/webhookGLPIService';

export class webhookGLPIController{
     constructor(private webHook: webhookGLPIService){}

    // CORREÇÃO: Altere para export const e tipa os parâmetros do Express
    async processarWebhook (req: Request, res: Response): Promise<Response | void>{
    const payload = req.body;
    
    // Resposta rápida recomendada para webhooks, use return por segurança
    res.status(200).send('Recebido com sucesso!'); 

    const idChamado = payload.item?.id || payload.id;
    const statusGLPI = payload.item?.status || payload.status;
    const dataCriacao = payload.item?.date_creation || payload.date;
    const tituloChamado = payload.item?.name || "Sem título";

    if (!idChamado) return;

    let statusTexto = 'Outro';
    if (statusGLPI === 1) statusTexto = 'Não Atendido';
    if (statusGLPI === 2 || statusGLPI === 3) statusTexto = 'Atendido / Em Processamento';
    if (statusGLPI === 4) statusTexto = 'Pendente (Cliente)';
    if (statusGLPI === 5 || statusGLPI === 6) statusTexto = 'Resolvido / Fechado';

    try {

        //Chama service para obter os dados
        const { workbook, linhas } = await this.webHook.obterTodos();

        const todasAsLinhasNovas: any[][] = []; // Matriz tipada explicitamente
        let chamadoJaExiste = false;

        for (const colunas of linhas) {
            let itemID = colunas[1];
            let itemStatus = colunas[3];
            let itemTempo = colunas[5] || 0;

            if (String(itemID) === String(idChamado)) {
                chamadoJaExiste = true;
                itemStatus = statusTexto;

                if ((statusGLPI === 2 || statusGLPI === 3) && dataCriacao) {
                    // CORREÇÃO: Use .getTime() para subtrair datas no TypeScript sem erro de tipagem
                    const dataAtualMs = new Date().getTime();
                    const dataCriacaoMs = new Date(dataCriacao).getTime();
                    itemTempo = Math.round((dataAtualMs - dataCriacaoMs) / 1000 / 60);
                }
            }

            todasAsLinhasNovas.push([itemID, colunas[2], itemStatus, colunas[4], itemTempo, colunas[6]]);
        }

        if (!chamadoJaExiste) {
            todasAsLinhasNovas.push([
                idChamado, tituloChamado, statusTexto,
                dataCriacao || new Date().toISOString(), 0, JSON.stringify(payload)
            ]);
        }

        await this.webHook.salvarHistorico(workbook, todasAsLinhasNovas);
        console.log(`MVC: Chamado #${idChamado} processado.`);

    } catch (erro: any) {
        console.error("Erro no WebhookController:", erro.message);
    }
};

}


