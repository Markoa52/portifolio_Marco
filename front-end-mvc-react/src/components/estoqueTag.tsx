import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TelaTransferenciaTagProps {
  idContratoOrigem: number | null;
  usuarioLogado: any; // 💡 Adicionada
  setPaginaAtiva: (pagina: string) => void;
}

export function TransferenciaTag({ idContratoOrigem, usuarioLogado, setPaginaAtiva }: TelaTransferenciaTagProps) {
  // Estados para Tags (Origem)
  const [tagsOrigem, setTagsOrigem] = useState<any[]>([]);
  const [tagSelecionada, setTagSelecionada] = useState<any>(null);
  const [carregandoTags, setCarregandoTags] = useState(false);

  // Estados para Busca de Contratos (Destino)
  const [termoBuscaContrato, setTermoBuscaContrato] = useState('');
  const [contratosEncontrados, setContratosEncontrados] = useState<any>([]);
  const [contratoDestino, setContratoDestino] = useState<any>(null);
  const [buscandoContrato] = useState(false);

  const [listaContratosBruta, setListaContratosBruta] = useState<any[]>([]);

  // Estado Geral de Processamento
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
  async function carregarContratosValidos() {
    // TRAVA: Se o objeto ou o ID do usuário não existirem ainda, interrompe o disparo
    if (!usuarioLogado || !usuarioLogado.id) return;
    
    try {
      // 📡 Dispara garantindo que o ID vai preenchido na URL
      const resposta = await axios.get(`http://localhost:3000/api/contrato/${usuarioLogado.id}/contratos-vinculados`);
      const dadosContratos = Array.isArray(resposta.data) ? resposta.data : [];
      
      setListaContratosBruta(dadosContratos);
      const iniciais = dadosContratos.filter((c: any) => Number(c.id) !== Number(idContratoOrigem));
      setContratosEncontrados(iniciais);
    } catch (err) {
      console.error("Erro ao carregar contratos vinculados do servidor:", err);
    }
  }

  carregarContratosValidos();
}, [usuarioLogado, idContratoOrigem]);


  // 1. Carrega as tags pertencentes ao contrato atual (Origem)
  const carregarTagsOrigem = async () => {
    if (!idContratoOrigem) return;
    try {
      setCarregandoTags(true);
      // Rota fictícia baseada nos seus padrões de listagem por ID de contrato
      const resposta = await axios.get(`http://localhost:3000/api/tag/estoque/${idContratoOrigem}`);

      console.log('idContratoOrigem', idContratoOrigem)

      setTagsOrigem(Array.isArray(resposta.data) ? resposta.data : []);

    } catch (err) {
      console.error('Erro ao carregar tags do contrato de origem:', err);
      toast.error('Não foi possível carregar as tags do contrato atual.');

    } finally {
      setCarregandoTags(false);
    }
  };

  useEffect(() => {
    carregarTagsOrigem();
  }, [idContratoOrigem]);

  // 2. Busca contratos na base de dados global por número ou nome
  const buscarContratosDestino = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!termoBuscaContrato.trim()) {
    const todosAsOpcoes = listaContratosBruta.filter((c: any) => Number(c.id) !== Number(idContratoOrigem));
    setContratosEncontrados(todosAsOpcoes);
    return;
  }

  const resultadoFiltrado = listaContratosBruta.filter((c: any) => {
    const naoEOrigem = Number(c.id) !== Number(idContratoOrigem);
    const termo = termoBuscaContrato.toLowerCase();
    
    // AGORA SIM! Como a query traz as colunas certas, nenhuma linha dará undefined
    const bateId = String(c.id).includes(termo);
    const bateCnpj = c.cnpj ? String(c.cnpj).includes(termo) : false;
    const bateEmpresa = c.nomeEmpresa ? String(c.nomeEmpresa).toLowerCase().includes(termo) : false;

    return naoEOrigem && (bateId || bateCnpj || bateEmpresa);
  });

  setContratosEncontrados(resultadoFiltrado);
};

  // CORREÇÃO 1: Esta chaveta AGORA fecha corretamente a função buscarContratosDestino!
  // CORREÇÃO 2: O useEffect agora fica livre na raiz do componente, como manda a regra do React
  useEffect(() => {
    if (usuarioLogado?.contratos) {
      // Lista de início todos os contratos do usuário, ocultando o de origem
      const iniciais = usuarioLogado.contratos.filter((c: any) => Number(c.id) !== Number(idContratoOrigem));
      setContratosEncontrados(iniciais);
    }
  }, [usuarioLogado, idContratoOrigem]);

  // 3. Executa a transferência disparando o payload estruturado
  const handleEfetuarTransferencia = async () => {
    if (!tagSelecionada || !contratoDestino) {
      toast.warn('Selecione uma Tag e um Contrato de destino antes de transferir.');
      return;
    }

    try {
      setProcessando(true);

      const payload = {
        metadata: {
          protocoloId: `PROT-TR-Format(Date.now())`,
          acao: 'atualizar',
          criadoEm: new Date().toISOString()
        },
        contextoTransferencia: {
          tagId: tagSelecionada.id,
          numeroTag: tagSelecionada.serial || tagSelecionada.codigo,
          contratoOrigemId: idContratoOrigem,
          contratoDestinoId: contratoDestino.id,
          tipoAcao: 'transferirTag'
        }
      };

      // Dispara para a sua rota ou fila que processa ações relacionais
      const resposta = await axios.post('http://localhost:3000/api/tag/acoes', payload);

      if (resposta.data.sucesso || resposta.status === 200) {
        toast.success(`🎉 Tag transferida com sucesso para o Contrato ${contratoDestino.numero || contratoDestino.id}!`);
        
        // Limpa as seleções e recarrega a lista de origem
        setTagSelecionada(null);
        setContratoDestino(null);
        setContratosEncontrados([]);
        setTermoBuscaContrato('');
        carregarTagsOrigem();
      }
    } catch (err: any) {
      console.error('Erro ao transferir tag:', err);
      toast.error(err.response?.data?.erro || 'Erro ao processar a transferência da tag.');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="container-fluid p-3 text-start">
      {/* Cabeçalho de Navegação */}
      <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
        <button type="button" onClick={() => setPaginaAtiva('contrato')} className="btn btn-link p-0 text-secondary text-decoration-none">
          <ArrowLeft size={20} />
        </button>
        <h2 className="fs-5 fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <Layers className="text-primary" size={20} /> Transferência de Tags entre Contratos
        </h2>
      </div>

      <div className="row g-4">
        {/* COLUNA 1: VISUALIZAÇÃO E SELEÇÃO DAS TAGS DO CONTRATO ATUAL */}
        <div className="col-md-6">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white">
            <h3 className="fs-6 fw-bold text-dark mb-1">1. Selecione a Tag de Origem</h3>
            <p className="text-muted small mb-0">Listagem de tags ativas vinculadas a este contrato:</p>

            {carregandoTags ? (
              <div className="text-center py-4 text-muted small"><RefreshCw className="spinner-border spinner-border-sm me-2 animate-spin" /> Carregando tags...</div>
            ) : tagsOrigem.length === 0 ? (
              <div className="alert alert-light border text-center text-muted small py-4">Nenhuma tag disponível para transferência neste contrato.</div>
            ) : (
              <div className="list-group overflow-y-auto" style={{ maxHeight: '280px' }}>
                {tagsOrigem.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setTagSelecionada(tag)}
                    className={`list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center p-2.5 rounded-3 mb-1 small ${
                      tagSelecionada?.id === tag.id ? 'active border-primary' : 'border-light-subtle'
                    }`}
                  >
                    <div>
                      <span className="fw-bold d-block">📟 Tag: {tag.serial || tag.codigo || `#${tag.id}`}</span>
                      <small className={tagSelecionada?.id === tag.id ? 'text-white-50' : 'text-muted'}>
                        {tag.disponivel===1 ? 'Em estoque' : 'Emutilização'}
                      </small>
                    </div>
                    {tagSelecionada?.id === tag.id && <CheckCircle size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA 2: PROCURAR E SELECIONAR CONTRATO DE DESTINO */}
        <div className="col-md-6">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white d-flex flex-column justify-content-between">
            <div>
              <h3 className="fs-6 fw-bold text-dark mb-1">2. Procurar Contrato de Destino</h3>
              <p className="text-muted small mb-3">Busque o contrato que receberá a tag selecionada:</p>

              {/* Formulário de Busca */}
              <form onSubmit={buscarContratosDestino} className="input-group mb-3">
                <input
                  type="text"
                  className="form-control small"
                  placeholder="Ex: Número do contrato ou Nome do cliente"
                  value={termoBuscaContrato}
                  onChange={(e) => setTermoBuscaContrato(e.target.value)}
                  disabled={buscandoContrato}
                />
                <button className="btn btn-dark d-flex align-items-center justify-content-center gap-1 px-3" type="submit" disabled={buscandoContrato}>
                  {buscandoContrato ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />} Pesquisar
                </button>
              </form>

              {/* Resultado da Busca de Contratos */}
              <div className="list-group overflow-y-auto mb-2" style={{ maxHeight: '180px' }}>
                {/* CORREÇÃO SECO: Só roda o .map se contratosEncontrados for um Array legítimo */}
                {Array.isArray(contratosEncontrados) && contratosEncontrados.map((contrato: any) => (
                  <button
                    key={contrato.id}
                    type="button"
                    onClick={() => setContratoDestino(contrato)}
                    className={`list-group-item list-group-item-action text-start d-flex justify-content-between align-items-center p-2.5 rounded-3 mb-1 small ${
                      contratoDestino?.id === contrato.id ? 'bg-dark text-white border-dark' : 'border-light-subtle'
                    }`}
                  >
                    <div>
                      {/* CORREÇÃO 1: Usa o 'id' direto do contrato já que não há coluna 'numero' */}
                      <span className="fw-bold d-block">
                        📄 Contrato Nº {contrato.id}
                      </span>
                      
                      {/* CORREÇÃO 2: Usa 'nomeEmpresa' e 'cnpj' que vêm confirmados no seu JSON */}
                      <small className={contratoDestino?.id === contrato.id ? 'text-white-50' : 'text-muted'}>
                        Empresa: {contrato.nomeEmpresa || 'Sem nome'} | CNPJ: {contrato.cnpj || '-'}
                      </small>
                    </div>
                    
                    {/* CORREÇÃO 3: Garante que a marca de seleção (CheckCircle) valida o ID correto */}
                    {contratoDestino?.id === contrato.id && <CheckCircle size={16} className="text-white" />}

                    {contratoDestino?.id === contrato.id && <CheckCircle size={16} className="text-white" />}
                  </button>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCO 3: RESUMO CONSOLIDADO E BOTÃO DE EVENTO (EXECUÇÃO) */}
      <div className="card p-3 mt-3 shadow-sm border border-light-subtle bg-light">
        <h3 className="fs-6 fw-bold text-dark mb-3">3. Resumo da Operação</h3>
        
        <div className="row g-3 text-center mb-4">
          <div className="col-md-5">

        <div className="row g-3 text-center align-items-center mb-4">
          {/* Tag de Origem */}
          <div className="col-md-5">
            <div className="p-3 bg-white rounded-3 border border-light-subtle">
              <span className="d-block text-muted small fw-semibold text-uppercase mb-1">Tag a Transferir</span>
              <span className="fs-6 fw-bold text-dark">
                {tagSelecionada ? `📟 ${tagSelecionada.serial || tagSelecionada.codigo}` : '❌ Nenhuma selecionada'}
              </span>
            </div>
          </div>

          {/* Seta indicadora */}
          <div className="col-md-2 text-muted fs-4 my-2 my-md-0">➔</div>

          {/* Contrato de Destino */}
          <div className="col-md-5">
            <div className="p-3 bg-white rounded-3 border border-light-subtle">
              <span className="d-block text-muted small fw-semibold text-uppercase mb-1">Contrato de Destino</span>
              <span className="fs-6 fw-bold text-dark">
                {contratoDestino ? `📄 Contrato ${contratoDestino.numero || contratoDestino.id}` : '❌ Nenhum selecionado'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão Concluir Ação */}
        <div className="d-flex justify-content-md-end">
          <button
            type="button"
            onClick={handleEfetuarTransferencia}
            disabled={processando || !tagSelecionada || !contratoDestino}
            className="btn btn-primary btn-lg fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-2.5 px-4 w-100 w-md-auto"
          >
            {processando ? (
              <>A processar Transferência...</>
            ) : (
              <>
                <CheckCircle size={18} /> Confirmar e Transferir Tag
              </>
            )}
          </button>
        </div>

      </div> {/* Fecha card do Resumo */}
    </div> {/* Fecha container principal */}
    </div>
    </div>
  );
 }