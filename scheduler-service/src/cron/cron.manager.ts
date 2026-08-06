import cron from 'node-cron';
import { coletarEEnfileirarDadosPdf } from '../services/processamentoArquivoPdfService'; // Seu novo serviço
import { coletarEEnfileirarDadosExcel } from '../services/processamentoArquivoExcelService'; // Seu novo serviço

export function initSchedulerJobs(): void {
    // Todo dia às 2h da manhã
    // cron.schedule('0 2 * * *', async () => {
    //     console.log('[Cron] Disparado gatilho das 02:00...');

    //     // Escreva nomes comuns para a sua rota principal de sucesso
    //     await publisherEvent(
    //         'reports.exchange',                // Nome da sua Exchange Principal
    //         'reports.v1.trigger.daily_report_Excel', // Chave de Rota Principal
            
    //         // PAYLOAD: Dados que a sua função 'geraArquivoExcel(dados)' precisa
    //         { 
    //             task: 'generate_daily_report',
    //             tipoRelatorio: 'excel', 
    //             solicitadoEm: new Date().toISOString()
    //         }
    //     );
    // }, {
    //     timezone: "America/Sao_Paulo" 
    // });

    // Todo dia às 2h da manhã EXCEL
    cron.schedule('* * * * *', async () => {
    console.log('\n--- [Cron] Iniciando ciclo do minuto ---');
    
    try {
        // CHAME APENAS ESTA FUNÇÃO: Ela já coleta do Excel, dá assertExchange e publica sozinha
        const resultadoProtocolo = await coletarEEnfileirarDadosExcel();
        
        if (resultadoProtocolo) {
            console.log(`[Cron] Ciclo finalizado. Protocolo: ${resultadoProtocolo}`);
        }
    } catch (error: any) {
        console.error('[Cron] Erro na execução:', error.message);
    }
  });

    // Todo dia às 2h da manhã PDF
    cron.schedule('* * * * *', async () => {
    console.log('\n--- [Cron] Iniciando ciclo do minuto ---');
    
    try {
        // CHAME APENAS ESTA FUNÇÃO: Ela já coleta do Excel, dá assertExchange e publica sozinha
        const resultadoProtocolo = await coletarEEnfileirarDadosPdf();
        
        if (resultadoProtocolo) {
            console.log(`[Cron] Ciclo finalizado. Protocolo: ${resultadoProtocolo}`);
        }
    } catch (error: any) {
        console.error('[Cron] Erro na execução:', error.message);
    }
  });
}