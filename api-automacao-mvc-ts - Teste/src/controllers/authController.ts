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

      // 2. Gera o Token MFA
      const { usuarioId = dadosAutenticados?.id, email = dadosAutenticados?.email, nome = dadosAutenticados?.nome, codigoMFA = Math.floor(100000 + Math.random() * 900000).toString(), tempoExpiracao = new Date(Date.now() + 15 * 60 * 1000).toISOString() } = req.body;

      const resultadoMFA = await this.auth.enviaCodigoMFA({usuarioId, email, nome, criadoEm: new Date().toISOString().split('T')[0], codigoMFA, tempoExpiracao, acaoFinal:'inserirMFA', tipoAcao: 'MFA'});

      if (!dadosAutenticados && !resultadoMFA){
       console.log("Erro ao recuperar usuario ou envio de MFA")
      }

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
      const { contratoId, tipoAcao='exluirContratoUsuario', usuarioId, protocolo = new Date().toISOString().split('T')[0], acao = 'inserir'} = req.body;

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

async deletarVinculoContratoUsuario(req: Request, res: Response): Promise<Response> {
  try {
    // 1. CORREÇÃO CRÍTICA: Coleta os IDs dos parâmetros da URL (req.params) em vez do req.body
    const { usuarioId, contratoId } = req.params;

    // Coleta as outras opções do corpo ou define valores padrão padrão para auditoria
    const { 
      tipoAcao = 'excluirContratoUsuario', 
      protocolo = new Date().toISOString().split('T')[0], 
      acao = 'excluir' 
    } = req.body || {}; 

    // 2. Validação dos campos obrigatórios que vieram da URL
    if (!contratoId || !usuarioId) {
      return res.status(400).json({ erro: 'O ID do usuário e o ID do contrato são obrigatórios na URL.' });
    }

    // 3. Invoca o serviço para processar a revogação/exclusão do vínculo
    // Convertemos para Number() caso o seu Service ou Repository exijam números e não strings
    const resultado = await this.auth.ExcluirVinculoContratoUsuario({
      contratoId: Number(contratoId), 
      tipoAcao, 
      usuarioId: Number(usuarioId), 
      acao
    });
    
    // Retorna sucesso 200 com o objeto de resultado ({ sucesso: true })
    return res.status(200).json(resultado);

  } catch (error: any) {
    console.error("Erro na controller ao deletar vínculo:", error);

    // 4. CORREÇÃO DE UX: Se o Service lançar um erro específico (ex: "Vínculo não encontrado"),
    // devolvemos a mensagem real com status 400 ou 404 em vez de um erro 500 genérico.
    if (error.message) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(500).json({ erro: 'Erro interno ao processar a exclusão do vínculo.' });
  }
  }

async atualizarUsuario(req: Request, res: Response): Promise<Response> {
  try {
    // 1. CORREÇÃO CRÍTICA: Coleta os IDs dos parâmetros da URL (req.params) em vez do req.body
    const { id } = req.params; // Coleta o ID da URL
    const { nome, email, perfil } = req.body; // Coleta os dados editados do body

      if (!id || !nome || !email || !perfil) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    // Coleta as outras opções do corpo ou define valores padrão padrão para auditoria
    const { 
      tipoAcao = 'atualizaDadosUsuario', 
      protocolo = new Date().toISOString().split('T')[0], 
      acao = 'atualizar' 
    } = req.body || {}; 

    // 3. Invoca o serviço para processar a revogação/exclusão do vínculo
    // Convertemos para Number() caso o seu Service ou Repository exijam números e não strings
    const resultado = await this.auth.atualizaUsuario({
      tipoAcao: 'atualizarDadosUsuario', 
      nome,
      email,
      perfil,
      usuarioId: Number(id), 
      acao
    });
    
    // Retorna sucesso 200 com o objeto de resultado ({ sucesso: true })
    return res.status(200).json(resultado);

  } catch (error: any) {
    console.error("Erro na controller ao deletar vínculo:", error);

    // 4. CORREÇÃO DE UX: Se o Service lançar um erro específico (ex: "Vínculo não encontrado"),
    // devolvemos a mensagem real com status 400 ou 404 em vez de um erro 500 genérico.
    if (error.message) {
      return res.status(400).json({ erro: error.message });
    }

    return res.status(500).json({ erro: 'Erro interno ao processar a exclusão do vínculo.' });
  }
  }

async confirmaMFAUsuario(req: Request, res: Response): Promise<Response> {
  try {

    const { identificador, codigo} = req.body;

    const usuarioNome = await this.auth.obterMFAUsuario(identificador, codigo);

    console.log('usuario', usuarioNome)

    return res.status(200).json(usuarioNome);
  } catch (error: any) {
    //return res.status(500).json({ erro: 'Erro ao buscar usuários do sistema.' });

      return res.status(400).json({ 
      sucesso: false, 
      mensagem: error.message || "Falha ao validar o código." 
    });
  }
  }

}



