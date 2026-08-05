import type { Request, Response } from 'express';
// 1. O import da Model precisa usar exatamente o nome da classe exportada
import { ApiExternaModel } from '../models/apiExternaModel';

// 2. CORREÇÃO: Remova o 'exports.' e use 'export const' com as tipagens do Express
export const obterDadosAPIExterna = async (req: Request, res: Response): Promise<Response | void> => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    try {
     const cepInformado = req.params.cep as string; // Garante ao TS que isso será uma string

     // Agora o compilador aceitará o parâmetro sem reclamar
     const retorno = await ApiExternaModel.obterDadosApi(cepInformado);

        // 4. CORREÇÃO DO TOTAL: O ViaCEP retorna um Objeto {} e não um Array [].
        // Objetos não têm a propriedade .length. Para contar os campos usamos Object.keys()
        const totalCampos = retorno ? Object.keys(retorno).length : 0;
        console.log(`Consultado: ${totalCampos} propriedades retornadas. CEP consultado com sucesso.`);

        // 5. Adicione 'return' para encerrar a requisição de sucesso de forma limpa
        return res.json(retorno);

    } catch (erro: any) {
        console.error("Falha ao consumir dados API externa Brasil API:", erro.message);
        
        // 6. Adicione 'return' aqui também para fechar o fluxo no catch
        return res.status(500).json({ erro: 'Falha ao consultar o CEP informado.' });
    }
};
