import type { Request, Response } from 'express';
import { authServices } from '../services/authServices';

export class authController {
  constructor(private auth: authServices) {}

   // DENTRO DO SEU ARQUIVO authController.ts (Backend)

   async listarTodos(req: Request, res: Response): Promise<Response> {
  try {
    const usuarios = await this.auth.obterTodosUsuarios();
    return res.status(200).json(usuarios);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao buscar usuários do sistema.' });
  }
}

async listarUsuariosContrato(req: Request, res: Response): Promise<Response> {
  try {
    // 1. Pega o parâmetro (que vem como string, ex: "1")
    const { id: contratoId } = req.params; // ou { id: contratoId } conforme alinhou na sua rota

    console.log(`🔍 [Controller] ID do contrato recebido (String): "${contratoId}"`);

    if (!contratoId) {
      return res.status(400).json({ erro: 'O parâmetro contratoId é obrigatório.' });
    }

    // 2. 💡 A CORREÇÃO: Converte explicitamente para número antes de ir para o Banco/Service
    const contratoIdNumerico = Number(contratoId);

    // 3. Passa o ID já tipado como número para a rota do banco
    const usuarios = await this.auth.obterUsuariosContrato(contratoIdNumerico);
    
    return res.status(200).json(usuarios);
  } catch (error: any) {
    console.error('❌ Erro no método listarUsuariosContrato:', error.message);
    return res.status(500).json({ erro: 'Erro ao buscar usuários do sistema.' });
  }
}

async inativarAtivarUsuario(req: Request, res: Response): Promise<Response> {
  try {
    const { metadata, contextoUsuario } = req.body;

    if (!contextoUsuario || !metadata) {
      return res.status(400).json({ erro: "Payload mal estruturado ou ausente." });
    }

    // RECONSTRUÇÃO DO PAYLOAD: Criamos o objeto com a estrutura 'js' idêntica à que a Service espera
    const payloadParaAFila = {
      js: {
        metadata,
        contextoUsuario
      }
    };

    // CORREÇÃO CRÍTICA: Passamos o payload estruturado com o 'js' para a sua Service
    await this.auth.enviarDadosInativarAtivarUsuarios(payloadParaAFila);

    return res.status(200).json({ 
      sucesso: true, 
      mensagem: 'Solicitação de alteração de status enviada para a fila com sucesso.' 
    });

  } catch (error: any) {
    console.error('❌ Erro no método inativarAtivarUsuario:', error.message);
    return res.status(500).json({ erro: 'Erro interno ao processar alteração de status.' });
  }
}

   async listarTodosContratosUsuario(req: Request, res: Response): Promise<Response> {
  try {

     const { id: usuarioId } = req.params;

    const usuarios = await this.auth.obterTodosContratosUsuarios(usuarioId);

    return res.status(200).json(usuarios);
  } catch (error: any) {
    return res.status(500).json({ erro: 'Erro ao buscar usuários do sistema.' });
  }
}

async authValida(req: Request, res: Response) {
  try {
    // Chama o seu Service (que retorna { token, usuario })
    const dadosAutenticados = await this.auth.validarLogin(req.body);
    
    console.log("🔑 [Controller] Login aceito. Despachando token estruturado...");

    // A CORREÇÃO CRÍTICA: Use o '...' para espalhar o token e o usuário na raiz do JSON!
    return res.status(200).json({
      sucesso: true,
      ...dadosAutenticados // sso garante que o token vire resposta.data.token direto no React
    });

  } catch (error: any) {
    if (error.message === 'Usuário ou senha incorretos.') {
      return res.status(401).json({ erro: error.message });
    }
    return res.status(500).json({ erro: 'Erro interno na validação de acesso.' });
  }
}

async authValidaUsuario(req: Request, res: Response) {
  try {
    // Chama o seu Service (que retorna { token, usuario })
    const dadosAutenticados = await this.auth.validarLoginUsuario(req.body);
    
    console.log("🔑 [Controller] Login aceito. Despachando token estruturado...");

    // A CORREÇÃO CRÍTICA: Use o '...' para espalhar o token e o usuário na raiz do JSON!
    return res.status(200).json({
      sucesso: true,
      ...dadosAutenticados // Isso garante que o token vire resposta.data.token direto no React
    });

  } catch (error: any) {
    if (error.message === 'Usuário ou senha incorretos.') {
      return res.status(401).json({ erro: error.message });
    }
    return res.status(500).json({ erro: 'Erro interno na validação de acesso.' });
  }
}

 async registrarPrimeiroAcesso(req: Request, res: Response): Promise<Response> {
    try {

      const { usuarioId, nome, usuario, email, senha, protocolo = new Date().toISOString().split('T')[0], acao = 'inserir', perfil, tipoAcao } = req.body;

      const acaoFinal = tipoAcao === 'atualizarUsuario' ? 'atualizar' : acao;

      console.log("👉 ESTRUTURA DO BODY:", JSON.stringify(req.body, null, 2));

      if (!nome || !usuario || !email || !senha ) {
        return res.status(400).json({ erro: 'Todos os campos cadastrais são obrigatórios.' });
      }

      // Invoca o serviço para processar a criação
      const resultado = await this.auth.criarPrimeiraConta({usuarioId ,nome, usuario, email, senha, protocolo, acaoFinal, perfil, tipoAcao});
      
      return res.status(200).json(resultado);
    } catch (error: any) {
      // Captura erros de duplicidade disparados pelo Service
      if (error.message === 'Este usuário ou e-mail já está sendo utilizado.') {
        return res.status(409).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
    }
  }

   async vincularContrato(req: Request, res: Response): Promise<Response> {
    try {
      const { contratoId, tipoAcao, usuarioId, protocolo = new Date().toISOString().split('T')[0], acao = 'inserir'} = req.body;

      if (!contratoId || !tipoAcao || !usuarioId || !protocolo || !acao ) {
        return res.status(400).json({ erro: 'Todos os campos cadastrais são obrigatórios.' });
      }

      // Invoca o serviço para processar a criação
      const resultado = await this.auth.vincularContratoUsuario({contratoId, tipoAcao, usuarioId, acao});
      
      return res.status(200).json(resultado);
    } catch (error: any) {
      // Captura erros de duplicidade disparados pelo Service
      if (error.message === 'Este usuário ou e-mail já está sendo utilizado.') {
        return res.status(409).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno ao processar o cadastro.' });
    }
  }

}



