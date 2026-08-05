import { OneDriveModel } from '../models/oneDriveModel';
import type { Request, Response } from 'express';

export const obterDados = (req: Request, res: Response): void => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    try {
        console.log(`[OneDrive Bypass] Solicitando dados reais do disco às ${new Date().toLocaleTimeString()}`);

        //Nesse ponto que chama o metodo da Model para fazer a ação obter os dados da planilha
        const dadosLimpos = OneDriveModel.obterDadosBrutosBypass();

        console.log(`Encomenda enviada: ${dadosLimpos.length} linhas atualizadas extraídas.`);
        res.json(dadosLimpos);
    } catch (erro) {
        console.error("Falha crítica no descarte de cache do OneDrive:", erro);
        res.json([]);
    }
};

export const salvarDados = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const dadosParaSalvar = req.body;

        //Nesse ponto que chama o metodo da Model para fazer a ação salvar os dana planilha
        await OneDriveModel.salvarNoSharepoint(dadosParaSalvar);

        console.log("Planilha Email.xlsx atualizada com Tabela Estruturada para o Power Automate!");
        res.json({ sucesso: true, mensagem: "Gravado com sucesso!" });
    } catch (erro) {
        console.error("Erro ao gravar com ExcelJS estruturado:", erro);
        res.status(500).json({ sucesso: false, message: "Erro ao salvar os dados no SharePoint." });
    }
};
