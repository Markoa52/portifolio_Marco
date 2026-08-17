import React, { useState, useMemo, useEffect } from 'react';
import type { IEmailRegistro } from '../types/index.ts';
import '../styles/editarUsuario.css';
import type { PaginaTipo, AbaInferior } from './contrato.tsx'; 

interface IGerenciadorProps {
  dadosIniciais?: IEmailRegistro[];
  setPaginaAtiva?: (pagina: PaginaTipo) => void;
  setAbaAtiva?: (aba: AbaInferior) => void;
}

export const EditarUsuario: React.FC<IGerenciadorProps> = ({ setAbaAtiva, dadosIniciais }) => {

// 2. A função que o seu botão "Listar usuários" vai disparar
const listarUsuarios = () => {
  console.log("Navegando para a aba de listagem...");
  
  // O TypeScript agora aceita perfeitamente porque 'usuario' faz parte do tipo oficial AbaInferior!
  setAbaAtiva && setAbaAtiva('usuario');  
};
  const [dadosSharePoint, setDadosSharePoint] = useState<IEmailRegistro[]>([]);
  const [, setCarregando] = useState<boolean>(true);
  const [, setErro] = useState<string | null>(null);
// MONITOR DE ÁREA ÚTIL: O React descobre o tamanho real do ecrã a cada milissegundo!

  const [larguraJanela, setLarguraJanela] = useState<number>(window.innerWidth);

  useEffect(() => {
    const tratarRedimensionamento = () => setLarguraJanela(window.innerWidth);
    window.addEventListener('resize', tratarRedimensionamento);
    
    async function puxarDadosDoExpress() {
      try {
        setCarregando(true);

        //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
        const resposta = await fetch('http://localhost:3000/api/dados', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
        });

        if (!resposta.ok) throw new Error(`Erro no servidor: Status ${resposta.status}`);
        const resultado = await resposta.json();

        //Nesse ponto popula a interface com os dados que retornaram da rota da API(back-end)
        const dadosNormalizados: IEmailRegistro[] = resultado.map((item: any) => ({
          data: item.Data || item.data || '-',
          assunto: item.Assunto || item.assunto || '-',
          email: item.Email || item.email || '-',
          acoes: item.Acoes || item.acoes || '-'
        }));
        setDadosSharePoint(dadosNormalizados);
      } catch (err: any) {
        console.error(err);
        setErro(err.message || "Falha na conexão.");
      } finally {
        setCarregando(false);
      }
    }

    puxarDadosDoExpress();

    return () => window.removeEventListener('resize', tratarRedimensionamento);
  }, []);

    //Deteta se o utilizador está num ecrã de computador ou num smartphone/tablet
   const isMobile = larguraJanela <= 1024;

  const [dadosLocais, setDadosLocais] = useState<IEmailRegistro[]>(dadosIniciais ?? []);
  const [pesquisa, setPesquisa] = useState<string>('');
  const [modalAberto, setModalFormulario] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);
  const [registroSelecionado, setRegistroSelecionado] = useState<IEmailRegistro | null>(null);
  
  const [indexEdicao, setIndexEdicao] = useState<number>(-1);
  const [inputData, setInputData] = useState<string>('');
  const [inputAssunto, setInputAssunto] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputAcoes, setInputAcoes] = useState<string>('');

  const [salvando, setSalvando] = useState<boolean>(false);
  const [paginaAtualCRUD, setPaginaAtualCRUD] = useState<number>(1);
  const registrosPorPaginaCRUD = 5;

  useEffect(() => { setDadosLocais(dadosIniciais ?? []); }, [dadosIniciais]);
  useEffect(() => { setPaginaAtualCRUD(1); }, [pesquisa]);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

 const dadosFiltrados = useMemo(() => {
    // Se você salvou em dadosSharePoint, ele deve filtrar em cima de dadosSharePoint!
    return dadosSharePoint.filter((item) => {
      return (
        item.assunto?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        item.email?.toLowerCase().includes(pesquisa.toLowerCase())
      );
    });
  }, [dadosSharePoint, pesquisa]);

  const totalPaginasCRUD = Math.ceil(dadosFiltrados.length / registrosPorPaginaCRUD);
  const indiceInicialCRUD = (paginaAtualCRUD - 1) * registrosPorPaginaCRUD;
  
  const itensDaPaginaCRUD = useMemo(() => {
    return dadosFiltrados.slice(indiceInicialCRUD, indiceInicialCRUD + registrosPorPaginaCRUD);
  }, [dadosFiltrados, paginaAtualCRUD]);

  const abrirInclusao = () => {
    setIndexEdicao(-1); setInputData(''); setInputAssunto(''); setInputEmail(''); setInputAcoes('');
    setModalFormulario(true);
  };

  const abrirEdicao = (idxReal: number) => {
    const item = dadosLocais[idxReal];
    setIndexEdicao(idxReal); setInputData(item.data); setInputAssunto(item.assunto); setInputEmail(item.email); setInputAcoes(item.acoes);
    setModalFormulario(true);
  };

  const fecharFormulario = () => { setModalFormulario(false); };

  const confirmarAcaoFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    const novoRegistro: IEmailRegistro = { data: inputData, assunto: inputAssunto, email: inputEmail, acoes: inputAcoes };
    if (indexEdicao === -1) {
      setDadosLocais([...dadosLocais, novoRegistro]);
    } else {
      const novaLista = [...dadosLocais];
      novaLista[indexEdicao] = novoRegistro;
      setDadosLocais(novaLista);
    }
    fecharFormulario();
  };

  const removerLinha = (idxReal: number) => {
    if (window.confirm("Deseja remover este registro?")) {
      setDadosLocais(dadosLocais.filter((_, i) => i !== idxReal));
    }
  };

  const enviarDadosParaServidor = async () => {
    try {
      setSalvando(true);
      const payload = dadosLocais.map(item => ({ Data: item.data, Assunto: item.assunto, Email: item.email, Acoes: item.acoes }));

      //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
      await fetch('/api/salvar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      
      setMensagem({ texto: "🎉 Sincronizado com sucesso no SharePoint!", tipo: 'sucesso' });
    } catch {
      setMensagem({ texto: "❌ Falha ao salvar", tipo: 'erro' });
    } finally { setSalvando(false); }
  };

  // SE O USUÁRIO CLICAR EM "VER DETALHES"
  if (registroSelecionado) {
    return (
      <div className="main-content-wrapper">      
        <div className="header-container-sistema-bloco">
          <h2 className="titulo-gerenciador-fluxos">🔍 Visualizar Detalhes do Registro</h2>
          
          <div className="botoes-topo-gerenciador-esquerda">
            <button 
              className="btn-crud" 
              style={{ backgroundColor: '#e63946', color: '#fff' }} 
              onClick={() => setRegistroSelecionado(null)} 
            >
              ⬅️ Voltar para a Listagem
            </button>
          </div>
        </div>
        <div style={{ padding: '20px', background: '#2d2d2d', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
          <h3 style={{ color: '#3399ff', marginTop: 0 }}>Informações Estruturadas</h3>
          <p style={{ color: '#fff' }}><strong>Assunto:</strong> {registroSelecionado.assunto}</p>
          <p style={{ color: '#aaa' }}><strong>Remetente:</strong> {registroSelecionado.email}</p>
          <p style={{ color: '#aaa' }}><strong>Data de Processamento:</strong> {registroSelecionado.data}</p>
        </div>
      </div>
    );
  }

  return (
  // container-fluid limpa os styles inline pesados antigos e centraliza com a largura de 1200px
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">⚙️ Gerenciar Usuários</h2>
    </div>

    {/* PAINEL OPERACIONAL (Fundo branco igual aos seus outros cards) */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100 mb-4">
      
      {/* BARRA DE FERRAMENTAS: Pesquisa e Botões alinhados */}
      <div className="row g-3 align-items-center mb-3">
        {/* Input de Pesquisa ocupando 5 colunas */}
        <div className="col-md-5">
          <input 
            type="text" 
            className="form-control" 
            placeholder="🔍 Pesquisar por assunto ou e-mail..." 
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
          />
        </div>

        {/* Grupo de botões organizados e com as cores pretas/cinzas corporativas */}
        <div className="col-md-7 d-flex justify-content-md-end gap-2 flex-wrap">
          <button className="btn btn-outline-dark btn-sm fw-semibold px-3 py-2" onClick={listarUsuarios}>
            📋 Listar usuários
          </button>
          <button className="btn btn-outline-dark btn-sm fw-semibold px-3 py-2" onClick={abrirInclusao}>
            ➕ Incluir Registro
          </button>
          <button className="btn btn-dark btn-sm fw-semibold px-3 py-2" onClick={enviarDadosParaServidor} disabled={salvando}>
            {salvando ? "⏳ Sincronizando..." : "💾 Salvar Registro"}
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
                    <th style={{ width: '15%' }}>Data</th>
                    <th style={{ width: '30%' }}>Assunto</th>
                    <th style={{ width: '25%' }}>Email</th>
                    <th style={{ width: '15%' }}>Ação</th>
                    <th className="text-center" style={{ width: '15%' }}>Operações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensDaPaginaCRUD.map((item, index) => {
                    const indiceRealAbsoluto = dadosLocais.indexOf(item) !== -1 ? dadosLocais.indexOf(item) : index;
                    return (
                      <tr key={indiceRealAbsoluto}>
                        <td className="text-dark fw-medium">{item.data}</td>
                        <td className="text-secondary">{item.assunto}</td>
                        <td className="text-secondary">{item.email}</td>
                        <td>
                          <span className="badge bg-light border text-dark fw-normal">{item.acoes}</span>
                        </td>
                        {/* Ações com botões de ícone limpos e sem cores pesadas */}
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-light btn-sm border" title="Visualizar" onClick={() => setRegistroSelecionado(item)}>🔍</button>
                            <button className="btn btn-light btn-sm border" title="Editar" onClick={() => abrirEdicao(indiceRealAbsoluto)}>✏️</button>
                            <button className="btn btn-light btn-sm border text-danger" title="Excluir" onClick={() => removerLinha(indiceRealAbsoluto)}>🗑️</button>
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

    {/* MODAL FLUTUANTE DE INCLUSÃO/EDIÇÃO DO BOOTSTRAP */}
    {modalAberto && (
      // Classes 'modal d-block' e fundo escurecido 'rgba(0,0,0,0.5)' criam o efeito flutuante real nativo
      <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 p-2">
            
            <div className="modal-header border-0 pb-1">
              <h5 className="modal-title fw-bold text-dark fs-5">
                {indexEdicao === -1 ? '📝 Incluir Registro' : '✏️ Editar Registro'}
              </h5>
              <button type="button" className="btn-close" onClick={fecharFormulario}></button>
            </div>
            
            <form onSubmit={confirmarAcaoFormulario} className="modal-body pt-2 text-start">
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">Data:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputData} onChange={(e) => setInputData(e.target.value)} required />
              </div>
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">Assunto:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputAssunto} onChange={(e) => setInputAssunto(e.target.value)} required />
              </div>
              <div className="mb-2.5">
                <label className="form-label small fw-bold text-secondary mb-1">E-mail:</label>
                <input type="email" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary mb-1">Ações / Status:</label>
                <input type="text" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} value={inputAcoes} onChange={(e) => setInputAcoes(e.target.value)} />
              </div>
              
              <div className="d-flex flex-column gap-2 border-top pt-3 mt-2">
                <button type="submit" className="btn btn-dark fw-semibold py-2" style={{ fontSize: '0.9rem' }}>
                  {indexEdicao === -1 ? 'Adicionar à Lista' : 'Atualizar Linha'}
                </button>
                <button type="button" className="btn btn-light border text-secondary fw-semibold py-2" style={{ fontSize: '0.9rem' }} onClick={fecharFormulario}>
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
