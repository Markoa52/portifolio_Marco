import {GeradorArquivosServices} from '../services/gerarArquivoFilaServices'
import {usuarioRepository} from '../repositories/usuarioRepository'
import { Request, Response } from 'express'; 

export class GerarArquivoFilaController {
  constructor(private geradorService: GeradorArquivosServices, private usuRepo: usuarioRepository ) {}

  async arquivoSend(req: Request, res: Response) {
  try {
    // 1. Busca a lista de usuários do banco
    const dadosUsuario = await this.usuRepo.buscarUsuariosDownload();

    // 3. Passa o objeto completo para o Service
        const resultado = await this.geradorService.agendarGeracaoDeRelatorio({
      ...req.body,
      dadosLimpo: dadosUsuario
    });

    return res.status(200).json(resultado);
  } catch (erro: any) {
    return res.status(400).json({ erro: erro.message });
  }
}

}
