import jwt from 'jsonwebtoken';
import { RabbitMqPublisher } from '../queue/publisher';
import { authRepository } from '../repositories/authRepository';
import bcrypt from 'bcrypt';

const MAPA_DE_ACOES: Record<string, { tipoArquivo: "inserir" | "consultar" | "atualizar" | "excluir"; routingKey: string }> = {
  inserir:   { tipoArquivo: 'inserir',   routingKey: 'reports.v1.trigger.criar-usuario' },
  consultar: { tipoArquivo: 'consultar', routingKey: 'reports.v1.trigger.consulta_contrato' },
  atualizar: { tipoArquivo: 'atualizar', routingKey: 'reports.v1.trigger.atualiza-usuario' },
  excluir:   { tipoArquivo: 'excluir',   routingKey: 'reports.v1.trigger.exclui_usuario' }
};

const JWT_SECRET = 'SuaChaveSecretaSuperProtegida123';

export class authServices {
  // Injeção do repositório no construtor mantida perfeitamente
  constructor(private authRepository: authRepository, private rabbitPublisher: RabbitMqPublisher) {}

  // CORREÇÃO 1: Tipo de retorno ajustado para um objeto comum contendo o token e o operador
  async validarLogin(dadosLogin: any): Promise<{ token: string; usuario: any }> {
  try {
    const { usuario, senha } = dadosLogin;

    // Busca as credenciais cadastradas no banco (Agora retorna um Array devido ao db.all)
    const auth = await this.authRepository.auth(usuario);

    // CORREÇÃO 1: Valida se o array existe e possui pelo menos um registo
    if (!auth || !Array.isArray(auth) || auth.length === 0) {
      throw new Error('Usuário ou senha incorretos.'); 
    }

    // CORREÇÃO 2: Extrai os dados base e o hash da senha da primeira linha [0]
    const primeiroRegistro = auth[0];

    if (!primeiroRegistro.senha) {
      throw new Error('Usuário ou senha incorretos.');
    }

    // Validação segura com o bcrypt usando o hash correto
    const senhaCorreta = await bcrypt.compare(senha, primeiroRegistro.senha);

    if (!senhaCorreta) {
       throw new Error('Usuário ou senha incorretos.');
    }

    // GERAÇÃO DO TOKEN JWT (Usa os dados do utilizador da primeira posição)
    const token = jwt.sign(
      { id: primeiroRegistro.id, usuario: primeiroRegistro.usuario }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    console.log(`🔑 [Autenticação] Token JWT gerado com sucesso para: ${usuario}`);
    
    // CORREÇÃO 3: Agrupa todos os contratos do array de linhas para enviar ao Frontend
    const listaContratos = auth
      .filter((linha: any) => linha.contratoId) // Remove linhas nulas se houver
      .map((linha: any) => ({
        id: linha.contratoId,
        numero: linha.contratoNumero
      }));

    // Retorna os dados limpos processados contendo o array 'contratos'
    return {
      token,
      usuario: { 
        id: primeiroRegistro.id, 
        nome: primeiroRegistro.nome, 
        perfil: primeiroRegistro.perfil,
        ativo: primeiroRegistro.ativo,
        contratos: listaContratos // 🚀 Enviado como array! O frontend vai abrir a listagem automaticamente
      }
    };

  } catch (error: any) {
    console.error('❌ Erro no processamento do login no Service:', error.message);
    throw error;
  }
}

  async validarLoginUsuario(dadosLogin: any): Promise<{ token: string; usuario: any }> {
    // CORREÇÃO 2: Adicionado a abertura do bloco try
    try {

      // Busca as credenciais cadastradas no banco
      const auth = await this.authRepository.validacaoUsuario(dadosLogin.identificador);

      // CORREÇÃO 3: Lança um erro controlado em vez de tentar usar o 'res.status' do Express
      if (!auth) {
        throw new Error('Usuário ou senha incorretos.');
      }

      return  auth;

    } catch (error: any) {
      console.error('❌ Erro no processamento do login no Service:', error.message);
      throw error; // Repassa o erro para o Controller capturar no catch dele
    }
  }

  async criarPrimeiraConta(dadosCadastro: any): Promise<{ sucesso: boolean }> {
    try {
      const { usuarioId, nome, usuario, email, senha, protocolo = new Date().toISOString().split('T')[0], acaoFinal , perfil, tipoAcao } = dadosCadastro;

      const senhaCriptografada = await bcrypt.hash(senha.trim(), 10);
      const perfilTratado = String(perfil || 'atendimento').toLowerCase().trim();

      // Regra de Negócio: Verifica se o login já existe chamando o repositório
      const usuarioExistente = await this.authRepository.buscarPorUsuarioOuEmail(
        usuario.toLowerCase().trim(), 
        email.toLowerCase().trim()
      );

      if (usuarioExistente && acaoFinal !== 'atualizar' && acaoFinal !== 'excluir') {
        throw new Error('Este usuário ou e-mail já está sendo utilizado.');
      }

      // 3. Recupera a estratégia com base na ação enviada ou usa o 'consultar' como padrão
      const estrategiaAtual = MAPA_DE_ACOES[dadosCadastro.acaoFinal] ?? {
      tipoArquivo: 'consultar',
      routingKey: 'reports.v1.trigger.consulta_contrato'
      };

      // 4. Monta o payload injetando os dados legítimos que vieram das tabelas do banco
      const payloadParaAFila = {
        js: {
          metadata: {
            protocolo, // Seu Worker lê essa data para controle
            acaoFinal, // Seu Worker lê isso para saber se roda INSERT ou UPDATE
            tipoAcao
          },
          contextoUsuario: {
            usuarioId,
            nome,
            usuario: usuario.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            senha: senhaCriptografada,
            perfil: perfilTratado
          }
        }
      };

      const EXCHANGE = 'reports.exchange';
      const ROUTING_KEY = estrategiaAtual.routingKey;

      console.log(`[Agendador] Montando payload para o protocolo: ${protocolo} | Fila: ${ROUTING_KEY}`);

      // 5. Envia para o RabbitMQ em segundo plano
      await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payloadParaAFila);

      // C) RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
      // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
      return { 
      sucesso: true, 
      protocolo, 
      ...dadosCadastro // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
      };
      
      } catch (error: any) {
      console.error('❌ Erro no Service de primeiro acesso:', error.message);
      throw error;
      }
  }

