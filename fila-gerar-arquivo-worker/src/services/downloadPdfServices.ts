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

    // CAPTURA O ID ENVIADO PELA CONTROLLER (Ou gera um fallback se não vier)
// 1. Garante que estamos olhando para o objeto interno se ele vier envelopado
const mensagemReal = payload?.payload ? payload.payload : payload;

// 2. Extrai a lista do campo 'js' ou usa o próprio objeto se ele já for a lista
const dados = mensagemReal?.js || mensagemReal;

const protocoloLimpo = String(mensagemReal.protocolo).replace(/:/g, '-');

// 3. Sua validação para o Excel (agora vai passar com sucesso!)
if (!dados || !Array.isArray(dados) || dados.length === 0) {
  console.error("Estrutura recebida inválida para Excel:", payload);
  throw new Error("Os dados fornecidos para gerar o Excel não são um array ou estão vazios.");
}

    console.log(`[PDF] Iniciando processamento do protocolo: ${protocoloLimpo} com ${dados.length} linhas.`);

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

    // 2. Definição do espaçamento horizontal real (Eixo X) para não sobrepor
    const colX1 = 40;   // ID
    const colX2 = 80;   // NOME
    const colX3 = 220;  // USUARIO
    const colX4 = 320;  // EMAIL
    const colX5 = 440;  // STATUS
    const colX6 = 490;  // DATA
    const colX7 = 550;  // PERFIL
    
    let eixoY = height - 75;
    
    // Desenha o Cabeçalho da tabela original na primeira página
    pagina.drawText('ID', { x: colX1, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('NOME', { x: colX2, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('USUARIO', { x: colX3, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('EMAIL', { x: colX4, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('STATUS', { x: colX5, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('DATA', { x: colX6, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    pagina.drawText('PERFIL', { x: colX7, y: eixoY, size: 10, font: fonteHelveticaBold, color: rgb(0, 0.4, 0.8) });
    
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
    
    // 3. Loop de registros dos dados
    if (dados && Array.isArray(dados)) {
      // Criamos uma variável mutável para referenciar em qual página estamos desenhando
      let paginaAtual = pagina; 
    
      for (const item of dados) {
        
        // 🟢 CORREÇÃO 1: Cria nova página APENAS quando o eixoY atingir o limite inferior
        if (eixoY <= 40) {
          paginaAtual = pdfDoc.addPage(); // Cria e atualiza a página de desenho
          eixoY = height - 40;            // Reinicia o topo do eixo Y na nova página
        }
    
        // Mapeamento flexível das chaves
        const campoId = item.ID || item.Id || item.id || 'N/A';
        const campoNome = item.NOME || item.Nome || item.nome || 'Sem Nome';
        const campoUsuario = item.USUARIO || item.Usuario || item.usuario || '-';
        const campoEmail = item.EMAIL || item.Email || item.email || '-';
        const campoStatus = item.ATIVO || item.Ativo || item.ativo || '-';
        const campoData = item.DATACRIACAO || item.DataCriacao || item.dataCriacao || '-';
        const campPerfil = item.PERFIL || item.Perfil || item.perfil || '-';
    
        // Ajuste de corte (substring) de acordo com o novo espaço das colunas
        const txtId = String(campoId).substring(0, 6);
        const txtNome = String(campoNome).substring(0, 28);
        const txtUsuario = String(campoUsuario).substring(0, 18);
        const txtEmail = String(campoEmail).substring(0, 22);
        const txtStatus = String(campoStatus).substring(0, 10);
        const txtData = String(campoData).substring(0, 10);
        const txtPerfil = String(campPerfil).substring(0, 10);
    
        // 🟢 CORREÇÃO 2: Desenha na 'paginaAtual' (independente de ser a primeira ou as novas)
        paginaAtual.drawText(txtId, { x: colX1, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtNome, { x: colX2, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtUsuario, { x: colX3, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtEmail, { x: colX4, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtStatus, { x: colX5, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtData, { x: colX6, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        paginaAtual.drawText(txtPerfil, { x: colX7, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
    
        // Linha divisória sutil entre os registros
        paginaAtual.drawLine({
          start: { x: 40, y: eixoY - 6 },
          end: { x: width - 40, y: eixoY - 6 },
          thickness: 0.5,
          color: rgb(0.9, 0.9, 0.9),
        });
    
        eixoY -= 20; 
    
        await deixarRespirar();
      }
    }

    // 2. CORREÇÃO CRÍTICA: Alinhe o nome exatamente com o que a rota de checagem procura
    // CORREÇÃO DO NOME E PASTA DESTINO
    const nomeDoArquivo = `documento_${protocoloLimpo}.pdf`;
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
