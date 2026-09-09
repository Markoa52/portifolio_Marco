import React, { useState } from 'react';
import { Landmark, User, Lock, LogIn, UserPlus, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
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
  // ESTADO MÁGICO: Controla se exibe a tela de 'login' ou de 'cadastro' (Primeiro Acesso)
  const [modoView, setModoView] = useState<'login' | 'cadastro' | 'dashboardGeral' | 'telaDoContrato' | 'selecionarContrato' | 'semVinculo'>('login');
  const [contratosDoUsuario] = useState<any[]>([]);

  const [codigoMFA, setCodigoMFA] = useState<string>('');
  
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
      
          // O tipoAcao vai como 'solicitarMFA' ou a ação equivalente que dispara o e-mail no seu backend
          const resposta = await axios.post('http://localhost:3000/api/auth/primeiro-acesso', {
            usuarioId: Number(usuarioId),
            nome: nome.trim(),
            usuario: usuario.trim(),
            email: email.trim(),
            senha: senha.trim(),
            tipoAcao: 'atualizarUsuario',
            codigoMFA: "",
            tempoExpiracao: "",

          });
      
          if (resposta.data?.sucesso) {
            // 1. Define a mensagem de sucesso focada no e-mail recebido
            setSucesso('🚀 Código de segurança enviado! Verifique o seu e-mail corporativo.');
            
            // 2. Limpa APENAS os campos de senha por segurança (opcional, mas não limpe o usuário/email)
            // setSenha(''); 
            // setConfirmarSenha('');
      
            // 3. Altera a etapa para o MFA e trava o ecrã aqui
            setEtapaPrimeiroAcesso(3); 
            setModoView('login');
          }
        } catch (err: any) {
          setErro(err.response?.data?.erro || 'Falha ao registrar primeiro acesso.');
        } finally {
          setCarregando(false);
        }
      };

      const handleReenviarCodigoMFA = async () => {
      try {
        setCarregando(true);
        setErro(null);
        setSucesso(null);
    
        // Substitua a URL abaixo pela rota correta do seu backend
        const resposta = await fetch('/api/autenticacao/mfa/reenviar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Envia o identificador (email/usuário) ou o ID do usuário para saber para quem reenviar
          body: JSON.stringify({ 
            usuario: usuario, 
            email: email 
          }),
        });
    
        const dados = await resposta.json();
    
        if (!resposta.ok) {
          throw new Error(dados.mensagem || 'Não foi possível reenviar o código.');
        }
    
        // Exibe a mensagem de sucesso no topo do card
        setSucesso('🚀 Um novo código de verificação foi enviado para o seu e-mail!');
        setCodigoMFA(''); // Limpa o campo do código antigo para o utilizador digitar o novo
    
      } catch (err: any) {
        console.error('Erro ao reenviar MFA:', err);
        setErro(err.message || 'Ocorreu um erro ao tentar reenviar o código. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    };
    
    const handleConfirmarCodigoMFA = async (e: React.FormEvent) => {
      e.preventDefault(); // Evita o recarregamento automático da página
    
      // Validação rápida: garante que o utilizador digitou os 6 dígitos
      if (!codigoMFA || codigoMFA.length !== 6) {
        setErro('⚠️ Por favor, insira o código de verificação completo com 6 dígitos.');
        return;
      }
    
      try {
        setCarregando(true);
        setErro(null);
        setSucesso(null);
    
        // Substitua a URL abaixo pela rota correta de validação do seu backend
        const resposta = await fetch('/api/auth/confimarMFA', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Envia os dados necessários para o backend validar o token e salvar a senha definitiva
          body: JSON.stringify({ identificador: identificador.trim().toLowerCase(), codigo: codigoMFA }),
        });
    
        const dados = await resposta.json();
        console.log('dados', dados);
    
        if (!resposta.ok) {
          //throw new Error(dados.mensagem || 'Código de verificação incorreto ou expirado.');
          toast.error(`⚠️ ${dados.mensagem}`); return;
         
        }

            setUsuarioId(dados.id || '');
            setNome(dados.nome || '');
            setUsuario(dados.usuario || '');
            setEmail(dados.email || '');
    
        // Sucesso absoluto: Cadastro concluído com MFA!
        setSucesso('🎉 Conta ativada com sucesso! Redirecionando para o login...');
        setCodigoMFA('');
        toast.success(`Olá ${dados.nome},codigo valiado!`);
    
        // Aguarda 2.5 segundos para o utilizador ler a mensagem de sucesso e volta ao ecrã de login
        setTimeout(() => {
          //setModoView('login');
          setEtapaPrimeiroAcesso(3);
          setSucesso(null);
        }, 2500);
    
      } catch (err: any) {
        console.error('Erro ao confirmar MFA:', err);
        setErro(err.message || 'Ocorreu um erro ao validar o código. Verifique e tente novamente.');
      } finally {
        setCarregando(false);
      }
    };

     return (
     <div className="d-flex align-items-center justify-content-center p-4">
      
      {/* 1. CARD MESTRE COM TAMANHO DINÂMICO AUTOMÁTICO */}
      <div 
        className="border-0 shadow-sm bg-white rounded-3 overflow-hidden text-start" 
        style={{ 
          maxWidth: (modoView === 'login' || (modoView === 'cadastro' && etapaPrimeiroAcesso === 2)) ? '850px' : '400px', 
          width: '100%'
        }}
      >
      
      {/* 2. LOGÓTIPO/IDENTIDADE (Escondido apenas na Etapa 3 do MFA para não quebrar o design) */}
      {etapaPrimeiroAcesso !== 3 && (
        <div className="p-4 pb-0 text-center">
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
      )}

      {/* Alertas Globais de Erro e Sucesso */}
      <div className="px-4 pt-3">
        {erro && <div className="alert alert-danger p-2.5 small rounded-3 mb-0">{erro}</div>}
        {sucesso && <div className="alert alert-success p-2.5 small rounded-3 mb-0">{sucesso}</div>}
      </div>

      {/* ====================================================================
         ECRÃ A: FORMULÁRIO DE LOGIN (SPLIT SCREEN LARGO)
         ==================================================================== */}
      {modoView === 'login' && (
        <form onSubmit={handleDispararLogin} className="w-100 p-4">
          <div className="row g-0 align-items-stretch" style={{ margin: "-1.5rem" }}>
            <div className="col-12 col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-center bg-white">
              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-1.5 d-block">Usuário Operador</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light text-muted border-end-0"><User size={18} /></span>
                  <input type="text" required value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ex: admin" className="form-control text-start border-start-0 fs-6" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-muted small fw-semibold mb-1.5 d-block">Senha</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-light text-muted border-end-0"><Lock size={18} /></span>
                  <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control text-start border-start-0 fs-6" />
                </div>
              </div>
              <button type="submit" disabled={carregando} className="btn btn-primary btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-3 shadow-sm">
                {carregando ? 'Autenticando...' : <><LogIn size={18} /> Entrar no Sistema</>}
              </button>
              <div className="text-center mt-4 border-top pt-3">
                <button type="button" onClick={() => { setModoView('cadastro'); setEtapaPrimeiroAcesso(1); setErro(null); setSucesso(null); }} className="btn btn-link text-decoration-none small fw-semibold text-primary p-0">
                  🚀 É seu primeiro acesso? Cadastre-se aqui
                </button>
              </div>
            </div>
            <div className="col-12 col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center text-center p-4 bg-primary text-white">
              <div style={{ maxWidth: "220px" }}>
                <h2 className="fw-bold mb-2 fs-4">Olá! 👋</h2>
                <p className="opacity-75 small lh-base mb-0">Aceda à plataforma para gerir os seus vales-pedágio, faturas e acompanhar a frota em tempo real.</p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ====================================================================
         ECRÃ B: PRIMEIRO ACESSO - ETAPA 1 (IDENTIFICAÇÃO DO OPERADOR)
         ==================================================================== */}
      {modoView === 'cadastro' && etapaPrimeiroAcesso === 1 && (
        <form onSubmit={handleValidarUsuario} className="w-100 p-4">
          <div className="mb-4">
            <label className="text-muted small fw-semibold mb-1.5 d-block">E-mail Corporativo ou Usuário</label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-light text-muted border-end-0"><User size={18} /></span>
              <input type="text" required value={identificador} onChange={(e) => setIdentificador(e.target.value)} placeholder="Ex: joao.silva ou nome@empresa.com" className="form-control text-start border-start-0 fs-6" />
            </div>
            <div className="form-text small text-muted mt-1.5" style={{ fontSize: '0.75rem' }}>💡 Insira os dados cadastrados pelo administrador para iniciar.</div>
          </div>
          <button type="submit" disabled={carregando} className="btn btn-primary btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-3 shadow-sm">
            {carregando ? 'Validando...' : <><ArrowRight size={18} /> Avançar para a Próxima Etapa</>}
          </button>
          <div className="text-center mt-4 border-top pt-3">
            <button type="button" onClick={() => { setModoView('login'); setErro(null); setSucesso(null); }} className="btn btn-link text-decoration-none small fw-semibold text-secondary p-0 d-inline-flex align-items-center gap-1">
              <ArrowLeft size={14} /> Voltar para o Login
            </button>
          </div>
        </form>
      )}

      {/* ====================================================================
           ECRÃ D: PRIMEIRO ACESSO - ETAPA 3 (VALIDAÇÃO DO MFA LARGO)
           ==================================================================== */}
          {modoView === 'cadastro' && etapaPrimeiroAcesso === 2 && (
            <form onSubmit={handleConfirmarCodigoMFA} className="w-100 p-4">
              <div className="row g-0 align-items-stretch">
                <div className="col-12 col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-center bg-white">
                  <div className="text-center mb-4 d-md-none">
                    <span className="fs-1 d-block mb-2">📩</span>
                    <h3 className="fs-5 fw-bold text-dark mb-1">Verifique o seu e-mail</h3>
    
                  {/* Continuação da Etapa 3: Campos internos da Coluna Esquerda */}
                  <p className="text-muted small">Enviámos um código de segurança de 6 dígitos.</p>
                </div>
    
                <div className="mb-4">
                  <label className="text-muted small fw-semibold mb-2 d-block text-center text-uppercase tracking-wider" style={{ letterSpacing: '0.05em' }}>
                    Código de Verificação
                  </label>
                  <input 
                    type="text" 
                    required 
                    maxLength={6} 
                    value={codigoMFA || ''} 
                    onChange={(e) => setCodigoMFA(e.target.value.replace(/\D/g, ''))} 
                    placeholder="000000" 
                    className="form-control form-control-lg text-center fs-2 fw-bold bg-light" 
                    style={{ letterSpacing: '0.25em', height: '56px' }} 
                  />
                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      disabled={carregando} 
                      onClick={handleReenviarCodigoMFA} 
                      className="btn btn-link text-decoration-none small text-primary fw-semibold p-0"
                    >
                      {carregando ? '⏳ A enviar...' : '🔄 Não recebeu o código? Reenviar'}
                    </button>
                  </div>
                </div>
    
                <button 
                  type="submit" 
                  disabled={carregando || !codigoMFA || codigoMFA.length !== 6} 
                  className="btn btn-success btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-3 shadow-sm"
                >
                  {carregando ? 'A validar...' : <><CheckCircle size={18} /> Validar e Ativar Conta</>}
                </button>
    
                <div className="text-center mt-4 border-top pt-3">
                  <button 
                    type="button" 
                    onClick={() => setEtapaPrimeiroAcesso(1)} 
                    className="btn btn-link text-decoration-none small fw-semibold text-secondary p-0 d-inline-flex align-items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Voltar para alterar senha
                  </button>
                </div>
              </div>
        
              {/* COLUNA DIREITA: INSTRUÇÕES VISUAIS DA ETAPA 3 */}
              <div className="col-12 col-md-5 d-none d-md-flex flex-column justify-content-center align-items-center text-center p-4 bg-primary text-white">
                <div style={{ maxWidth: "220px" }}>
                  <span className="fs-1 d-block mb-3">📩</span>
                  <h2 className="fw-bold mb-2 fs-4">Falta pouco!</h2>
                  <p className="opacity-75 small lh-base mb-0" style={{ fontSize: "0.85rem" }}>
                    Enviámos um código de segurança para o seu e-mail corporativo para garantir a proteção da sua conta.
                  </p>
                </div>
              </div>
        
            </div>
          </form>
        )}

      {/* ====================================================================
         ECRÃ C: PRIMEIRO ACESSO - ETAPA 2 (REGISTO DE SENHA)
         ==================================================================== */}
      {modoView === 'cadastro' && etapaPrimeiroAcesso === 3 && (
        <form onSubmit={handleDispararCadastro} className="w-100 p-4">
          <div className="bg-light p-3 rounded-3 mb-4 border border-light-subtle" style={{ fontSize: '0.85rem' }}>
            <div className="mb-2">
              <span className="text-muted fw-semibold d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Nome Completo</span>
              <span className="text-dark fw-bold">{nome || "---"}</span>
            </div>
            <div className="row g-2 border-top pt-2 mt-2">
              <div className="col-6">
                <span className="text-muted fw-semibold d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Usuário</span>
                <span className="text-secondary font-monospace fw-semibold">{usuario || "---"}</span>
              </div>
              <div className="col-6 text-truncate">
                <span className="text-muted fw-semibold d-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>E-mail</span>
                <span className="text-secondary small">{email || "---"}</span>
              </div>
            </div>
          </div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6">
              <label className="text-muted small fw-semibold mb-1.5 d-block">Nova Senha</label>
              <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control form-control-lg text-start fs-6" />
            </div>
            <div className="col-12 col-sm-6">
              <label className="text-muted small fw-semibold mb-1.5 d-block">Confirme a Senha</label>
              <input type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="******" className="form-control form-control-lg text-start fs-6" />
            </div>
          </div>
          <button type="submit" disabled={carregando} className="btn btn-success btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-3 shadow-sm">
            {carregando ? 'Gravando...' : <><UserPlus size={18} /> Concluir Cadastro</>}
          </button>
          <div className="text-center mt-4 border-top pt-3">
            <button type="button" onClick={() => { setEtapaPrimeiroAcesso(1); setErro(null); setSucesso(null); }} className="btn btn-link text-decoration-none small fw-semibold text-secondary p-0 d-inline-flex align-items-center gap-1">
              <ArrowLeft size={14} /> Voltar Etapa
            </button>
          </div>
        </form>
      )}

          
    
        {/* ====================================================================
           ECRÃ E: SELEÇÃO DE MÚLTIPLOS CONTRATOS
           ==================================================================== */}
        {modoView === 'selecionarContrato' && (
          <div className="p-4">
            <h3 className="fs-6 fw-bold text-dark mb-3">Selecione o Contrato</h3>
            <p className="text-muted small mb-3">O seu utilizador está associado a mais do que um contrato. Escolha qual deseja operar:</p>
            
            <div className="d-grid gap-2 mb-3">
              {contratosDoUsuario && contratosDoUsuario.map((contrato: any) => (
                <button 
                  key={contrato.id} 
                  type="button" 
                  onClick={() => setModoView('telaDoContrato')} 
                  className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 fw-semibold small"
                >
                  <span>📄 {contrato.numero || `Contrato #${contrato.id}`}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
    
            <button 
              type="button" 
              onClick={() => setModoView('login')} 
              className="btn btn-link text-decoration-none small text-secondary w-100 p-0 text-center"
            >
              Sair / Voltar
            </button>
          </div>
        )}
    
        {/* ====================================================================
           ECRÃ F: AVISO DE FALTA DE VÍNCULO
           ==================================================================== */}
        {modoView === 'semVinculo' && (
          <div className="text-center p-4 py-5">
            <div className="text-warning fs-2 mb-2">⚠️</div>
            <h3 className="fs-6 fw-bold text-dark mb-1">Nenhum Contrato Vinculado</h3>
            <p className="text-muted small mb-4">O seu utilizador foi criado, mas ainda não possui contratos associados. Contacte o administrador.</p>
            <button 
              type="button" 
              onClick={() => setModoView('login')} 
              className="btn btn-secondary btn-sm w-100 fw-semibold py-2"
            >
              Voltar para o Login
            </button>
          </div>
        )}
    
        {/* ====================================================================
           ECRÃ G: ACESSO CONCEDIDO (REDIRECTS INTERNOS)
           ==================================================================== */}
        {(modoView === 'dashboardGeral' || modoView === 'telaDoContrato') && (
          <div className="text-center p-4 py-5">
            <h3 className="fs-5 fw-bold text-success mb-2">🎉 Acesso Concedido!</h3>
            <p className="text-muted small mb-0">
              {modoView === 'dashboardGeral' ? 'A carregar o Painel de Administrador...' : 'A carregar a Área do Contrato...'}
            </p>
          </div>
        )}
    
        </div> {/* Fecha o <div className="card"> */}
      </div>
    );

};

