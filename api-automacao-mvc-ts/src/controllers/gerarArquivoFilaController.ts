import { obterDadosBrutosBypass } from '../models/arquivoModel';
import { enviarMensagem } from '../config/rabbitConfig';
import type { Request, Response } from 'express';

export const arquivoSend = async (req: Request, res: Response): Promise<Response | void> =>  {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    try {
        const corpoRequisicao = req.body;

        // CORREÇÃO 1: Validação do body movida para o topo para evitar quebras de leitura
        if (!corpoRequisicao || Object.keys(corpoRequisicao).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O corpo da requisição não pode estar vazio.'
            });
        }

        // Captura e limpa o formato desejado
        let formatoDesejado = corpoRequisicao.tipoArquivo;

        if (formatoDesejado && typeof formatoDesejado === 'string') {
            formatoDesejado = formatoDesejado
                .replace(/['"\n\r]/g, '')
                .trim();
        }

        console.log("REQ BODY:", corpoRequisicao);
        console.log("tipoArquivo:", formatoDesejado);

        // Mapeamento do tipo de arquivo para a fila correspondente
        let FILA: string;
        if (formatoDesejado === "excel") {
            FILA = 'processa-arquivoExcel';
        } else if (formatoDesejado === "pdf") {
            FILA = 'processa-arquivoPdf';
        } else {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo de arquivo inválido. Use "excel" ou "pdf".'
            });
        }

        // Busca os dados do banco de dados que preencherão o arquivo
        const dadosLimpos = await obterDadosBrutosBypass();

        // CORREÇÃO 2: Monta o payload unindo as configurações e a lista de dados ('js')
        // Assim o seu worker do Excel receberá o array esperado no .forEach()
       // Na sua Controller (arquivoSend), mude o final do bloco try para:
       const protocoloId = `arq_${Date.now()}`;
       
       const payloadMensagem = {
           protocoloId, // Envia o ID para o worker nomear o arquivo com ele
           tipoArquivo: formatoDesejado,
           js: Array.isArray(dadosLimpos) ? dadosLimpos : [dadosLimpos] 
       };
       // Despacha o payload completo e estruturado para o RabbitMQ
       await enviarMensagem(FILA, payloadMensagem);
       
       // Retorna o ID para o front-end monitorar
       return res.status(200).json({
           sucesso: true,
           protocoloId
       });

    } catch (error: any) {
        console.error('Erro ao processar fila no RabbitMQ:', error.message);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao enfileirar o arquivo.'
        });
    }
};


