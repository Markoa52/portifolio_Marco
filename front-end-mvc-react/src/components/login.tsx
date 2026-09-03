import React, { useState } from 'react';
import { Landmark, User, Lock, LogIn, UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify'; // 💡 Importe o toast

// interface ILoginProps {
//   onLoginSucesso: (dadosUsuario: any) => void;
// }

interface TelaLoginProps {
  onLoginSucesso: (dadosUsuario: any) => void;
  setPaginaAtiva: (pagina: string) => void;
  setIdContratoSelecionado: (id: number | null) => void;
  setContratosDoUsuario?: (contratos: any) => void; // Caso use o estado de múltiplos contratos
}

export const TelaLogin: React.FC<TelaLoginProps> = ({ onLoginSucesso }) => {
  // 💡 ESTADO MÁGICO: Controla se exibe a tela de 'login' ou de 'cadastro' (Primeiro Acesso)
  const [modoView, setModoView] = useState<'login' | 'cadastro' | 'dashboardGeral' | 'telaDoContrato' | 'selecionarContrato' | 'semVinculo'>('login');
  const [contratosDoUsuario] = useState<any[]>([]);
  
  const [etapaPrimeiroAcesso, setEtapaPrimeiroAcesso] = useState(1); // 1: Validar dados, 2: Definir nova senha

  const [identificador, setIdentificador] = useState(''); // Pode ser e-mail ou utilizador

  // Função para a Etapa 1: Validar se o utilizador existe e tem direito ao primeiro acesso
  // Alteração no bloco catch: troque (err) por (err: any)
  const handleValidarUsuario = async (e: React.FormEvent) => {
  e.preventDefault();
  setCarregando(true);
  setErro(null);

  try {
    const resposta = await fetch('http://localhost:3000/api/auth/validarUsuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador: identificador.trim().toLowerCase() })
    });

    const dados = await resposta.json();
    console.log("📡 [Axios] resposta", dados);

    if (!resposta.ok) {
      throw new Error(dados.message || 'Utilizador ou E-mail não encontrado.');
    }

    setUsuarioId(dados.id || '');
    setNome(dados.nome || '');
    setUsuario(dados.usuario || '');
    setEmail(dados.email || '');
    
    setEtapaPrimeiroAcesso(2);
    } catch (err: any) { // CORREÇÃO AQUI: Força o tipo para 'any'
      setErro(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setCarregando(false);
    }
   };

   // Estados dos Inputs
   const [usuarioId, setUsuarioId] = useState();
   const [nome, setNome] = useState('');
   const [usuario, setUsuario] = useState('');
   const [email, setEmail] = useState('');
   const [senha, setSenha] = useState('');
   const [confirmarSenha, setConfirmarSenha] = useState('');

   const [carregando, setCarregando] = useState(false);
   const [erro, setErro] = useState<string | null>(null);
   const [sucesso, setSucesso] = useState<string | null>(null);

   // 1. Processa a Autenticação Tradicional
   const handleDispararLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setCarregando(true);
     setErro(null);

     try {

     console.log("📡 [Axios] Enviando credenciais para o Express...");
    
     const resposta = await axios.post('http://localhost:3000/api/auth/login', {
      usuario: usuario.trim(),
      senha: senha.trim()
     });

      // ESPIONAR A RESPOSTA: Abra o F12 no navegador para ver o que veio da API
      console.log("📥 [Axios] Resposta completa do Backend recebida:", resposta.data);

      const statusAtivo = resposta.data.usuario?.ativo;
      
      if (Number(statusAtivo) !== 1) {
        const mensagemErro = resposta.data.message || resposta.data.erro || 'Usuário inativo.';
        toast.error(`⚠️ ${mensagemErro}`);
        
        setCarregando(false);
        return; 
      }

      if (resposta.data && resposta.data.token) {
      // Salva o token bruto no LocalStorage
      localStorage.setItem('@TollManagement:token', resposta.data.token);
      const dadosDoOperador = resposta.data.usuario || resposta.data.user;
      localStorage.setItem('@TollManagement:user', JSON.stringify(dadosDoOperador));

      toast.success(`Olá ${dadosDoOperador.nome}, bem-vindo de volta!`);

      onLoginSucesso(dadosDoOperador);

      console.log("🚀 [Sucesso] Redirecionando operador para a tela de Atendimento...");

      // O GATILHO: Dispara a função que veio do App.tsx para girar a chave do estado e mudar a tela!
      if (typeof onLoginSucesso === 'function') {
        onLoginSucesso(dadosDoOperador);
      } else {
        console.error("❌ Erro Crítico: A propriedade 'onLoginSucesso' não foi repassada corretamente para a TelaLogin.");
      }
     } else {
      setErro("O servidor respondeu com sucesso, mas não gerou um token válido.");
     }
     } catch (err: any) {
      // IMPRIME O ERRO REAL DO BACKEND:
      console.error('❌ Falha na autenticação frontend:', err);
      console.log('🔍 Resposta de erro do servidor:', err.response?.data);
      
      // Define o erro para exibir na tela do utilizador
      setErro(err.response?.data?.erro || err.response?.data?.message || 'Erro ao autenticar.');
      } finally {
      setCarregando(false);
      }
     };

      // 2. Processa a Criação da Primeira Conta
      const handleDispararCadastro = async (e: any) => {
      e.preventDefault();
      if (senha !== confirmarSenha) {
        setErro('As senhas digitadas não coincidem.');
        return;
      }
  
      try {
        setCarregando(true);
        setErro(null);
        setSucesso(null);

      const resposta = await axios.post('http://localhost:3000/api/auth/primeiro-acesso', {
        usuarioId: Number(usuarioId),
        nome: nome.trim(),
        usuario: usuario.trim(),
        email: email.trim(),
        senha: senha.trim(),
        tipoAcao: 'atualizarUsuario'
      });

      if (resposta.data?.sucesso) {
        setSucesso('Conta criada com sucesso! Digite suas credenciais para acessar.');
        // Limpa os dados de cadastro e retorna automaticamente para a tela de login
        setModoView('login');
        setSenha('');
        setConfirmarSenha('');
      }
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Falha ao registrar primeiro acesso.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-3">
      <div className="card border-0 shadow-sm bg-white rounded-3 p-4 text-start" style={{ maxWidth: '400px', width: '100%' }}>
        
        {/* Identidade Visual Central */}
        <div className="text-center mb-3.5">
          <div className="bg-primary bg-opacity-10 p-2.5 rounded-circle d-inline-flex align-items-center justify-content-center text-primary mb-2">
            <Landmark size={26} />
          </div>
          <h2 className="fs-5 fw-bold text-dark m-0">TollManagement</h2>
          <small className="text-muted d-block mt-0.5">
            {modoView === 'login' 
              ? 'Acesse o ecossistema de vale-pedágio' 
              : etapaPrimeiroAcesso === 1 
                ? 'Identifique o seu operador' 
                : 'Crie suas credenciais de acesso'}
          </small>
        </div>

        {erro && <div className="alert alert-danger p-2.5 small rounded-3 mb-3">{erro}</div>}
        {sucesso && <div className="alert alert-success p-2.5 small rounded-3 mb-3">{sucesso}</div>}

        {/* ... código anterior do seu card, identidade visual e erros ... */}

        {modoView === 'login' ? (
          <form onSubmit={handleDispararLogin}>
            {/* Seu formulário de login atual */}
          </form>
        ) : modoView === 'cadastro' ? (
          /* Seu formulário de primeiro acesso atual */
          <form onSubmit={handleDispararCadastro}>
            {/* ... */}
          </form>
        ) : modoView === 'selecionarContrato' ? (

          /* --------------------------------------------------------------------
             NOVA TELA: SELEÇÃO DE MÚLTIPLOS CONTRATOS
             -------------------------------------------------------------------- */
          <div>
            <h3 className="fs-6 fw-bold text-dark mb-3">Selecione o Contrato</h3>
            <p className="text-muted small mb-3">O seu utilizador está associado a mais do que um contrato. Escolha qual deseja operar:</p>
            
            <div className="d-grid gap-2 mb-3">
              {contratosDoUsuario.map((contrato) => (
                <button 
                  key={contrato.id} 
                  type="button" 
                  onClick={() => {
                    console.log("Contrato selecionado:", contrato.id);
                    setModoView('telaDoContrato');
                  }}
                  className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 fw-semibold small"
                >
                  <span>📄 {contrato.numero || `Contrato #${contrato.id}`}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
        
            <button type="button" onClick={() => setModoView('login')} className="btn btn-link text-decoration-none small text-secondary w-100 p-0 text-center">
              Sair / Voltar
            </button>
          </div>
        ) : modoView === 'semVinculo' ? (

          /* --------------------------------------------------------------------
             NOVA TELA: AVISO DE FALTA DE VÍNCULO
             -------------------------------------------------------------------- */
          <div className="text-center py-2">
            <div className="text-warning mb-2">⚠️</div>
            <h3 className="fs-6 fw-bold text-dark mb-1">Nenhum Contrato Vinculado</h3>
            <p className="text-muted small mb-3.5">O seu utilizador foi criado, mas ainda não possui contratos associados. Contacte o administrador.</p>
            <button type="button" onClick={() => setModoView('login')} className="btn btn-secondary btn-sm w-100 fw-semibold">
              Voltar para o Login
            </button>
          </div>
           ) : (

          /* --------------------------------------------------------------------
             TELAS PRINCIPAIS: DASHBOARD GERAL OU TELA DO CONTRATO
             -------------------------------------------------------------------- */
          <div className="text-center py-3">
            <h3 className="fs-5 fw-bold text-success mb-2">🎉 Acesso Concedido!</h3>
            <p className="text-muted small">
              {modoView === 'dashboardGeral' ? 'A carregar o Painel de Administrador...' : 'A carregar a Área do Contrato...'}
            </p>
          </div>
          )}

         {/* ====================================================================
            VISTA A: FORMULÁRIO DE LOGIN
            ==================================================================== */}
         {modoView === 'login' ? (
          <form onSubmit={handleDispararLogin}>
            <div className="mb-3">
              <label className="text-muted small fw-semibold mb-1">Usuário Operador</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><User size={16} /></span>
                <input type="text" required value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ex: admin" className="form-control text-start" />
              </div>
            </div>

            <div className="mb-3.5">
              <label className="text-muted small fw-semibold mb-1">Senha</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><Lock size={16} /></span>
                <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control text-start" />
              </div>
            </div>

            <button type="submit" disabled={carregando} className="btn btn-primary btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-2">
              {carregando ? 'Autenticando...' : <><LogIn size={16} /> Entrar no Sistema</>}
            </button>

            {/* Link de alternância para Primeiro Acesso */}
            <div className="text-center mt-3 border-top pt-2.5">
              <button type="button" onClick={() => { setModoView('cadastro'); setEtapaPrimeiroAcesso(1); setErro(null); }} className="btn btn-link text-decoration-none small fw-semibold text-primary p-0">
                🚀 É seu primeiro acesso? Cadastre-se aqui
              </button>
            </div>
          </form>
        ) : (

          /* ====================================================================
             VISTA B: FORMULÁRIO DE PRIMEIRO ACESSO (FLUXO EM 2 ETAPAS)
             ==================================================================== */
             etapaPrimeiroAcesso === 1 ? (
            /* --------------------------------------------------------------------
               ETAPA 1: Identificação do Operador (Email ou Usuário)
               -------------------------------------------------------------------- */
             <form onSubmit={handleValidarUsuario}>
              <div className="mb-3.5">
                <label className="text-muted small fw-semibold mb-1">E-mail Corporativo ou Usuário</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted"><User size={16} /></span>
                  <input 
                    type="text" 
                    required 
                    value={identificador} 
                    onChange={(e) => setIdentificador(e.target.value)} 
                    placeholder="Ex: joao.silva ou nome@empresa.com" 
                    className="form-control text-start" 
                  />
                </div>
                <div className="form-text small text-muted mt-1">
                  Insira os dados cadastrados pelo administrador para iniciar.
                </div>
              </div>

              <button type="submit" disabled={carregando} className="btn btn-primary btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-2">
                {carregando ? 'Validando...' : <><ArrowRight size={16} /> Avançar</>}
              </button>

              <div className="text-center mt-3 border-top pt-2.5">
                <button type="button" onClick={() => { setModoView('login'); setErro(null); }} className="btn btn-link text-decoration-none small fw-semibold text-secondary p-0 d-inline-flex align-items-center gap-1">
                  <ArrowLeft size={14} /> Voltar para o Login
                </button>
              </div>
            </form>
            ) : (
            /* --------------------------------------------------------------------
               ETAPA 2: Confirmação de Dados Obtidos e Registro da Senha
               -------------------------------------------------------------------- */
            <form onSubmit={handleDispararCadastro}>
              <div className="mb-2.5">
                <label className="text-muted small fw-semibold mb-1">Nome Completo</label>
                <input type="text" disabled value={nome} className="form-control text-start bg-light text-secondary" />
              </div>

              <div className="mb-2.5">
                <label className="text-muted small fw-semibold mb-1">Usuário de Login</label>
                <input type="text" disabled value={usuario} className="form-control text-start bg-light text-secondary" />
              </div>

              <div className="mb-2.5">
                <label className="text-muted small fw-semibold mb-1">E-mail Corporativo</label>
                <input type="email" disabled value={email} className="form-control text-start bg-light text-secondary" />
              </div>

              <div className="row g-2 mb-3.5">
                <div className="col-6">
                  <label className="text-muted small fw-semibold mb-1">Nova Senha</label>
                  <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control text-start" />
                </div>
                <div className="col-6">
                  <label className="text-muted small fw-semibold mb-1">Confirme</label>
                  <input type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="******" className="form-control text-start" />
                </div>
              </div>

              <button type="submit" disabled={carregando} className="btn btn-success btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-2">
                {carregando ? 'Gravando...' : <><UserPlus size={16} /> Concluir Cadastro</>}
              </button>

              <div className="text-center mt-3 border-top pt-2.5">
                <button type="button" onClick={() => { setEtapaPrimeiroAcesso(1); setErro(null); }} className="btn btn-link text-decoration-none small fw-semibold text-secondary p-0 d-inline-flex align-items-center gap-1">
                  <ArrowLeft size={14} /> Voltar Etapa
                </button>
              </div>
            </form>
          )
        )}

      </div>
    </div>
  );

};
