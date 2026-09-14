import React, { useState, useMemo, useEffect } from 'react';
import type { IEmailRegistro } from '../types/index.ts';
import '../styles/editarUsuario.css';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import type { IGerenciadorProps } from '../types/IGerenciadorProps.ts';
import axios from 'axios';
import { toast } from 'react-toastify';

export const EditarUsuario: React.FC<IGerenciadorProps> = ({payloadEnvio, setAbaAtiva, dadosIniciais}) => {

  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [carregando] = useState(false);

  const [modalInserirAberto, setModalInserirAberto] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState<any>(null);

  const [dadosSharePoint, setDadosSharePoint] = useState<IEmailRegistro[]>([]);
  const [, setCarregando] = useState<boolean>(true);
  const [, setUsuarios] = useState<any[]>([]);
  
  // MONITOR DE ÁREA ÚTIL: O React descobre o tamanho real do ecrã a cada milissegundo!

  const [, setLarguraJanela] = useState<number>(window.innerWidth);

  //Deteta se o utilizador está num ecrã de computador ou num smartphone/tablet

  const [dadosLocais, setDadosLocais] = useState<IEmailRegistro[]>(dadosIniciais ?? []);
  const [pesquisa, setPesquisa] = useState<string>('');
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [registroSelecionado, setRegistroSelecionado] = useState<IEmailRegistro | null>(null);
  
  const [, setIndexEdicao] = useState<number>(-1);
  //const [inputData, setInputData] = useState<string>('');
  const [inputNome, setInputNome] = useState<string>('');
  const [inputUsuario, setInputUsuario] = useState<string>('');
  const [inputPerfil, setInputPerfil] = useState<string>('');
  const [inputStatus, setInputStatus] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');

  //const [inputData] = useState<string>('');

  const [inputInserirNome, setInputInserirNome] = useState<string>('');
  const [inputInserirUsuario, setInputInserirUsuario] = useState<string>('');
  const [inputInserirPerfil, setInputInserirPerfil] = useState<string>('');
  const [, setInputInserirStatus] = useState<number>();
  const [inputInserirEmail, setInputInserirEmail] = useState<string>('');
  const [] = useState<string>('');

  //const [salvando, setSalvando] = useState<boolean>(false);
  const [paginaAtualCRUD, setPaginaAtualCRUD] = useState<number>(1);
  const registrosPorPaginaCRUD = 5;
  const [, setErroLocal] = useState<string | null>(null);
  const [inputId, setInputId] = useState<string | number | null>(null);

  const fecharFormulario = () => { setModalAberto(false); };
  const fecharFormularioInserir = () => { setModalInserirAberto(false); };
  
  
  // 2. A função que o seu botão "Listar usuários" vai disparar
  const listarUsuarios = () => {
  console.log("Navegando para a aba de listagem...");
  
  // O TypeScript agora aceita perfeitamente porque 'usuario' faz parte do tipo oficial AbaInferior!
  setAbaAtiva && setAbaAtiva('usuario');  
  };

  const handleConfirmarExclusao = async (e?: React.FormEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (itemParaExcluir) {
    
    
    console.log("-> Validando ID para o Axios PUT:", itemParaExcluir);
  
    const idContrato = payloadEnvio?.id || payloadEnvio?.dadosLimpos?.id || payloadEnvio?.contratoId || 0;
  
    console.log("-> 🔍 ID do Contrato capturado para o vínculo:", idContrato);

    const res = await axios.delete(`/api/auth/ExcluirUsuario/${itemParaExcluir?.id}/contrato/${idContrato}`);


    if (res.data?.sucesso) {
      toast.success('Usuário excluído com sucesso!');
    }else{
      toast.error('Falha ao excluir usuário!');
    }

   }

    // Fecha a modal e limpa o estado
    setModalExclusaoAberto(false);
    setItemParaExcluir(null);
  };

    const dadosFiltrados = useMemo(() => {
    // Se você salvou em dadosSharePoint, ele deve filtrar em cima de dadosSharePoint!
    return dadosSharePoint.filter((item) => {
      return (
        item.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        item.usuario?.toLowerCase().includes(pesquisa.toLowerCase())
      );
    });
  }, [dadosSharePoint, pesquisa]);

  const totalPaginasCRUD = Math.ceil(dadosFiltrados.length / registrosPorPaginaCRUD);
  const indiceInicialCRUD = (paginaAtualCRUD - 1) * registrosPorPaginaCRUD;
  
  const itensDaPaginaCRUD = useMemo(() => {
    return dadosFiltrados.slice(indiceInicialCRUD, indiceInicialCRUD + registrosPorPaginaCRUD);
  }, [dadosFiltrados, paginaAtualCRUD]);

  const abrirInclusao = () => {
    setIndexEdicao(-1); setInputNome(''); setInputUsuario(''); setInputPerfil(''); setInputStatus('');
    setModalInserirAberto(true);
  };

  const abrirEdicao = (item: any) => {
  if (!item) return;

  // 1. Encontra o índice real na lista local
  const idxReal = dadosLocais.findIndex((o: any) => o.id === item.id);
  setIndexEdicao(idxReal); 

  console.log("=== DIAGNÓSTICO DE ABRE MODAL ===");
  console.log("1. O que está dentro de 'item':", item);

  // 2. Alimenta os estados locais com segurança
  // Se o seu setInputId der erro com número, mude para: setInputId(String(item.id));
  if (item.id) {
    setInputId(item.id.toString()); 
  }

  setInputNome(item.nome || item.Nome || ''); 
  setInputUsuario(item.usuario || item.Usuario || ''); 
  setInputEmail(item.email || item.Email || ''); 
  setInputPerfil(item.perfil || item.Perfil || ''); 
  setInputStatus(item.status || item.Status || '');

  // CORREÇÃO DE OURO: Salva o objeto 'item' real (os dados do Aurélio) 
  // e não a função setInputId!
  setUsuarioSelecionado(item); 
  
  // 3. Abre a modal flutuante
  setModalAberto(true);
  };

  // const confirmarAcaoFormulario = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const novoRegistro: IEmailRegistro = {
  //     id: 0, nome: inputNome, usuario: inputUsuario, perfil: inputPerfil, status: inputStatus, email: inputEmail, data: inputData 
  //   };
  //   if (indexEdicao === -1) {
  //     setDadosLocais([...dadosLocais, novoRegistro]);
  //   } else {
  //     const novaLista = [...dadosLocais];
  //     novaLista[indexEdicao] = novoRegistro;
  //     setDadosLocais(novaLista);
  //   }
  //   fecharFormulario();
  // };

  // const removerLinha = (item: any) => {
  //   if (window.confirm("Deseja remover este registro?")) {
  //     setDadosLocais(dadosLocais.filter((_, i) => i !== item));
  //   }
  // };

  // const enviarDadosParaServidor = async () => {
  //   try {
  //     setSalvando(true);
  //     const payload = dadosLocais.map(item => ({ Nome: item.nome, Usuario: item.usuario, Perfil: item.perfil, Status: item.status }));

  //     //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
  //     await fetch('/api/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      
  //     setMensagem({ texto: "🎉 Sincronizado com sucesso no SharePoint!", tipo: 'sucesso' });
  //   } catch {
  //     setMensagem({ texto: "❌ Falha ao salvar", tipo: 'erro' });
  //   } finally { setSalvando(false); }
  // };

  const handleSalvarUsuario = async (e?: React.FormEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (carregando) return;

  // DIAGNÓSTICO: Descobre se o ID do usuário selecionado está a chegar correto
  const idDoUsuario = inputId ? String(inputId).trim() : '0';
  
  console.log("-> Validando ID para o Axios PUT:", idDoUsuario);

  if (!idDoUsuario) {
    console.error("❌ Erro: O objeto usuarioSelecionado não possui um ID válido!", usuarioSelecionado);
    return; // Se não tiver ID, a função para aqui
  }

  if (!inputNome.trim() || !inputEmail.trim() || !inputUsuario.trim()) {
    console.warn("❌ Erro: Existem campos de texto vazios.");
    return;
  }

  try {
    setCarregando(true);
    setErroLocal(null);

    // Usa o ID mapeado com segurança
    const res = await axios.put(`/api/auth/atualizaUsuario/${idDoUsuario}`, {
      nome: inputNome.trim(),
      usuario: inputUsuario.trim(),
      email: inputEmail.trim(),
      perfil: inputPerfil
    });

    console.log("-> Resposta do servidor:", res.data);

    if (res.data?.sucesso) {
      setUsuarioSelecionado({
        ...usuarioSelecionado,
        nome: inputNome.trim(),
        usuario: inputUsuario.trim(),
        email: inputEmail.trim(),
      });
      
      fecharFormulario(); // Fecha a janela após sucesso real
    }
  } catch (err: any) {
    console.error('Erro ao atualizar usuário no Axios:', err);
    setErroLocal(err.response?.data?.erro || 'Falha ao atualizar os dados.');
  } finally {
    setCarregando(false);
  }
  };

  async function InativarAtivarUsuarios(usuarioId: any, statusUsuario: any) {

  console.log("Enviando dados para fila de Ativação/Inativação usuário...");

  try {

    let status = 0;
    
    // CORREÇÃO 1: Usar apenas um '=' para alterar o valor da variável
    if (statusUsuario === 1) {
      status = 0; // Desativa
    } else {
      status = 1; // Ativa
    }
    
    const payload = {
      metadata: {
        protocoloId: `PROT-${Date.now()}`, 
        acao: 'atualizar', 
        criadoEm: new Date().toISOString(), // 💡 DICA: Enviar como string ISO para o banco/worker evitar problemas
      },
      contextoUsuario: {
        idUsuario: usuarioId,
        tipoAcao: 'ativarInativar',
        status // 🚀 Agora vai com o valor correto (0 ou 1)
      }
    };

    const resposta = await axios.post('/api/auth/usuario/inativarAtivar', payload);

    const dadosServidor = Array.isArray(resposta.data) ? resposta.data : [];

    let statusString='';

    if(status === 0){
      statusString='Inativação'
      toast.success(`${statusString} do usuário ${dadosServidor}, realizada!`);
    }else{
      statusString='Ativação'
      toast.success(`${statusString} do usuário ${dadosServidor}, realizada!`);
    }
    
  }catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsuarios([]);
      setDadosSharePoint([]);
    } finally {
      // O TypeScript agora aceita perfeitamente porque 'usuario' faz parte do tipo oficial AbaInferior!
      setAbaAtiva && setAbaAtiva('usuario');  
    }
  };

  // Função auxiliar para criar uma pausa assíncrona (Ex: aguardar 1 segundo)
  const aguardar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async function InserirUsuario(dados?: any) {
  console.log("🚀 [Microsserviço] Iniciando inserção de usuário...");

  try {
    const senhaLimpa = typeof dados?.senha === 'string' ? dados.senha.trim() : null;
    const usernameDigitado = inputInserirUsuario.trim();
  
    const payloadInserir = {
      nome: inputInserirNome.trim(),
      usuario: usernameDigitado,
      email: inputInserirEmail.trim(),
      senha: senhaLimpa,
      perfil: inputInserirPerfil || 'operador',
      tipoAcao: "novoUsuario",
    };

    // 1. Envia a inserção para o microsserviço (entra na fila do RabbitMQ)
    await axios.post('/api/auth/primeiro-acesso', payloadInserir);
    
    toast.info('⏳ Processando cadastro na fila... Aguarde um momento.');

    // ====================================================================
    // MECANISMO DE POLLING: Busca o ID gerado pelo Worker
    // ====================================================================
    let novoUsuarioId: number | null = null;
    let tentativas = 3; // Tenta buscar até 3 vezes caso a fila esteja lenta

    while (tentativas > 0 && !novoUsuarioId) {
      console.log(`🔍 Tentando recuperar ID para o usuário '${usernameDigitado}' (${tentativas} tentativas restantes)...`);
      
      await aguardar(1000); // Aguarda 1 segundo para dar tempo ao Worker de gravar no SQLite

      try {
        // Faz a chamada para a nova rota que você sugeriu criando abaixo
        const resBusca = await axios.get(`/api/auth/usuario/buscar-por-username/${usernameDigitado}`);
        
        if (resBusca.data?.id) {
          novoUsuarioId = resBusca.data.id; // Encontrou o ID gerado pelo banco!
          console.log("✅ ID localizado com sucesso pelo Polling:", novoUsuarioId);
        }
      } catch (err) {
        // Ignora erros de "Não encontrado (404)" e continua tentando
      }

      tentativas--;
    }

    if (!novoUsuarioId) {
      throw new Error("O microsserviço demorou muito a processar o cadastro. Tente vincular o contrato manualmente.");
    }

    // 2. Agora que temos o ID real gerado pelo SQLite, faz o vínculo de forma perfeita!
    const idContrato = payloadEnvio?.id || payloadEnvio?.dadosLimpos?.id || payloadEnvio?.contratoId || 0;

    console.log("-> 🔍 ID do Contrato capturado para o vínculo:", idContrato);
    
    if (!idContrato || idContrato === 0) {
      throw new Error("Não foi possível localizar o ID do contrato nos dados fornecidos.");
    }

    console.log(`-> Vinculando Usuário ID ${novoUsuarioId} ao Contrato ID ${idContrato}...`);

    await axios.post('/api/auth/usuarios/vincular-contrato', {
      usuarioId: novoUsuarioId,
      contratoId: idContrato,
      tipoAcao: 'vincularContrato'
    });

    await axios.post('/api/auth/usuario/noficacao', {
      usuarioId: novoUsuarioId,
      email: inputInserirEmail.trim(),
      tipoAcao: 'enviaNotificacaoNovoUsuario'
    });

    toast.success('🚀 Usuário registrado e contrato vinculado com sucesso(Enviamos um e-mail ao usuário comunicando sobre o acesso !');
    if (typeof fecharFormulario === 'function') fecharFormulario();
    
  } catch (error: any) {
    console.error('❌ Erro no fluxo híbrido:', error.message);
    toast.error(`Falha no processo: ${error.response?.data?.erro || error.message}`);
  } finally {
    if (setAbaAtiva) setAbaAtiva('usuario');  
  }
  }

   useEffect(() => {
    const tratarRedimensionamento = () => setLarguraJanela(window.innerWidth);
    window.addEventListener('resize', tratarRedimensionamento);

    //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
    async function carregarUsuarios() {
    // 1. Extrai o ID do contrato
    const idContrato = payloadEnvio?.dadosLimpos?.id || payloadEnvio?.id;
    
    // Trava de segurança: Se o ID ainda não existir na montagem do ecrã, não faz a requisição
    if (!idContrato) return;

    try {
      setCarregando(true);

      const resposta = await axios.get(`/api/auth/usuarios/contrato/${idContrato}`);
      const dadosServidor = Array.isArray(resposta.data) ? resposta.data : [];

      // CORREÇÃO 1: Mapeia diretamente a resposta vinda do Axios (dadosServidor)
      const dadosNormalizados: IEmailRegistro[] = dadosServidor.map((item: any) => ({
        id: item.Id || item.id || '-',
        nome: item.Nome || item.nome || '-',
        usuario: item.Usuario || item.usuario || '-',
        email: item.Email || item.email || '-',
        status: item.Ativo || item.ativo || '-',
        data: item.DataCriacao || item.dataCriacao || '-',
        perfil: item.Perfil || item.perfil || '-'
        
      }));

      // CORREÇÃO 2: Atualiza os estados na ordem correta
      setDadosSharePoint(dadosNormalizados);
      setUsuarios(dadosServidor);

    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsuarios([]);
      setDadosSharePoint([]);
    } finally {
      setCarregando(false);
    }
  }
       carregarUsuarios();

  }, [payloadEnvio]);

  useEffect(() => { setDadosLocais(dadosIniciais ?? []); }, [dadosIniciais]);

  useEffect(() => { setPaginaAtualCRUD(1); }, [pesquisa]);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  React.useEffect(() => {
  // Mude para 'item' se a sua variável da modal se chamar 'item'
  if (modalAberto && usuarioSelecionado) {
    
    // A LINHA QUE FALTAVA: Converte o ID 2 em texto e salva no estado
    const idLimpo = usuarioSelecionado.id !== undefined && usuarioSelecionado.id !== null 
      ? `${usuarioSelecionado.id}` 
      : '';
    setInputId(idLimpo);

    // Alimenta os restantes campos normalmente
    setInputNome(usuarioSelecionado.nome || '');
    setInputUsuario(usuarioSelecionado.usuario || '');
    setInputEmail(usuarioSelecionado.email || '');
    setInputPerfil(usuarioSelecionado.perfil || 'operador');
    setInputStatus(usuarioSelecionado.status || 1);
    }
  }, [modalAberto, usuarioSelecionado]);

  React.useEffect(() => {

  if (modalInserirAberto) {
  
    setInputInserirPerfil('cliente');
    setInputInserirStatus(Number(0));
  }
  }, [modalInserirAberto]);

  // SE O USUÁRIO CLICAR EM "VER DETALHES"
  if (registroSelecionado) {
  return (
  /* container limita a largura em 1200px e px-3 sincroniza milimetricamente com a reta do seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* 1. CABEÇALHO DO TÍTULO (LIMPO E SEM BOTÃO DO LADO) */}

    <div className="d-flex align-items-center justify-content-between pb-3 mb-0">
      <h2 className="fs-4 fw-bold text-dark m-0">Visualizar Detalhes do Registro</h2>
    </div>

    {/* 2. NOVO BOTÃO DE VOLTAR: BOLINHA COM SETA (POSICIONADO ABAIXO DA LINHA) */}
    {/* <div className="mb-4">
      <button 
        className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border shadow-xs" 
        onClick={() => setRegistroSelecionado(null)} 
        title="Voltar para a Listagem"
        style={{ width: '40px', height: '40px', transition: 'background-color 0.2s' }}
      >
        <ArrowLeft size={18} className="text-secondary" />
      </button>
    </div> */}

    {/* PAINEL DE INFORMAÇÕES (Card Branco Premium Alinhado) */}
    <div className="card p-3 p-md-3 shadow-sm border border-light-subtle bg-white rounded-3 w-100"  >
      
      {/* LISTA CHAVE-VALOR: TODOS OS TEXTOS ALINHADOS À ESQUERDA */}
      <div className="w-100 d-flex flex-column gap-2" style={{ maxWidth: "1200px" }}>
        
        {/* Bloco 1: Assunto */}
        {/* MUDANÇA: 'text-start' remove o flex horizontal e joga todas as tags para o canto esquerdo da caixa */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          {/* MUDANÇA: 'd-block mb-1' faz a etiqueta ficar no topo, alinhada à esquerda */}
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Id:
          </strong>
          {/* O dado real nasce colado na borda esquerda logo abaixo */}
          <span className="text-dark fw-bold fs-6 d-block">{registroSelecionado.id}</span>
        </div>

        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          {/* MUDANÇA: 'd-block mb-1' faz a etiqueta ficar no topo, alinhada à esquerda */}
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Nome:
          </strong>
          {/* O dado real nasce colado na borda esquerda logo abaixo */}
          <span className="text-dark fw-bold fs-6 d-block">{registroSelecionado.nome}</span>
        </div>

        {/* Bloco 2: Remetente */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Usuario:
          </strong>
          <span className="text-dark fw-medium fs-6 d-block text-break">{registroSelecionado.usuario}</span>
        </div>

        {/* Bloco 3: Data de Processamento */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            E-mail:
          </strong>
          <span className="text-secondary fs-6 d-block">{registroSelecionado.email}</span>
        </div>

        {/* Bloco 3: Data de Processamento */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Perfil:
          </strong>
          <span className="text-secondary fs-6 d-block">{registroSelecionado.perfil}</span>
        </div>

        {/* Bloco 3: Data de Processamento */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
         <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
           Status:
         </strong>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 my-2">
  
        {/* Texto do Status */}
        <span className="text-secondary fs-6 fw-semibold">{Number(registroSelecionado.status) === 1 ? 'Ativo' : 'Inativo'}</span>

        {/* Botão alinhado perfeitamente na mesma linha */}
        <button className={`btn btn-sm fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0 ${
          Number(registroSelecionado.status) === 1 ? 'btn-danger text-white' : 'btn-success text-white'}`}  onClick={() => InativarAtivarUsuarios(registroSelecionado.id, Number(registroSelecionado.status))} >
          📋 {Number(registroSelecionado.status) === 1 ? 'Inativar usuários' : 'Ativar usuários'}
        </button>

        </div>
      </div>

        {/* Bloco 3: Data de Processamento */}
        <div className="py-2 px-3 border border-light-subtle rounded-3 text-start" style={{ backgroundColor: '#fafafa' }}>
          <strong className="text-secondary text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
            Data de criação:
          </strong>
          <span className="text-secondary fs-6 d-block">{registroSelecionado.data}</span>
        </div>

      </div>
    </div>
  </div>
   );
  }

  return (
  // container-fluid limpa os styles inline pesados antigos e centraliza com a largura de 1200px
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="d-flex align-items-center justify-content-between pb-3 mb-0">
      <h2 className="fs-4 fw-bold text-dark m-0">Gerenciar Usuários</h2>
    </div>

    {/* PAINEL OPERACIONAL (Fundo branco igual aos seus outros cards) */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100 mb-4">
      
      {/* BARRA DE FERRAMENTAS: Pesquisa e Botões alinhados */}
      <div className="row g-3 align-items-center mb-3">
        {/* Input de Pesquisa ocupando 5 colunas */}
        <div className="col-md-5">

        <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
          {/* A moldura cinza claro que segura a lupa da Lucide */}
          <span className="input-group-text bg-light border-end-0 text-secondary">
            <Search size={18} />
          </span>
          
          {/* O campo de digitação real com a borda esquerda zerada para colar no ícone */}
          <input 
            type="text" 
            className="form-control border-start-0 ps-1" 
            placeholder="Pesquisar registros..." 
            style={{ fontSize: '0.875rem' }}
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
          />
        </div>
        </div>

        {/* Grupo de botões organizados e com as cores pretas/cinzas corporativas */}
        <div className="col-md-7 d-flex justify-content-md-end gap-2 flex-wrap">
          <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0"  onClick={listarUsuarios}>
            📋 Listar usuários
          </button>
          <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0"  onClick={abrirInclusao}>
            ➕ Incluir Registro
          </button>

        </div>
      </div>

      {/* ALERTAS DE MENSAGEM DO BOOTSTRAP */}
      {mensagem && (
        <div className={`alert ${mensagem.tipo === 'sucesso' ? 'alert-success' : 'alert-danger'} py-2 px-3 small mb-3`} role="alert">
          {mensagem.texto}
        </div>
      )}

      {/* ÁREA DA TABELA DE USUÁRIOS */}
      <div id="containerTabelaCrud" className="mt-2">
        {dadosFiltrados.length === 0 ? (
          <p className="text-muted text-center py-4 my-0 small">Nenhum registro encontrado.</p>
        ) : (
          <>
            {/* Tabela estilizada com as classes oficiais do Bootstrap */}
            <div className="table-responsive border rounded-3 bg-white">
              <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
                <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <tr>
                    <th style={{ width: '10%' }}>Nome</th>
                    <th style={{ width: '10%' }}>Usuario</th>
                    <th style={{ width: '10%' }}>Perfil</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th className="text-center" style={{ width: '1%' }}>Operações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensDaPaginaCRUD.map((item, index) => {
                    //const indiceRealAbsoluto = dadosLocais.indexOf(item) !== -1 ? dadosLocais.indexOf(item) : index;
                    return (
                      <tr key={item.id || index}>
                        <td className="text-dark fw-medium">{item.nome}</td>
                        <td className="text-secondary">{item.usuario}</td>
                        <td className="text-secondary">{item.perfil}</td>
                        <td className="text-secondary">{Number(item.status) === 1 ? 'Ativo' : 'Inativo'}</td>
                        {/* Ações com botões de ícone limpos e sem cores pesadas */}
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-light btn-sm border" title="Visualizar" onClick={() => setRegistroSelecionado(item)}><Eye size={22} className="text-primary" /></button>
                            <button className="btn btn-light btn-sm border" title="Editar" onClick={() => abrirEdicao(item)}><Pencil size={22} className="text-primary" /></button>
                            <button className="btn btn-light btn-sm border text-danger" title="Excluir" onClick={() => {
                              setItemParaExcluir(item);     // 💾 Guarda o item selecionado 
                              setModalExclusaoAberto(true);  // 🔓 Abre a modal de confirmação
                              }} ><Trash2 size={22} className="text-danger" /> {/* 💡 Mudei para text-danger para combinar com a lixeira */}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINAÇÃO RESPONSIVOS */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 pt-2 border-top">
              <span className="text-muted small">
                Mostrando {indiceInicialCRUD + 1} a {Math.min(indiceInicialCRUD + registrosPorPaginaCRUD, dadosFiltrados.length)} de {dadosFiltrados.length} registros (Página {paginaAtualCRUD}/{totalPaginasCRUD || 1})
              </span>
              <div className="btn-group">
                <button className="btn btn-light btn-sm border fw-medium px-3" disabled={paginaAtualCRUD === 1} onClick={() => setPaginaAtualCRUD(prev => prev - 1)}>
                  Anterior
                </button>
                <button className="btn btn-light btn-sm border fw-medium px-3" disabled={paginaAtualCRUD === totalPaginasCRUD || totalPaginasCRUD === 0} onClick={() => setPaginaAtualCRUD(prev => prev + 1)}>
                  Próximo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
    {modalExclusaoAberto && (
      <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}>
        <div className="modal-dialog modal-dialog-centered modal-sm"> {/* modal-sm deixa ela mais compacta */}
          <div className="modal-content shadow border-0 p-3 text-center">
            
            <div className="modal-body pt-3">
              <div className="text-danger mb-3">
                <Trash2 size={40} />
              </div>
              <h5 className="fw-bold text-dark fs-6 mb-2">Confirmar Exclusão</h5>
              <p className="text-muted small mb-4">
                Tem a certeza que deseja excluir o registo de <strong>{itemParaExcluir?.id || itemParaExcluir?.nome || itemParaExcluir?.usuario}</strong>? Esta ação não pode ser desfeita.
              </p>
              
              {/* Botões de Ação */}
              <div className="d-grid gap-2">
                <button 
                  type="button" 
                  className="btn btn-danger fw-semibold py-2" 
                  onClick={handleConfirmarExclusao}
                >
                  Sim, Excluir de fato
                </button>
                <button 
                  type="button" 
                  className="btn btn-light border text-secondary fw-semibold py-2" 
                  onClick={() => {
                    setModalExclusaoAberto(false);
                    setItemParaExcluir(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* MODAL FLUTUANTE DE EDIÇÃO DO BOOTSTRAP */}
    {modalAberto && (
      // Classes 'modal d-block' e fundo escurecido 'rgba(0,0,0,0.5)' criam o efeito flutuante real nativo
      <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 p-2">
            
            <div className="modal-header border-0 pb-1">
              <h5 className="modal-title fw-bold text-dark fs-5">
                ✏️ Editar Registro
              </h5>
              <button type="button" className="btn-close" onClick={fecharFormulario}></button>
            </div>
            
            <form className="modal-body pt-2 text-start">
              <div className="mb-2.5">
              <label className="form-label small fw-bold text-secondary mb-1">ID:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputId || ''} onChange={(e) => setInputId(e.target.value)} required />
              </div>
                
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">Nome:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputNome} onChange={(e) => setInputNome(e.target.value)} required />
              </div>
            
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">Usuário:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputUsuario} onChange={(e) => setInputUsuario(e.target.value)} required />
              </div>
            
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">E-mail:</label>
                <input type="email" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} required />
              </div>
            
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">Perfil de acesso:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} disabled value={inputPerfil} />
              </div>
            
              <div className="mb-2.5"> 
                <label className="form-label small fw-bold text-secondary mb-1">Status:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} disabled value={Number(inputStatus) === 1 ? 'Ativo' : 'Inativo'} />
              </div>    

              <div className="d-flex flex-column gap-2 border-top pt-3 mt-2">
              {/* EXEMPLO de como deve estar o seu botão de Editar na tabela do componente Pai */}
              <button
                type="button"
                className="btn btn-dark fw-semibold py-2"
                onClick={() => { 
                  // SEGREDO DA CORREÇÃO: Grava o objeto do usuário clicado no estado ANTES de abrir a modal
                  handleSalvarUsuario();
                  
                  // E depois abre a janela
                  setModalAberto(true);
                }}
              >
                ✏️ Editar
              </button>
              
                <button 
                  type="button" 
                  className="btn btn-light border text-secondary fw-semibold py-2" 
                  style={{ fontSize: '0.9rem' }} 
                  onClick={fecharFormulario}
                >
                  Cancelar e Fechar
                </button>
              </div>
            </form>
              
            </div>
          </div>
        </div>
        )}    

        {/* MODAL FLUTUANTE DE INSERIR DO BOOTSTRAP */}
        {modalInserirAberto && (
          <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow border-0 p-2">
                
                <div className="modal-header border-0 pb-1">
                  <h5 className="modal-title fw-bold text-dark fs-5">
                    📝 Inserir Registro
                  </h5>
                  <button type="button" className="btn-close" onClick={fecharFormulario}></button>
                </div>
                
                {/* CORREÇÃO 1: Adicionado o onSubmit para disparar a função e capturar o payload */}
                <form className="modal-body pt-2 text-start">
          
                  <div className="mb-2.5">
                    <label className="form-label small fw-bold text-secondary mb-1">Nome:</label>
                    <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputInserirNome} onChange={(e) => setInputInserirNome(e.target.value)} required />
                  </div>
                
                  <div className="mb-2.5">
                    <label className="form-label small fw-bold text-secondary mb-1">Usuário:</label>
                    <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputInserirUsuario} onChange={(e) => setInputInserirUsuario(e.target.value)} required />
                  </div>
                
                  <div className="mb-2.5">
                    <label className="form-label small fw-bold text-secondary mb-1">E-mail:</label>
                    <input type="email" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputInserirEmail} onChange={(e) => setInputInserirEmail(e.target.value)} required />
                  </div>
                
                  <div className="mb-2.5">
                    <label className="form-label small fw-bold text-secondary mb-1">Perfil de acesso:</label>
                    <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} disabled value={inputInserirPerfil} />
                  </div>
                
                  <div className="d-flex flex-column gap-2 border-top pt-3 mt-2">
                    {/* CORREÇÃO 2: Botão alterado para type="submit" e classes de botão primário esatizado */}
                    <button
                      type="button"
                      disabled={carregando || !inputInserirNome.trim() || !inputInserirUsuario.trim() || !inputInserirEmail.trim()}
                      className="btn btn-dark fw-semibold py-2"
                      style={{ fontSize: '0.9rem' }}
                      onClick={InserirUsuario}
                    >
                      {carregando ? 'A processar...' : '📝 Inserir usuário'}
                    </button>
                  
                    <button 
                      type="button" 
                      className="btn btn-light border text-secondary fw-semibold py-2" 
                      style={{ fontSize: '0.9rem' }} 
                      onClick={fecharFormularioInserir}
                    >
                      Cancelar e Fechar
                    </button>
                  </div>
                </form>
                  
              </div>
            </div>
          </div>
        )}

      </div>
    );

};
