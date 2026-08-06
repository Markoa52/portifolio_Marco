// 1. ADICIONE ESSES IMPORTS NO TOPO DO ARQUIVO PARA CORRIGIR O __dirname
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// 2. RECRIE AS VARIÁVEIS DE CAMINHO PARA ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função auxiliar para dar fôlego ao Event Loop (evitar quedas do RabbitMQ)
const deixarRespirar = () => new Promise(resolve => setImmediate(resolve));

export const geraArquivoPdfDw = async (payload: any): Promise<string> => {
  try {

    // CORREÇÃO DOS DADOS: Extrai o array de dentro da propriedade 'js' que a Controller enviou
    const dados = payload && payload.js ? payload.js : payload;

    // 1. Captura o ID do protocolo enviado pela nova Controller
    const protocoloId = payload && payload.protocoloId ? payload.protocoloId : Date.now();

    // Proteção: Garante que os dados são uma lista válida antes de continuar
    if (!dados || !Array.isArray(dados) || dados.length === 0) {
      throw new Error("Os dados fornecidos para gerar o PDF não são um array ou estão vazios.");
    }

    console.log(`[PDF] Iniciando processamento do protocolo: ${protocoloId} com ${dados.length} linhas.`);

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
    const colX1 = 40;  // Coluna DATA
    const colX2 = 180; // Coluna ASSUNTO
    const colX3 = 450; // Coluna EMAIL
    const colX4 = 680; // Coluna ACOES

    let eixoY = height - 75;

    // Desenha o Cabeçalho da tabela
    pagina.drawText('DATA', { x: colX1, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('ASSUNTO', { x: colX2, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('EMAIL', { x: colX3, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });

    pagina.drawText('AÇÕES', { x: colX4, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });

    // Linha divisória abaixo do cabeçalho
    eixoY -= 8;
    pagina.drawLine({
      start: { x: 40, y: eixoY },
      end: { x: width - 40, y: eixoY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    eixoY -= 18;

    console.log("ESTRUTURA DA PRIMEIRA LINHA RECEBIDA NO WORKER PDF:", JSON.stringify(dados[0], null, 2));

    // 3. Loop de registros dos dados enfileirados pelo RabbitMQ
    // 1. Função utilitária no topo do arquivo (se já não tiver) para liberar o Event Loop


// ... restante do seu código ...

if (dados && Array.isArray(dados)) {
  // CORREÇÃO: Alterado de .forEach para for...of para permitir o uso de await
  for (const item of dados) {
    if (eixoY <= 40) {

      const pagina = pdfDoc.addPage(); // Cria nova página
      eixoY = height - 40;       // Reinicia o topo do eixo Y
      // Mapeamento flexível das chaves enviado pelo payload
      const campoData = item.DATA || item.Data || item.data || 'N/A';
      const campoAssunto = item.ASSUNTO || item.Assunto || item.assunto || 'Sem Assunto';
      const campoEmail = item.EMAIL || item.Email || item.email || '-';
      const campoAcao = item.ACOES || item.Acoes || item.acoes || item.ACAO || item.acao || '-';

      // Ajuste de corte para evitar sobreposição de texto nas colunas deitadas
      const txtData = String(campoData).substring(0, 22);
      const txtAssunto = String(campoAssunto).substring(0, 48);
      const txtEmail = String(campoEmail).substring(0, 38);
      const txtAcao = String(campoAcao).substring(0, 25);

      // Desenha todos os atributos alinhados na mesma linha horizontal (eixoY)
      pagina.drawText(txtData, { x: colX1, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtAssunto, { x: colX2, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtEmail, { x: colX3, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
      pagina.drawText(txtAcao, { x: colX4, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });

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
    const nomeDoArquivo = `documento_${protocoloId}.pdf`;
    const caminhoDestino = path.join(__dirname, '../../public/downloads/pdf', nomeDoArquivo);
    const urlGerada = `http://localhost:5173/public/downloads/pdf/${nomeDoArquivo}`;

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
