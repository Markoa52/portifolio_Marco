import React, { useState, useMemo, useEffect } from 'react';
import type { IEmailRegistro } from '../types/index.ts';

interface IGerenciadorProps {
  dadosIniciais: IEmailRegistro[];
}

export const Gerenciador: React.FC<IGerenciadorProps> = ({ dadosIniciais }) => {
  const [dadosLocais, setDadosLocais] = useState<IEmailRegistro[]>([]);
  const [pesquisa, setPesquisa] = useState<string>('');
  const [modalAberto, setModalFormulario] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  const [indexEdicao, setIndexEdicao] = useState<number>(-1);
  const [inputData, setInputData] = useState<string>('');
  const [inputAssunto, setInputAssunto] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputAcoes, setInputAcoes] = useState<string>('');

  const [salvando, setSalvando] = useState<boolean>(false);
  const [paginaAtualCRUD, setPaginaAtualCRUD] = useState<number>(1);
  const registrosPorPaginaCRUD = 5;

  useEffect(() => { setDadosLocais(dadosIniciais); }, [dadosIniciais]);
  useEffect(() => { setPaginaAtualCRUD(1); }, [pesquisa]);

  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => setMensagem(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const dadosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();
    if (!termo) return dadosLocais;
    return dadosLocais.filter(item =>
      item.assunto.toLowerCase().includes(termo) || item.email.toLowerCase().includes(termo)
    );
  }, [pesquisa, dadosLocais]);

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

  return (
 <div className="main-content-wrapper">   
 <h2 className="titulo-com-linha">⚙️ Gerenciador de Automações e Fluxos</h2>   

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
                    {itensDaPaginaCRUD.map((item) => {
                      const indiceRealAbsoluto = dadosLocais.indexOf(item);
                      return (
                        <tr key={indiceRealAbsoluto}>
                          <td className="celula-data">{item.data}</td>
                          <td className="celula-assunto">{item.assunto}</td>
                          <td className="celula-email">{item.email}</td>
                          <td className="celula-acoes-texto">{item.acoes}</td>
                          <td className="coluna-acoes-botoes">
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
  );
};
