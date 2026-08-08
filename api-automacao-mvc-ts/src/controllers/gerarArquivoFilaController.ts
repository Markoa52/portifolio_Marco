import { obterDadosBrutosBypass } from '../models/arquivoModel';
import type { Request, Response } from 'express';
import {publisherEvent} from '../queue/publisher';

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

        // Busca os dados do banco de dados que preencherão o arquivo
        const dadosLimpos = await obterDadosBrutosBypass();

        // CORREÇÃO 2: Monta o payload unindo as configurações e a lista de dados ('js')
        // Assim o seu worker do Excel receberá o array esperado no .forEach()
       // Na sua Controller (arquivoSend), mude o final do bloco try para:
       const protocoloId = `arq_${Date.now()}`;

        // Mapeamento do tipo de arquivo para a fila correspondente
        if (formatoDesejado === "excel") {

        // 2. CONEXÃO COM O RABBITMQ
        // 3. MONTA O PAYLOAD PARA O WORKER
        console.log("[DEBUG AGENDADOR] Payload final que será enviado ao RabbitMQ:", JSON.stringify(dadosLimpos, null, 2));
        // 4. PUBLICAÇÃO NA ESTRUTURA BLINDADA DO SEU CONSUMER
        const EXCHANGE = 'reports.exchange';
        const ROUTING_KEY = 'reports.v1.trigger.download_excel';
      
        // Escreva nomes comuns para a sua rota principal de sucesso
        await publisherEvent(
            'reports.exchange',                // Nome da sua Exchange Principal
            'reports.v1.trigger.download_excel', // Chave de Rota Principal
            
            // PAYLOAD: Dados que a sua função 'geraArquivoPdf(dados)' precisa
            { 
                protocoloId,
                task: 'generate_daily_report_excel',
                tipoArquivo: 'excel', 
                solicitadoEm: new Date().toISOString(),
                // Garante que os dados coletados sejam enviados como um array legítimo
                js: Array.isArray(dadosLimpos) ? dadosLimpos : [dadosLimpos]
            }
        );

        console.log(`[Agendador] Mensagem publicada na exchange "${EXCHANGE}". Rota: "${ROUTING_KEY}"`);
        console.log(`[Agendador] Protocolo: ${protocoloId}`);

        } else if (formatoDesejado === "pdf") {
            // 2. CONEXÃO COM O RABBITMQ
        // 3. MONTA O PAYLOAD PARA O WORKER
        console.log("[DEBUG AGENDADOR] Payload final que será enviado ao RabbitMQ:", JSON.stringify(dadosLimpos, null, 2));
        // 4. PUBLICAÇÃO NA ESTRUTURA BLINDADA DO SEU CONSUMER
        const EXCHANGE = 'reports.exchange';
        const ROUTING_KEY = 'reports.v1.trigger.download_pdf';
      
        // Escreva nomes comuns para a sua rota principal de sucesso
        await publisherEvent(
            'reports.exchange',                // Nome da sua Exchange Principal
            'reports.v1.trigger.download_pdf', // Chave de Rota Principal
            
            // PAYLOAD: Dados que a sua função 'geraArquivoPdf(dados)' precisa
            { 
                protocoloId,
                task: 'generate_daily_report_pdf',
                tipoArquivo: 'excel', 
                solicitadoEm: new Date().toISOString(),
                // Garante que os dados coletados sejam enviados como um array legítimo
                js: Array.isArray(dadosLimpos) ? dadosLimpos : [dadosLimpos]
            }
        );

        console.log(`[Agendador] Mensagem publicada na exchange "${EXCHANGE}". Rota: "${ROUTING_KEY}"`);
        console.log(`[Agendador] Protocolo: ${protocoloId}`);

        } else {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo de arquivo inválido. Use "excel" ou "pdf".'
            });
        }
       
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


