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
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        width: '100%',            
        height: '100vh',          /* FORÇA a altura estrita do monitor para prender o layout */
        backgroundColor: '#121212',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'        /* PROÍBE a página global de rolar e mexer o Sidebar */
      }}
    >
      <div 
        className="main-content"
        style={{ 
          flex: 1, 
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          height: '100%',         /* Ocupa a altura total disponível ao lado do sidebar */
          padding: isMobile ? '12px' : '20px 25px', 
          overflowY: 'auto',      /* MÁGICA: A rolagem vertical acontece EXCLUSIVAMENTE aqui dentro */
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}
      >
 <div className="main-content-wrapper">   
 <h2>⚙️ Gerenciar Usuários</h2>   

  <div className="painel-operacional">
  {/* Envelopa o seu input de pesquisa existente junto com os dois botões */}
  <div className="ferramentas-tabela">
   <div className="grupo-operacional-pesquisa">
    <input 
      type="text" 
      id="inputPesquisa" 
      placeholder="🔍 Pesquisar por assunto ou e-mail..." 
      value={pesquisa} 
      onChange={(e) => setPesquisa(e.target.value)} 
    />
    
    <button className="btn-crud btn-adicionar" onClick={abrirInclusao}>
      ➕ Incluir Registro
    </button>
    
    <button className="btn-crud btn-salvar-lote" onClick={enviarDadosParaServidor} disabled={salvando}>
      {salvando ? "⏳ Sincronizando..." : "💾 Salvar Registro"}
    </button>

        <button className="btn-crud btn-adicionar" onClick={listarUsuarios}>
        Listar usuários
    </button>

  </div>
  </div>

  {mensagem && (
  <div 
    className="mensagem-status" 
    style={{ 
      display: 'block', 
      backgroundColor: mensagem.tipo === 'sucesso' ? 'rgba(46, 196, 182, 0.2)' : 'rgba(230, 57, 70, 0.2)', 
      color: mensagem.tipo === 'sucesso' ? '#2ec4b6' : '#e63946', 
      border: mensagem.tipo === 'sucesso' ? '1px solid #2ec4b6' : '1px solid #e63946' // 🌟 CORREÇÃO: Alterado de "message" para "mensagem"
    }}
  >
    {mensagem.texto}
  </div>
)}
        <div id="containerTabelaCrud">
          {dadosFiltrados.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '15px 0' }}>Nenhum registro encontrado.</p>
          ) : (
            <>
              {/* MOLDURA DE SEGURANÇA COM SCROLL ISOLADO MÓVEL ── */}
              <div className="tabela-scroll-container">
                <table className="tabela-sistema">
                  <thead>
                    <tr>
                      <th className="col-data">Data</th>
                      <th className="col-assunto">Assunto</th>
                      <th className="col-email">Email</th>
                      <th className="col-acoes-texto">Ação</th>
                      <th className="col-operacoes">Operações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itensDaPaginaCRUD.map((item, index) => {
                      const indiceRealAbsoluto = dadosLocais.indexOf(item) !== -1 ? dadosLocais.indexOf(item) : index;
                      return (
                        <tr key={indiceRealAbsoluto}>
                          <td className="celula-data">{item.data}</td>
                          <td className="celula-assunto">{item.assunto}</td>
                          <td className="celula-email">{item.email}</td>
                          <td className="celula-acoes-texto">{item.acoes}</td>
                          <td className="coluna-acoes-botoes">
                            <button className="btn-ver" onClick={() => setRegistroSelecionado(item)}>🔍</button>
                            <button className="btn-acao-tabela btn-edit" onClick={() => abrirEdicao(indiceRealAbsoluto)}>✏️</button>
                            <button className="btn-acao-tabela btn-del" onClick={() => removerLinha(indiceRealAbsoluto)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div id="paginacaoContainer">
                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                  A mostrar {indiceInicialCRUD + 1} a {Math.min(indiceInicialCRUD + registrosPorPaginaCRUD, dadosFiltrados.length)} de {dadosFiltrados.length} registros (Página {paginaAtualCRUD}/{totalPaginasCRUD || 1})
                </span>
                <div className="botoes-paginacao">
                  <button className="btn-ver" disabled={paginaAtualCRUD === 1} onClick={() => setPaginaAtualCRUD(prev => prev - 1)}>Anterior</button>
                  <button className="btn-ver" disabled={paginaAtualCRUD === totalPaginasCRUD || totalPaginasCRUD === 0} onClick={() => setPaginaAtualCRUD(prev => prev + 1)}>Próximo</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {modalAberto && (
        <div className="modal-formulario">
          <div className="modal-conteudo">
            <h3 className="titulo-painel">{indexEdicao === -1 ? '📝 Incluir Registro' : '✏️ Editar Registro'}</h3>
            <form onSubmit={confirmarAcaoFormulario}>
              <div className="form-grupo"><label>Data:</label><input type="text" className="form-input" value={inputData} onChange={(e) => setInputData(e.target.value)} required /></div>
              <div className="form-grupo"><label>Assunto:</label><input type="text" className="form-input" value={inputAssunto} onChange={(e) => setInputAssunto(e.target.value)} required /></div>
              <div className="form-grupo"><label>E-mail:</label><input type="email" className="form-input" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} required /></div>
              <div className="form-grupo"><label>Ações / Status:</label><input type="text" className="form-input" value={inputAcoes} onChange={(e) => setInputAcoes(e.target.value)} /></div>
              <button type="submit" className="btn-crud btn-adicionar" style={{ width: '100%', marginBottom: '10px' }}>{indexEdicao === -1 ? 'Adicionar à Lista' : 'Atualizar Linha'}</button>
              <button type="button" className="btn-crud" style={{ backgroundColor: '#444', color: '#fff', width: '100%' }} onClick={fecharFormulario}>Fechar</button>
            </form>
          </div>
        </div>
      )}
      
    </div>
          </div>
    </div>
  );
};
