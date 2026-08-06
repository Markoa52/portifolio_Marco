import xlsx from 'xlsx';
import fs from 'fs';
import { publisherEvent } from '../queue/publisher';

export const coletarEEnfileirarDadosExcel = async (): Promise<string | null> => {
    try {
        console.log('[Agendador] Iniciando leitura do arquivo Excel de testes...');
        
        // Define o caminho do arquivo Excel que você usará para o teste
        // O arquivo deve estar na raiz do projeto ou em uma pasta "data"
        // Busca o arquivo direto na raiz da pasta onde você rodou o comando no terminal
        const caminhoArquivo = 'C:\\Site\\DadosFatura.xlsx';

        // Valida se o arquivo de teste realmente existe para evitar quebras
        if (!fs.existsSync(caminhoArquivo)) {
            console.error(`[Agendador - Erro] Arquivo de teste não encontrado em: ${caminhoArquivo}`);
            console.log('[Agendador] Por favor, crie o arquivo Excel nessa pasta para continuar.');
            return null;
        }

        // 1. EXECUTA A COLETA (Lendo o Excel e convertendo para JSON)
        const workbook = xlsx.readFile(caminhoArquivo);
        const primeiraAba = workbook.SheetNames[0]; // Pega a primeira planilha do arquivo
        const planilha = workbook.Sheets[primeiraAba];
        
        // Converte as linhas do Excel diretamente em um Array de Objetos JSON
        const dadosColetados = xlsx.utils.sheet_to_json(planilha);

        if (!dadosColetados || dadosColetados.length === 0) {
            console.log('[Agendador] O arquivo Excel de teste está vazio.');
            return null;
        }
        console.log("[DEBUG AGENDADOR] Conteúdo bruto extraído do Excel:", dadosColetados);

        console.log(`[Agendador] Sucesso! ${dadosColetados.length} linhas coletadas do Excel.`);

        const protocoloId = `arq_sched_${Date.now()}`;

        if (!dadosColetados || (Array.isArray(dadosColetados) && dadosColetados.length === 0)) {
          console.log('[Agendador] O arquivo Excel de teste está vazio.');
          return null;
        }
        // 2. CONEXÃO COM O RABBITMQ
        // 3. MONTA O PAYLOAD PARA O WORKER
        const payloadMensagem = {
        protocoloId,
        tipoArquivo: 'excel', // Se você estiver disparando para a fila de PDF
        // Força a conversão para array caso 'dadosColetados' tenha vindo como um objeto isolado
        js: Array.isArray(dadosColetados) ? dadosColetados : [dadosColetados]
        };

        console.log("[DEBUG AGENDADOR] Payload final que será enviado ao RabbitMQ:", JSON.stringify(payloadMensagem, null, 2));
        // 4. PUBLICAÇÃO NA ESTRUTURA BLINDADA DO SEU CONSUMER
        const EXCHANGE = 'reports.exchange';
        const ROUTING_KEY = 'reports.v1.trigger.processa_excel';
      
        // Escreva nomes comuns para a sua rota principal de sucesso
        await publisherEvent(
            'reports.exchange',                // Nome da sua Exchange Principal
            'reports.v1.trigger.processa_excel', // Chave de Rota Principal
            
            // PAYLOAD: Dados que a sua função 'geraArquivoPdf(dados)' precisa
            { 
                protocoloId,
                task: 'generate_daily_report_excel',
                tipoArquivo: 'excel', 
                solicitadoEm: new Date().toISOString(),
                // Garante que os dados coletados sejam enviados como um array legítimo
                js: Array.isArray(dadosColetados) ? dadosColetados : [dadosColetados]
            }
        );

        console.log(`[Agendador] Mensagem publicada na exchange "${EXCHANGE}". Rota: "${ROUTING_KEY}"`);
        console.log(`[Agendador] Protocolo: ${protocoloId}`);

        return protocoloId;

    } catch (error: any) {
        console.error('[Agendador - Erro] Falha crítica na rotina:', error.message);
        throw error;
    }
};
