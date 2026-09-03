import { useEffect, useState } from 'react';
import { Contrato } from './components/contrato.tsx';
import { Atendimento } from './components/atendimento.tsx';
import { Dashboard } from './components/dashboard.tsx';
import { ConsumoAPI } from './components/consumoAPI.tsx';
import { CadastroContrato } from './components/cadastroContrato.tsx';
import { PesquisarContrato } from './components/pesquisarContrato.tsx';
import { ConfiguracaoSistema } from './components/configuracaoSistema.tsx';
import { TelaLogin } from './components/login.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 💡 Importação obrigatória do estilo
// Se criou um componente separado para listar contratos, importe-o aqui, ou gerencie no próprio Login/Atendimento
import axios from 'axios';
import { ArrowRight } from 'lucide-react';

function App() {
    const [contratosDoUsuario, setContratosDoUsuario] = useState<any[]>([]);
    const [payloadGlobal, setPayloadGlobal] = useState<any>(() => {
    const payloadSalvo = localStorage.getItem('@TollManagement:payloadGlobal');
    return payloadSalvo ? JSON.parse(payloadSalvo) : null;
  });
  
    const [usuarioLogado, setUsuarioLogado] = useState<any>(() => {
    const userSalvo = localStorage.getItem('@TollManagement:user');
    return userSalvo ? JSON.parse(userSalvo) : null;
  });

    const [idContratoSelecionado, setIdContratoSelecionado] = useState<number | null>(() => {
    const idSalvo = localStorage.getItem('@TollManagement:idContratoSelecionado');
    return idSalvo ? Number(idSalvo) : null;
  });

    const [paginaAtiva, setPaginaAtiva] = useState<string>(() => {
    const ultimaPagina = localStorage.getItem('@TollManagement:paginaAtiva');
    return ultimaPagina || 'login';
  });
  
  // Lista de múltiplos contratos para operadores que têm mais de um vínculo
  const [, setContratosParaEscolha] = useState<any[]>([]);

  useEffect(() => {
    if (idContratoSelecionado) {
      localStorage.setItem('@TollManagement:idContratoSelecionado', String(idContratoSelecionado));
    }
  }, [idContratoSelecionado]);

  useEffect(() => {
    if (payloadGlobal) {
      localStorage.setItem('@TollManagement:payloadGlobal', JSON.stringify(payloadGlobal));
    }
  }, [payloadGlobal]);

  useEffect(() => {
    if (usuarioLogado && paginaAtiva !== 'login') {
      localStorage.setItem('@TollManagement:paginaAtiva', paginaAtiva);
    }
  }, [paginaAtiva, usuarioLogado]);
   
  useEffect(() => {
    const token = localStorage.getItem('@TollManagement:token');
    const user = localStorage.getItem('@TollManagement:user');

    if (!token || !user) {
      localStorage.removeItem('@TollManagement:paginaAtiva');
      localStorage.removeItem('@TollManagement:payloadGlobal');
      setUsuarioLogado(null);
      setPaginaAtiva('login');
    }
  }, []);

  useEffect(() => {
  if (usuarioLogado && paginaAtiva === 'login') {
    // Se o usuário está logado mas a página ficou travada em 'login',
    // reexecuta a função inteligente de direcionamento para decidir a tela correta!
    handleSucessoAutenticacao(usuarioLogado);
    }
    }, [paginaAtiva, usuarioLogado]);

    // 💡 CORREÇÃO AQUI: Função inteligente de sucesso de autenticação
   const handleSucessoAutenticacao = (dadosUsuario: any) => {
  if (!dadosUsuario) {
    handleLogoff();
    return;
  }

  // Tratamento do array de contratos vindo do backend
  let usuarioTratado = Array.isArray(dadosUsuario) ? dadosUsuario[0] : dadosUsuario;
  let listaContratos: any[] = [];

  if (Array.isArray(dadosUsuario)) {
    listaContratos = dadosUsuario
      .filter((linha: any) => linha.contratoId)
      .map((linha: any) => ({ id: linha.contratoId, numero: linha.contratoNumero }));
  } else if (usuarioTratado.contratos) {
    listaContratos = usuarioTratado.contratos;
  } else if (usuarioTratado.contratoId) {
    listaContratos = [{ id: usuarioTratado.contratoId, numero: usuarioTratado.contratoNumero }];
  }

  usuarioTratado.contratos = listaContratos;
  setUsuarioLogado(usuarioTratado);

  const { perfil } = usuarioTratado;

  // 1. Fluxo: ADMINISTRADOR ou GERENTE
  if (perfil === 'admin') {
    setPaginaAtiva('atendimento');
    localStorage.setItem('@TollManagement:paginaAtiva', 'atendimento');
  } 
  else if (perfil === 'gerente') {
    setPaginaAtiva('dashboard');
    localStorage.setItem('@TollManagement:paginaAtiva', 'dashboard');
  } 
  // 2. NOVO Fluxo: ATENDIMENTO (Vê tudo, não exige vínculo)
  else if (perfil === 'atendimento') {
    // Como ele pode ver todos, mandamos ele para a tela de pesquisa de contratos global do sistema
    setPaginaAtiva('pesquisar-contrato');
    localStorage.setItem('@TollManagement:paginaAtiva', 'pesquisar-contrato');
  }
  // 3. Fluxo: CLIENTE (Exige obrigatoriamente um ou mais vínculos)
  else if (perfil === 'cliente') {
    if (listaContratos.length === 0) {
      handleLogoff(); 
      alert("O seu utilizador com perfil de Cliente ainda não foi associado a nenhum contrato no sistema.");
    } 
    else if (listaContratos.length === 1) {
      const idDoContrato = listaContratos[0].id;
      setIdContratoSelecionado(idDoContrato);
      setPayloadGlobal({ id: idDoContrato, dadosLimpos: { id: idDoContrato } });
      
      setPaginaAtiva('contrato');
      localStorage.setItem('@TollManagement:paginaAtiva', 'contrato');
    } 
    else {
      setContratosDoUsuario(listaContratos);
      setPaginaAtiva('selecionar-contrato');
      localStorage.setItem('@TollManagement:paginaAtiva', 'selecionar-contrato');
    }
  } 
  // 4. Bloco de Segurança: Sem perfil ou Perfil inválido
  else {
    console.warn(`Perfil rejeitado pelo sistema: "${perfil}"`);
    handleLogoff(); 
    alert("Erro de Acesso: O seu usuário não possui um perfil válido atribuído no sistema. Contacte o administrador.");
  }
};

  const handleLogoff = () => {
    localStorage.removeItem('@TollManagement:token');
    localStorage.removeItem('@TollManagement:user');
    localStorage.removeItem('@TollManagement:paginaAtiva');
    localStorage.removeItem('@TollManagement:idContratoSelecionado'); 
    localStorage.removeItem('@TollManagement:payloadGlobal'); 
    setIdContratoSelecionado(null);
    setPayloadGlobal(null);
    setUsuarioLogado(null);
    setPaginaAtiva('login');
    setContratosParaEscolha([]);
  }; 

  axios.interceptors.request.use((config) => {
    const tokenSalvo = localStorage.getItem('@TollManagement:token');
    if (tokenSalvo && config.headers) {
      config.headers.Authorization = `Bearer ${tokenSalvo}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
  
  return (
    <div>
      <div>     
        
        {!usuarioLogado ? (
          <TelaLogin onLoginSucesso={handleSucessoAutenticacao} setPaginaAtiva={setPaginaAtiva} setIdContratoSelecionado={setIdContratoSelecionado}/>
        ) : (
          <>
            {paginaAtiva === 'dashboard' && <Dashboard />}
            {paginaAtiva === 'consumoAPI' && <ConsumoAPI />}

            {paginaAtiva === 'contrato' && (
              <Contrato 
                usuarioLogado={usuarioLogado}
                payloadEnvio={payloadGlobal}      
                setPaginaAtiva={setPaginaAtiva}   
                paginaAtiva={paginaAtiva}
                setPayloadGlobal={setPayloadGlobal}
                setIdContratoSelecionado={setIdContratoSelecionado}
              />
            )}
            
            {paginaAtiva === 'atendimento' && (
              <Atendimento 
                setPaginaAtiva={setPaginaAtiva} 
                idContratoSelecionado={idContratoSelecionado}
                setIdContratoSelecionado={setIdContratoSelecionado}
                setPayloadGlobal={setPayloadGlobal} 
                usuario={usuarioLogado}            
                onLogoff={handleLogoff}            
              />
            )}

            {paginaAtiva === 'pesquisar-contrato' && (
              <PesquisarContrato 
                setPaginaAtiva={setPaginaAtiva} 
                setIdContratoSelecionado={setIdContratoSelecionado}
                setPayloadGlobal={setPayloadGlobal} 
              />
            )}

            {paginaAtiva === 'cadastro-contrato' && (
              <CadastroContrato />
            )}

            {paginaAtiva === 'configuracao-sistema' && (
              <ConfiguracaoSistema />
            )}

            {/* NOVAS PÁGINAS MAPEADAS NO APP MESTRE */}
            {paginaAtiva === 'sem-vinculo' && (
              <div className="text-center py-5 container" style={{ maxWidth: '400px' }}>
                <div className="alert alert-warning fw-bold">⚠️ Sem Vínculos Ativos</div>
                <p className="text-muted small">O seu utilizador com perfil de Cliente ainda não foi associado a nenhum contrato no sistema.</p>
                <button className="btn btn-secondary btn-sm w-100" onClick={handleLogoff}>Voltar ao Login</button>
              </div>
            )}

            {paginaAtiva === 'selecionar-contrato' && (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-3">
              <div className="card border-0 shadow-sm bg-white rounded-3 p-4 text-start" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="fs-6 fw-bold text-dark mb-3">Selecione o Contrato Ativo</h3>
                <p className="text-muted small mb-3">Escolha qual dos seus contratos deseja gerir nesta sessão:</p>
                
                <div className="d-grid gap-2 mb-3">
                  {contratosDoUsuario?.map((contrato: any) => (
                    <button 
                      key={contrato.id} 
                      type="button" 
                      onClick={() => {
                        // Quando clica, o fluxo repete a lógica para o contrato escolhido!
                        setIdContratoSelecionado(contrato.id);
                        setPayloadGlobal({ id: contrato.id, dadosLimpos: { id: contrato.id } });
                        setPaginaAtiva('contrato');
                        localStorage.setItem('@TollManagement:paginaAtiva', 'contrato');
                      }}
                      className="btn btn-outline-primary text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 fw-semibold small"
                    >
                      <span>📄 {contrato.numero ? `Contrato Nº ${contrato.numero}` : `Contrato ID #${contrato.id}`}</span>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                  <button className="btn btn-link text-secondary text-decoration-none small mt-2" onClick={handleLogoff}>Sair</button>
                </div>
              </div>
            </div>
          )}

            {paginaAtiva === 'login' && (
              <div className="text-center py-5">🔄 Redirecionando sessão ativa...</div>
            )}
          </>
        )}

      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
}

export default App;
