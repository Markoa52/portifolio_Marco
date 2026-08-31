// 1. ADICIONE ESSES IMPORTS NO TOPO DO ARQUIVO PARA CORRIGIR O __dirname
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import ExcelJS from 'exceljs';

// No CommonJS da API Principal, imports locais não levam extensão no caminho
import { CAMINHO_EXCELF, NOME_TABELA } from '../config/excelConfig.js';

// 2. RECRIE AS VARIÁVEIS DE CAMINHO PARA ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função auxiliar para dar fôlego ao Event Loop (evitar quedas do RabbitMQ)
const deixarRespirar = () => new Promise(resolve => setImmediate(resolve));

export const geraArquivoPdf = async (payload: any): Promise<string> => {
  try {

    // CORREÇÃO DOS DADOS: Extrai o array de dentro da propriedade 'js' que a Controller enviou
    const listaItens = payload?.js || payload?.payload?.js;

    // VALIDAÇÃO: Impede que o "for" execute se a lista não for um array válido
    if (!listaItens || !Array.isArray(listaItens)) {
        console.error("[Erro Crítico] A propriedade 'js' está ausente ou não é um array:", payload);
        throw new Error("payload is not iterable: O array 'js' não pôde ser encontrado.");
    }

        const totalLinha = listaItens.length;
    console.log(`[PDF] Iniciando processamento do protocolo: ${payload.protocoloId || 'sem_id'} com ${totalLinha} linhas.`);

        // CORREÇÃO: Voltamos para o índice 0, que agora conterá os dados reais da primeira fatura
        // Captura a primeira linha para pegar o bill_id do nome do arquivo
    const primeiraLinha = listaItens[0];
    const fatura = primeiraLinha?.bill_id;

  if (!fatura) {
        throw new Error("A propriedade 'bill_id' não foi encontrada na primeira linha do array 'js'.");
    }


    // 1. Captura o ID do protocolo enviado pela nova Controller
    const protocoloId = payload && payload.protocoloId ? payload.protocoloId : Date.now();

    console.log(`[PDF] Iniciando processamento do protocolo: ${protocoloId} com ${payload.length} linhas.`);
    

    const pdfDoc = await PDFDocument.create();
    
    // 1. Configura o tamanho de página A4 em modo Paisagem (Landscape)
    const pagina = pdfDoc.addPage([842, 595]); 
    const { width, height } = pagina.getSize();

    const fonteHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fonteHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Título do Relatório
    pagina.drawText('Relatório de Dados Alinhados (Visão Expandida)', {
      x: 40,
      y: height - 40,
      size: 18,
      font: fonteHelveticaBold,
      color: rgb(0, 0.2, 0.4),
    });

    // 2. Definição do espaçamento horizontal (Eixo X) das 4 colunas
    const colX1 = 40;  // Coluna COD_CLI
    const colX2 = 180; // Coluna BILL_ID
    const colX3 = 450; // Coluna DATA_PASSAGEM
    const colX4 = 680; // Coluna LOCAL_PASSAGEM
    const colX5 = 900; // Coluna VALOR

    let eixoY = height - 75;

    // Desenha o Cabeçalho da tabela
    pagina.drawText('COD_CLI', { x: colX1, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('BILL_ID', { x: colX2, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('DATA_PASSAGEM', { x: colX3, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('LOCAL_PASSAGEM', { x: colX4, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
     pagina.drawText('VALOR', { x: colX5, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });

    // Linha divisória abaixo do cabeçalho
    eixoY -= 8;
    pagina.drawLine({
      start: { x: 40, y: eixoY },
      end: { x: width - 40, y: eixoY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    eixoY -= 18;

    console.log("ESTRUTURA DA PRIMEIRA LINHA RECEBIDA NO WORKER PDF:", JSON.stringify(listaItens[0], null, 2));

    // 3. Loop de registros dos dados enfileirados pelo RabbitMQ
    // 1. Função utilitária no topo do arquivo (se já não tiver) para liberar o Event Loop
    

      if (listaItens && Array.isArray(listaItens)) {
      // CORREÇÃO: Alterado de .forEach para for...of para permitir o uso de await

      for (const item of listaItens) {
        
      if (eixoY <= 40) {

      const pagina = pdfDoc.addPage(); // Cria nova página
      eixoY = height - 40;       // Reinicia o topo do eixo Y
      // Mapeamento flexível das chaves enviado pelo payload
      const campoCod = item.COD_CLI || item.Cod_cli || item.cod_cli || 'N/A';
      const campoBillId = item.BILL_ID || item.Bill_id || item.bill_id || 'Sem Assunto';
      const campoDtPassagem = item.DATA_PASSAGEM || item.Data_passagem|| item.data_passagem || '-';
      const campoLcPassagem = item.LOCAL_PASSAGEM || item.Local_passagem || item.local_passagem || item.ACAO || item.acao || '-';
      const campoValor = item.VALOR || item.Valor || item.valor_passagem || '-';

      // Ajuste de corte para evitar sobreposição de texto nas colunas deitadas
      const txtCod = String(campoCod).substring(0, 22);
      const txtBillId = String(campoBillId).substring(0, 48);
      const txtPassagem = String(campoDtPassagem).substring(0, 38);
      const txtLcPassagem = String(campoLcPassagem).substring(0, 25);
      const txtValor= String(campoValor).substring(0, 25);

      // Desenha todos os atributos alinhados na mesma linha horizontal (eixoY)
      pagina.drawText(txtCod, { x: colX1, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtBillId, { x: colX2, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtPassagem, { x: colX3, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtLcPassagem, { x: colX4, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtValor, { x: colX4, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });

      // Linha divisória sutil entre os registros da tabela
      pagina.drawLine({
        start: { x: 40, y: eixoY - 6 },
        end: { x: width - 40, y: eixoY - 6 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });

      eixoY -= 20; 

      // CORREÇÃO CRÍTICA: Interrompe a execução síncrona por 1 milissegundo 
      // para o Node.js manter a conexão viva com o RabbitMQ
      await deixarRespirar();
    }
  }
}

    // 2. CORREÇÃO CRÍTICA: Alinhe o nome exatamente com o que a rota de checagem procura
    // CORREÇÃO DO NOME E PASTA DESTINO
    const nomeDoArquivo = `fatura_${fatura}_${protocoloId}.pdf`;
    const caminhoDestino = path.join(__dirname, '../../public/downloads/pdf', nomeDoArquivo);
    const urlGerada = `http://localhost:5173/public/downloads/pdf/${nomeDoArquivo}`;

    // Salvo o link retornado para a planilha
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(CAMINHO_EXCELF);
    
    // Captura a primeira aba da lista de planilhas
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
        throw new Error(`Falha ao salvar histórico: Aba principal não pôde ser lida no workbook.`);
    }
    
    // LIMPEZA SEGURA CONTRA O ERRO DE REMOVETABLE:
    try {
        if ((worksheet as any)._tables) {
            (worksheet as any)._tables = {};
        }
    } catch (e) {
        console.log("ℹNão foi possível redefinir a tabela do GLPI, sobrepondo dados...");
    }
    
    const totalLinhas = worksheet.rowCount;
    if (totalLinhas > 1) {
        worksheet.spliceRows(2, totalLinhas - 1);
    }
    
    // ==========================================
    // CORREÇÃO: Estruturando a linha corretamente
    // ==========================================
    // Cada elemento do array 'dadosDaLinha' corresponde a uma coluna na mesma ordem:
    // [cod_cli, bill_id, link_excel, link_pdf, link_nf]

        for (const item of listaItens) {

        const dadosDaLinha = [
        item.cod_cli,       // cod_cli (deixe null ou passe o valor se tiver)
        item.bill_id,       // bill_id (deixe null ou passe o valor se tiver)
        null,       // link_excel (deixe null se for preencher depois)
        urlGerada,  // link_pdf -> Aqui entra a sua URL gerada na 4ª coluna!
        null        // link_nf
       ];

       worksheet.addTable({
           name: NOME_TABELA,
           ref: 'A2',
           headerRow: false,
           columns: [
               { name: 'cod_cli' }, 
               { name: 'bill_id' }, 
               { name: 'link_excel' },
               { name: 'link_pdf' }, // Vai receber o valor correspondente do array (urlGerada)
               { name: 'link_nf' }
           ],
           // Passamos a linha dentro de um array [dadosDaLinha], pois rows aceita múltiplas linhas
           rows: [dadosDaLinha] 
       });
     }
        await workbook.xlsx.writeFile(CAMINHO_EXCELF);
        const agora = new Date();
        fs.utimesSync(CAMINHO_EXCELF, agora, agora);

    // Garante que a árvore de diretórios física exista no disco
    const pastaDestino = path.dirname(caminhoDestino);
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    // Escreve os bytes binários do PDF gerado de forma síncrona
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(caminhoDestino, pdfBytes);

    console.log(`[PDF] Arquivo gerado com sucesso: ${nomeDoArquivo}`);

    return urlGerada;

  } catch (error: any) {
    console.error("Erro interno no worker do PDF:", error.message);
    throw new Error(`Falha na gravação local do arquivo PDF: ${error.message}`);
  }
};