  async vincularContratoUsuario(dadosVinculo: any): Promise<{ sucesso: boolean }> {
    try {
      const { contratoId, usuarioId, tipoAcao, protocolo = new Date().toISOString().split('T')[0], acao = 'inserir' } = dadosVinculo;

      // Regra de Negócio: Verifica se o login já existe chamando o repositório
      const vinculoExistente = await this.authRepository.buscarPorContratoVinculadoUsuario(
        contratoId, 
        usuarioId
      );

      if (vinculoExistente) {
        throw new Error('Este usuário ja tem o contratro vinculado.');
      }

      // 3. Recupera a estratégia com base na ação enviada ou usa o 'consultar' como padrão
      const estrategiaAtual = MAPA_DE_ACOES[dadosVinculo.acao] ?? {
      tipoArquivo: 'consultar',
      routingKey: 'reports.v1.trigger.consulta_contrato'
      };

      // 4. Monta o payload injetando os dados legítimos que vieram das tabelas do banco
      const payloadParaAFila = {
        js: {
          metadata: {
            protocolo, // Seu Worker lê essa data para controle
            acao,      // Seu Worker lê isso para saber se roda INSERT ou UPDATE
          },
          contextoUsuario: {
            contratoId,
            usuarioId,
            tipoAcao
          }
        }
      };

      const EXCHANGE = 'reports.exchange';
      const ROUTING_KEY = estrategiaAtual.routingKey;

      console.log(`[Agendador] Montando payload para o protocolo: ${protocolo} | Fila: ${ROUTING_KEY}`);

      // 5. Envia para o RabbitMQ em segundo plano
      await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payloadParaAFila);

      // C) RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
      // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
      return { 
      sucesso: true, 
      protocolo, 
      ...dadosVinculo // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
      };
      
      } catch (error: any) {
      console.error('❌ Erro no Service de primeiro acesso:', error.message);
      throw error;
      }
    }

async enviarDadosInativarAtivarUsuarios(dadosVinculo: any): Promise<{ sucesso: boolean }> {
  try {

    const { metadata, contextoUsuario } = dadosVinculo.js || {};

    // 💡 CORREÇÃO 1: Os parâmetros já chegam separados! Validamos a existência direta deles
    if (!contextoUsuario || !metadata) {
      throw new Error("Parâmetros da mensagem inválidos ou mal estruturados.");
    }

    const conteudoInterno = {
      metadata,
      contextoUsuario: {
        usuarioId: contextoUsuario.idUsuario || contextoUsuario.usuarioId,
        tipoAcao: contextoUsuario.tipoAcao,
        novoStatus: contextoUsuario.status !== undefined ? contextoUsuario.status : contextoUsuario.novoStatus
      }
    };

        const payloadFormatadoParaAQueue = {
      js: JSON.stringify(conteudoInterno) // 🚀 Transforma o objeto interno em string!
    };

    // 🚀 Agora todos os campos carregarão os valores reais com sucesso!
    console.log("🚀 [Fila] Despachando payload stringificado para o Worker de PDF...");

      // 3. Recupera a estratégia com base na ação enviada ou usa o 'consultar' como padrão
      const estrategiaAtual = MAPA_DE_ACOES[metadata.acao] ?? {
      tipoArquivo: 'consultar',
      routingKey: 'reports.v1.trigger.consulta_contrato'
      };


      const EXCHANGE = 'reports.exchange';
      const ROUTING_KEY = estrategiaAtual.routingKey;

      console.log(`[Agendador] Montando payload para o protocolo: | Fila: ${ROUTING_KEY}`);

      // 5. Envia para o RabbitMQ em segundo plano
      await this.rabbitPublisher.publishEvent(EXCHANGE, ROUTING_KEY, payloadFormatadoParaAQueue);

      // C) RETORNO COMPLETO: Devolve os dados do banco junto com o protocolo.
      // O seu Axios no React vai ler isso e preencher o cabeçalho e a aba detalhes na hora!
      return { 
      sucesso: true, 
      ...contextoUsuario // Mescla as colunas (id, start_date, gastos, limiteMeta) na resposta JSON
      };
      
      } catch (error: any) {
      console.error('❌ Erro no Service de primeiro acesso:', error.message);
      throw error;
      }
    }

      async obterTodosUsuarios(): Promise<any[]> {
      return await this.authRepository.listarUsuariosGerais();
    }

      async obterUsuariosContrato(contratoId: any): Promise<any[]> {
      return await this.authRepository.listarUsuariosContrato(contratoId);
    }

      async obterTodosContratosUsuarios(usuarioId: any): Promise<any[]> {
      return await this.authRepository.listarContratosUsuario(usuarioId);
    }

}
