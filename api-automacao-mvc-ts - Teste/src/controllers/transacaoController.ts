import { Request, Response } from 'express';
import { TransacaoService } from '../services/transacaoServices';

export class TransacaoController {
  constructor(private transacaoService: TransacaoService) {}

  async receberDadosViagem(req: Request, res: Response): Promise<Response> {
    try {
      const dados = req.body;   
      const metadata = {acao: 'inserir', protocolo: new Date};

      if (!dados.contratoId || !dados.statusViagemTipo) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Campos obrigatórios (id, contratoId, statusViagemTipo) ausentes.' 
        });
      }

      // Envia os dados para a camada de serviço enfileirar
      await this.transacaoService.enfileirarTransacao(dados, metadata);

      // Status 202 significa: "Aceito para processamento, mas ainda não finalizado"
      return res.status(202).json({
        sucesso: true,
        mensagem: 'Transação recebida e enviada para a fila de processamento.'
      });

    } catch (error: any) {
      console.error('❌ Erro na controller de integração:', error.message);
      return res.status(500).json({ sucesso: false, erro: 'Erro interno ao enfileirar os dados.' });
    }
  }
}
