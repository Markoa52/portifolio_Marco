import React, { useState, useEffect } from 'react';
import { UserPlus, Search, ArrowRight, Plus, Trash2, Building, Layers } from 'lucide-react';
import axios from 'axios';

export const GestaoUsuarios: React.FC = () => {
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
      const resposta = await axios.get('http://localhost:3000/api/auth/usuarios');
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
      const res = await axios.get('http://localhost:3000/api/contratos');
      setTodosContratos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao buscar contratos globais:", err);
    }
  };

  // 3. Carrega as carteiras que o usuário clicado possui direito
  const carregarContratosDoUsuario = async (usuarioId: number) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/auth/usuarios/${usuarioId}/contratos`);
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

      const resposta = await axios.post('http://localhost:3000/api/auth/primeiro-acesso', payload);

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
      const res = await axios.post('http://localhost:3000/api/auth/usuarios/vincular-contrato', {
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
      const res = await axios.delete(`http://localhost:3000/api/usuarios/${usuarioSelecionado.id}/contratos/${contratoId}`);
      if (res.data?.sucesso) {
        setSucesso('Acesso revogado com sucesso!');
        await carregarContratosDoUsuario(usuarioSelecionado.id);
      }
    } catch (err) {
      setErro('Falha ao remover o vínculo.');
    } finally {
      setCarregando(false);
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
    <div className="container my-4 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* CABEÇALHO */}
      <div className="border-bottom pb-2 mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2 m-0">
            <Layers size={22} className="text-primary" /> Central de Controle de Usuários e Escopo
          </h2>
          <small className="text-muted">Crie credenciais ou clique em um usuário da lista para gerenciar quais contratos ele pode auditar.</small>
        </div>
        
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
        <div className="col-12 col-md-6 p-0 pr-md-3">
          <div className="card p-3 border shadow-sm bg-white rounded-3">
            
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
                  className="p-2.5 rounded-3 border text-start d-flex justify-content-between align-items-center transition-all"
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
          <div className="card p-4 border shadow-sm bg-white rounded-3 h-100">
            
            {erro && <div className="alert alert-danger p-2 small rounded-3 mb-3">{erro}</div>}
            {sucesso && <div className="alert alert-success p-2 small rounded-3 mb-3">{sucesso}</div>}

            {subPainelDireito === 'cadastro' ? (
              /* ====================================================================
                 VISTA A: FORMULÁRIO DE NOVO CADASTRO
                 ==================================================================== */
              <>
                <h4 className="fs-6 fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-1.5">
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

                  <div className="mb-2.5">
                    <label className="text-muted small fw-semibold mb-1">Senha Inicial</label>
                    <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="******" className="form-control text-start form-control-sm" />
                  </div>

                  <div className="mb-3.5">
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

                <div className="bg-light p-2.5 rounded-3 border mb-3">
                  <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.6rem' }}>OPERADOR SELECIONADO</span>
                  <strong className="text-dark d-block mt-0.5" style={{ fontSize: '0.95rem' }}>{usuarioSelecionado?.nome}</strong>
                </div>

                {/* Dropdown de Adicionar Novo Vínculo */}
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
                </form>

                {/* Grade Rolável das Autorizações do Operador */}
                <div className="d-flex flex-column gap-2 mt-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {contratosVinculados.length > 0 ? (
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

