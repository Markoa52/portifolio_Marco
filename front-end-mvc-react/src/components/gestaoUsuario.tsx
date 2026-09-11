import React, { useState, useEffect } from 'react';
import { UserPlus, Search, ArrowRight, Plus, Trash2, Building, Edit2 } from 'lucide-react';
import axios from 'axios';

export const GestaoUsuarios: React.FC = () => {

  const [modalEditarAberta, setModalEditarAberta] = useState(false);
  const [nomeEditado, setNomeEditado] = useState('');
  const [usuarioEditado, setUsuarioEditado] = useState('');
  const [emailEditado, setEmailEditado] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState('operador');

  // Grades Globais
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [todosContratos, setTodosContratos] = useState<any[]>([]);
  const [contratosVinculados, setContratosVinculados] = useState<any[]>([]);
  
  // Seleção e Filtros
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);
  const [busca, setBusca] = useState('');
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  // ABA INTERNA DA DIREITA: Alterna entre 'cadastro' e 'vinculo'
  const [subPainelDireito, setSubPainelDireito] = useState<'cadastro' | 'vinculo'>('cadastro');

  // Inputs de Novo Cadastro
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('');

  // Alertas
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // 1. Carrega os usuários na esquerda
  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const resposta = await axios.get('/api/auth/usuarios');
      setUsuarios(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Carrega todos os contratos do sistema para alimentar o Dropdown
  const carregarTodosContratos = async () => {
    try {
      const res = await axios.get('/api/contratos');
      setTodosContratos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao buscar contratos globais:", err);
    }
  };

  // 3. Carrega as carteiras que o usuário clicado possui direito
  const carregarContratosDoUsuario = async (usuarioId: number) => {
    try {
      const res = await axios.get(`/api/auth/usuarios/${usuarioId}/contratos`);
      setContratosVinculados(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar vínculos:", err);
      setContratosVinculados([]);
    }
  };

  useEffect(() => {
    carregarUsuarios();
    carregarTodosContratos();
  }, []);

  // Gatilho executado ao clicar em um operador na lista da esquerda
  const handleSelecionarUsuario = async (user: any) => {
    setUsuarioSelecionado(user);
    setErro(null);
    setSucesso(null);
    setContratoSelecionadoId('');
    setSubPainelDireito('vinculo'); // 🚀 Abre o painel de vincular carteiras na hora!
    await carregarContratosDoUsuario(user.id);
  };

  // Operação A: Gravação de um novo operador via rota/fila assíncrona
  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCarregando(true);
      setErro(null);
      setSucesso(null);

      const payload = {
        nome: nome.trim(),
        usuario: usuario.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        perfil: perfil,
        tipoAcao: "novoUsuario"
      };

      const resposta = await axios.post('/api/auth/primeiro-acesso', payload);

      if (resposta.data?.sucesso) {
        setSucesso(`Usuário @${usuario} cadastrado com sucesso!`);
        setNome(''); setUsuario(''); setEmail(''); setSenha(''); setPerfil('')
        await carregarUsuarios(); // Atualiza a lista da esquerda
      }
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Falha ao processar o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  // Operação B: Cria um novo vínculo na tabela intermediária (Pivot)
  const handleAdicionarVinculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSelecionado || !contratoSelecionadoId) return;

    try {
      setCarregando(true);
      setErro(null);
      const res = await axios.post('/api/auth/usuarios/vincular-contrato', {
        usuarioId: usuarioSelecionado.id,
        contratoId: Number(contratoSelecionadoId),
        tipoAcao: 'vincularContrato'
      });

      if (res.data?.sucesso) {
        setSucesso('Contrato vinculado com sucesso!');
        setContratoSelecionadoId('');
        await carregarContratosDoUsuario(usuarioSelecionado.id);
      }
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Este contrato já está vinculado a este operador.');
    } finally {
      setCarregando(false);
    }
  };

  // Operação C: Remove o vínculo (DELETE) da tabela intermediária
  const handleRemoverVinculo = async (contratoId: number) => {
  if (!usuarioSelecionado) return;
  if (!window.confirm("Deseja revogar o acesso deste usuário a este contrato?")) return;

  try {
    setCarregando(true);
    setErro(null);
    setSucesso(null); // Boa prática: Limpa o sucesso anterior antes de iniciar

    // CORREÇÃO Semântica: Alterado de .post para .delete
    const res = await axios.delete(`/api/auth/usuario/${usuarioSelecionado.id}/contrato/${contratoId}`);
    
    if (res.data?.sucesso) {
      setSucesso('Acesso revogado com sucesso!');
      await carregarContratosDoUsuario(usuarioSelecionado.id);
    }
  } catch (err: any) {
    console.error('Erro ao remover vínculo:', err);
    // CORREÇÃO UX: Tenta capturar o erro real enviado pelo seu backend
    setErro(err.response?.data?.erro || err.response?.data?.mensagem || 'Falha ao remover o vínculo.');
  } finally {
    setCarregando(false);
  }
};

  const handleSalvarUsuario = async (e?: React.FormEvent) => {
  // 1. BLINDAGEM CRÍTICA: Se o evento nativo existir, anula o comportamento padrão do navegador
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 2. TRINCO FÍSICO: Se o estado já estiver a carregar, mata a segunda chamada imediatamente!
  if (carregando) return;
  if (!usuarioSelecionado || !nomeEditado.trim() || !emailEditado.trim()) return;

  try {
    setCarregando(true); // Tranca a entrada de novos cliques na hora
    setErro(null);
    setSucesso(null);

    const res = await axios.put(`/api/auth/atualizaUsuario/${usuarioSelecionado.id}`, {
      nome: nomeEditado.trim(),
      usuario: usuarioEditado.trim(),
      email: emailEditado.trim(),
      perfil: perfilSelecionado
    });

    if (res.data?.sucesso) {
      setSucesso('Dados do utilizador atualizados com sucesso!');
      
      setUsuarioSelecionado({
        ...usuarioSelecionado,
        nome: nomeEditado.trim(),
        usuario: usuarioEditado.trim(),
        email: emailEditado.trim(),
        perfil: perfilSelecionado
      });

      setModalEditarAberta(false); // Só fecha a modal após o sucesso real da API
    }
  } catch (err: any) {
    console.error('Erro ao atualizar usuário:', err);
    setErro(err.response?.data?.erro || 'Falha ao atualizar os dados do utilizador.');
  } finally {
    setCarregando(false); // Só liberta o trinco quando a ligação terminar a 100%
  }
};

  // Filtros locais
  const usuariosFiltrados = usuarios.filter(u => 
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.usuario?.toLowerCase().includes(busca.toLowerCase())
  );

  const contratosDisponiveis = todosContratos.filter(c => 
    !contratosVinculados.some(v => v.contratoId === c.id)
  );

  return (
    <div className="container my-7 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* CABEÇALHO */}
      <div className="pb-0 mb-0 d-flex justify-content-between align-items-end">
        {/* <div>
          <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2 m-0">
            <Layers size={22} className="text-primary" /> Central de Controle de Usuários e Escopo
          </h2>
          <small className="text-muted">Crie credenciais ou clique em um usuário da lista para gerenciar quais contratos ele pode auditar.</small>
        </div> */}
        
        {/* Botão para forçar o retorno ao modo de cadastro */}
        <button 
          type="button" 
          className="btn btn-sm btn-outline-primary fw-bold"
          onClick={() => { setSubPainelDireito('cadastro'); setUsuarioSelecionado(null); setErro(null); setSucesso(null); }}
        >
          ➕ Novo Usuário
        </button>
      </div>

      <div className="row g-4 m-0">
        
        {/* ====================================================================
            LADO ESQUERDO: LISTAGEM UNIFICADA DE USUÁRIOS
            ==================================================================== */}
        <div className="col-11 col-md-6 p-0 pr-md-3">
          <div className="card p-2 border shadow-sm bg-white rounded-3" style={{ maxWidth: '537px' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 fw-bold text-dark m-0">👥 Contas Ativas ({usuariosFiltrados.length})</h3>
              <div className="input-group input-group-sm" style={{ maxWidth: '200px' }}>
                <span className="input-group-text bg-light text-muted border-end-0"><Search size={14} /></span>
                <input type="text" placeholder="Filtrar operador..." value={busca} onChange={(e) => setBusca(e.target.value)} className="form-control border-start-0 text-start" />
              </div>
            </div>

            <div className="d-flex flex-column gap-2" style={{ maxHeight: '460px', overflowY: 'auto' }}>
              {usuariosFiltrados.map((u) => (
                <div 
                  key={u.id}
                  onClick={() => handleSelecionarUsuario(u)}
                  className="p-2 rounded-0 border text-start d-flex justify-content-between align-items-center transition-all"
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: usuarioSelecionado?.id === u.id ? '#f3f4f6' : '#ffffff',
                    borderLeft: usuarioSelecionado?.id === u.id ? '4px solid #4f46e5' : '1px solid #dee2e6'
                  }}
                >
                  <div>
                    <strong className="text-dark d-block" style={{ fontSize: '0.85rem' }}>{u.nome}</strong>
                    <small className="text-muted font-monospace" style={{ fontSize: '0.68rem' }}>@{u.usuario} | {u.email}</small>
                  </div>
                  <span className={`badge border text-uppercase font-monospace`} style={{ fontSize: '0.6rem', color: u.perfil === 'atendimento' ? '#4f46e5' : '#0d6efd', backgroundColor: u.perfil === 'atendimento' ? '#eef2ff' : '#eaf2ff' }}>
                    {u.perfil}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ====================================================================
            LADO DIREITO: HUB DINÂMICO (CADASTRO OU GERENCIAMENTO DE CARTEIRA)
            ==================================================================== */}
        <div className="col-12 col-md-6 p-0 pl-md-3">
          <div className="card p-2 border shadow-sm bg-white rounded-3 h-100">
            
            {erro && <div className="alert alert-danger p-2 small rounded-3 mb-3">{erro}</div>}
            {sucesso && <div className="alert alert-success p-2 small rounded-3 mb-3">{sucesso}</div>}

            {subPainelDireito === 'cadastro' ? (
              /* ====================================================================
                 VISTA A: FORMULÁRIO DE NOVO CADASTRO
                 ==================================================================== */
              <>
                <h4 className="fs-6 fw-bold text-dark border-bottom pb-2 mb-0 d-flex align-items-center gap-1.5">
                  <UserPlus size={16} className="text-primary" /> Adicionar Operador / Cliente
                </h4>
                
                <form onSubmit={handleCadastrarUsuario}>
                  <div className="mb-2.5">
                    <label className="text-muted small fw-semibold mb-1">Nome Completo</label>
                    <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Lucas Silva" className="form-control text-start form-control-sm" />
                  </div>

                  <div className="mb-2.5">
                    <label className="text-muted small fw-semibold mb-1">Login</label>
                    <input type="text" required value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ex: lucas.silva" className="form-control text-start form-control-sm" />
                  </div>

                  <div className="mb-2.5">
                    <label className="text-muted small fw-semibold mb-1">E-mail</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" className="form-control text-start form-control-sm" />
                  </div>

                  {/* <div className="mb-2.5">
                    <label className="text-muted small fw-semibold mb-1">Senha Inicial</label>
                    <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control text-start form-control-sm" />
                  </div> */}

                  <div className="mb-4">
                    <label className="text-muted small fw-semibold mb-1">Perfil de Acesso</label>
                    <select className="form-select form-select-sm text-start" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
                      <option value="atendimento">🎧 Atendimento (Suporte Técnico)</option>
                      <option value="cliente">🚗 Cliente (Visualização Comercial de Frota)</option>
                    </select>
                  </div>

                  <button type="submit" disabled={carregando} className="btn btn-primary btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2">
                    Cadastrar e Salvar <ArrowRight size={14} />
                  </button>
                </form>
              </>
            ) : (
              /* ====================================================================
                 VISTA B: CENTRAL DE ESCALA E VÍNCULO DE CONTRATOS DO OPERADOR CLICADO
                 ==================================================================== */
              <>
                <h4 className="fs-6 fw-bold text-dark border-bottom pb-2 mb-2 d-flex align-items-center justify-content-between">
                  <span className="d-flex align-items-center gap-1.5"><Building size={16} className="text-primary" /> Carteira Autorizada</span>
                  <span className="text-muted font-monospace small fw-normal" style={{ fontSize: '0.7rem' }}>@{usuarioSelecionado?.usuario}</span>
                </h4>

                  <div className="bg-light p-2 rounded-3 border mb-3 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.6rem', display: 'block' }}>
                      OPERADOR SELECIONADO
                    </span>
                    <strong className="text-dark d-block mt-0.5" style={{ fontSize: '0.95rem' }}>
                      {usuarioSelecionado?.nome}
                    </strong>
                    <span className="badge bg-secondary mt-1" style={{ fontSize: '0.65rem' }}>
                      Perfil: {usuarioSelecionado?.perfil || 'Não definido'}
                    </span>
                  </div>
                
                  <button 
                    type="button" 
                    className="btn btn-outline-primary btn-sm fw-semibold d-flex align-items-center gap-1"
                    onClick={() => {
                      // Carrega os dados atuais nos inputs da modal
                      setNomeEditado(usuarioSelecionado?.nome || '');
                      setUsuarioEditado(usuarioSelecionado?.usuario || '');
                      setEmailEditado(usuarioSelecionado?.email || '');
                      setPerfilSelecionado(usuarioSelecionado?.perfil || 'operador');
                      setModalEditarAberta(true);
                    }}
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                </div>

                {/* ====================================================================
                   MODAL DE EDIÇÃO DE DADOS E PERFIL DO USUÁRIO (CAMPOS EDITÁVEIS)
                   ==================================================================== */}
                {modalEditarAberta && (
                  <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
                      <div className="modal-content border-0 shadow rounded-3 text-start">
                        
                        {/* CABEÇALHO */}
                        <div className="modal-header bg-light border-bottom-0 py-3">
                          <h5 className="modal-title fs-6 fw-bold text-dark">Editar Operador</h5>
                          <button 
                            type="button" 
                            className="btn-close small" 
                            onClick={() => setModalEditarAberta(false)}
                          ></button>
                        </div>
                
                        {/* CORPO DA MODAL */}
                        <div className="modal-body p-4">
                          
                          {/* NOME EDITÁVEL */}
                          <div className="mb-3">
                            <label className="text-muted small fw-semibold mb-1">Nome do Operador</label>
                            <input 
                              type="text" 
                              required
                              value={nomeEditado} 
                              onChange={(e) => setNomeEditado(e.target.value)} 
                              className="form-control form-control-lg fs-6 text-start" 
                              placeholder="Digite o nome completo"
                            />
                          </div>

                           {/*USUARIO EDITÁVEL */}
                          <div className="mb-3">
                            <label className="text-muted small fw-semibold mb-1">Usuario</label>
                            <input 
                              type="usuario" 
                              required
                              value={usuarioEditado} 
                              onChange={(e) => setUsuarioEditado(e.target.value)} 
                              className="form-control form-control-lg fs-6 text-start" 
                              placeholder="Usuario"
                            />
                          </div>
                
                          {/* E-MAIL EDITÁVEL */}
                          <div className="mb-3">
                            <label className="text-muted small fw-semibold mb-1">E-mail Corporativo</label>
                            <input 
                              type="email" 
                              required
                              value={emailEditado} 
                              onChange={(e) => setEmailEditado(e.target.value)} 
                              className="form-control form-control-lg fs-6 text-start" 
                              placeholder="nome@empresa.com"
                            />
                          </div>
                
                          {/* COMBOBOX DE PERFIL */}
                          <div className="mb-2">
                            <label className="text-dark small fw-bold mb-1.5 d-block">Perfil de Acesso</label>
                            <select 
                              className="form-select form-select-lg fs-6"
                              value={perfilSelecionado}
                              onChange={(e) => setPerfilSelecionado(e.target.value)}
                            >
                              <option value="admin">🔑 admin</option>
                              <option value="cliente">📄 cliente</option>
                              <option value="atendimento">👁️ atendimento</option>
                            </select>
                          </div>
                        </div>
                
                        {/* RODAPÉ / AÇÕES */}
                        <div className="modal-footer border-top-0 p-3 pt-0 d-flex gap-2">
                          <button 
                            type="button" 
                            className="btn btn-light fw-semibold flex-grow-1" 
                            onClick={() => setModalEditarAberta(false)}
                          >
                            Cancelar
                          </button>
                          
                          <button 
                            type="button" 
                            disabled={carregando || !nomeEditado.trim() || !emailEditado.trim()}
                            className="btn btn-primary fw-bold flex-grow-1" 
                            onClick={(e) => handleSalvarUsuario(e)} // 🌟 PASSA O EVENTO AQUI
                          >
                            {carregando ? 'A salvar...' : 'Salvar Alterações'}
                          </button>

                
                        </div>
                
                      </div>
                    </div>
                  </div>
                )}


                {/* Dropdown de Adicionar Novo Vínculo */}
                {usuarioSelecionado?.perfil === 'cliente' && 
                <form onSubmit={handleAdicionarVinculo} className="row g-2 align-items-end border-bottom pb-3 mb-2">
                  <div className="col text-start">
                    <label className="text-muted small fw-semibold mb-1">Vincular Nova Conta/Contrato:</label>
                    <select required className="form-select form-select-sm text-start" value={contratoSelecionadoId} onChange={(e) => setContratoSelecionadoId(e.target.value)}>
                      <option value="">Selecione um contrato do ecossistema...</option>
                      {contratosDisponiveis.map(c => (
                        <option key={c.id} value={c.id}>Contrato #{c.id} - {c.nome_empresa || "Sem Nome"} (CNPJ: {c.cnpj || "---"})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-auto">
                    <button type="submit" disabled={carregando || !contratoSelecionadoId} className="btn btn-sm btn-primary py-2 fw-bold d-flex align-items-center gap-1">
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </form> }

                {/* Grade Rolável das Autorizações do Operador */}
                
                <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {contratosVinculados.length > 0  ? (
                    contratosVinculados.map((v) => (
                      <div key={v.id} className="p-2 rounded-3 border bg-light bg-opacity-25 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ fontSize: '0.9rem' }}>🏢</span>
                          <div>
                            <strong className="text-dark" style={{ fontSize: '0.78rem' }}>Contrato #{v.contratoId}</strong>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '0.65rem', maxWidth: '180px' }}>
                              {v.nome_empresa || "Razão Social indisponível"}
                            </small>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoverVinculo(v.contratoId)} className="btn btn-sm btn-light border text-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px' }} title="Revogar acesso">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted border border-dashed rounded-3 bg-light small">
                      ⚠️ Conta isolada. Usuário não possui nenhum contrato vinculado.
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>

      </div> {/* Fecha row geral */}
    </div> /* Fecha container mestre */
  );
};

