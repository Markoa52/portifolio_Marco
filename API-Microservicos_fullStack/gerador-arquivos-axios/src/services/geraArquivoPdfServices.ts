// src/services/geraArquivoPdfServices.ts
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const geraArquivoPdf = async (dados: any[]): Promise<string> => {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // 1. MODIFICAÇÃO PARA MODO PAISAGEM (LANDSCAPE): Dá muito mais espaço horizontal para as 4 colunas
    const pagina = pdfDoc.addPage([842, 595]); // Tamanho A4 deitado (L: 842, A: 595)
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

    // 2. CORREÇÃO DOS ESPAÇOS HORIZONTAIS (Aproveitando a largura de 842 pontos)
    const colX1 = 40;  // Coluna DATA
    const colX2 = 180; // Coluna ASSUNTO (Dá 140 pontos de espaço para a data)
    const colX3 = 450; // Coluna EMAIL (Dá 270 pontos de espaço para o assunto)
    const colX4 = 680; // Coluna ACOES (Dá 230 pontos de espaço para o e-mail)

    let eixoY = height - 75;

    // Desenha o Cabeçalho
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

    console.log("ESTRUTURA DA PRIMEIRA LINHA RECEBIDA:", JSON.stringify(dados[0], null, 2));

    // 3. Loop de registros
    dados.forEach((item) => {
      if (eixoY > 40) {
        // Mapeamento flexível das chaves
        const campoData = item.DATA || item.Data || item.data || 'N/A';
        const campoAssunto = item.ASSUNTO || item.Assunto || item.assunto || 'Sem Assunto';
        const campoEmail = item.EMAIL || item.Email || item.email || '-';
        // Ajustado para checar chaves prováveis para ACOES
        const campoAcao = item.ACOES || item.Acoes || item.acoes || item.ACAO || item.acao || '-';

        // 3. AJUSTE DE CORTE (Evita que o texto invada o início da próxima coluna)
        const txtData = String(campoData).substring(0, 22);
        const txtAssunto = String(campoAssunto).substring(0, 48);
        const txtEmail = String(campoEmail).substring(0, 38);
        const txtAcao = String(campoAcao).substring(0, 25);

        // 4. CORREÇÃO DO EIXO X: Agora a ação usa a variável 'colX4' correta
        pagina.drawText(txtData, { x: colX1, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        pagina.drawText(txtAssunto, { x: colX2, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        pagina.drawText(txtEmail, { x: colX3, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });
        pagina.drawText(txtAcao, { x: colX4, y: eixoY, size: 9, font: fonteHelvetica, color: rgb(0.2, 0.2, 0.2) });

        // Linha sutil separando os registros
        pagina.drawLine({
          start: { x: 40, y: eixoY - 6 },
          end: { x: width - 40, y: eixoY - 6 },
          thickness: 0.5,
          color: rgb(0.9, 0.9, 0.9),
        });

        eixoY -= 20; 
      }
    });

    // 5. Salva fisicamente o arquivo em disco
    const nomeDoArquivo = `documento_${Date.now()}.pdf`;
    const caminhoDestino = path.join(process.cwd(), 'public', 'downloads', 'pdf', nomeDoArquivo);

    const pastaDestino = path.dirname(caminhoDestino);
    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(caminhoDestino, pdfBytes);
    console.log(`✅ PDF Expandido gerado com sucesso em: ${caminhoDestino}`);

    return `http://localhost:3001/public/downloads/pdf/${nomeDoArquivo}`;

  } catch (error: any) {
    console.error("Erro interno no service do PDF:", error.message);
    throw new Error(`Falha na gravação local do arquivo PDF: ${error.message}`);
  }
};
