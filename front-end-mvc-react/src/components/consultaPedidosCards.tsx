import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, DollarSign, Calendar, Search } from 'lucide-react';
import axios from 'axios';

import type { IConsultaPedidosProps } from '../types/IConsultaPedidoProps';

export const ConsultaPedidosCards: React.FC<IConsultaPedidosProps> = ({onNovoPedido, contractId }) => {
  // Estados para armazenamento dos dados e controle da tela
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtroId, setFiltroId] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  // Função para buscar os pedidos na API (pode ser adaptada para Query Params)
  const buscarPedidos = async (idBusca?: string) => {
    try {
      setCarregando(true);
      setErro(null);

      // Configura os parâmetros de busca caso o operador tenha digitado algo
      const url = `http://localhost:3000/api/pedidos/${contractId}`;
      const resposta = await axios.get(url, {
        params: idBusca ? { id: idBusca } : {}
      });

      setPedidos(Array.isArray(resposta.data) ? resposta.data : [resposta.data]);
    } catch (err: any) {
      console.error("Erro ao buscar pedidos:", err);
      setErro(err.response?.data?.erro || "Erro ao carregar a listagem de pedidos.");
      setPedidos([]);
    } finally {
      setCarregando(false);
    }
  };

  // Carrega todos os pedidos assim que a tela abre
  useEffect(() => {
    buscarPedidos();
  }, []);

  // Gatilhos de ação dos botões
  const handleConsultarDetalhes = (pedidoId: number) => {
    alert(`🔍 Abrindo detalhes completos do Pedido nº ${pedidoId}`);
    // Exemplo: navigate(`/pedido/detalhes/${pedidoId}`);
  };

  const handleEfetuarRecebimento = (pedidoId: number) => {
    alert(`💰 Iniciando fluxo de recebimento/baixa para o Pedido nº ${pedidoId}`);
    // Exemplo: abrirModalRecebimento(pedidoId);
  };

  // Função auxiliar para mapear as cores do status do pedido
  const obterEstiloStatus = (status: number) => {
    switch (status) {
      case 1: return { texto: 'PENDENTE', classe: 'bg-warning-subtle text-warning-emphasis border-warning-subtle' };
      case 2: return { texto: 'RECEBIDO', classe: 'bg-success-subtle text-success border-success-subtle' };
      case 3: return { texto: 'CANCELADO', classe: 'bg-danger-subtle text-danger border-danger-subtle' };
      default: return { texto: 'PROCESSANDO', classe: 'bg-light text-secondary border' };
    }
  };

  return (
    <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>

    <button className="btn btn-primary fw-semibold px-4" onClick={onNovoPedido}>
      Novo pedido
    </button>
      
      {/* 🟢 TOPO DA TELA: TÍTULO E BARRA DE PESQUISA */}
      <div className="row align-items-center g-3 border-bottom pb-3 mb-4 m-0">
        <div className="col-md-6 p-0">
          <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <ShoppingBag size={22} className="text-primary" /> Painel de Pedidos e Recebimentos
          </h2>
          <small className="text-muted">Consulte, analise os detalhes e dê baixa financeira nos pedidos em lote.</small>
        </div>
        
        {/* Barra de Busca Ágil */}
        <div className="col-md-6 p-0 d-flex gap-2 justify-content-md-end">
          <div className="input-group" style={{ maxWidth: '350px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted"><Search size={16} /></span>
            <input 
              type="text" 
              placeholder="Buscar por ID do pedido..." 
              value={filtroId}
              onChange={(e) => setFiltroId(e.target.value)}
              className="form-control border-start-0 text-start"
            />
          </div>
          <button className="btn btn-primary fw-semibold px-4" onClick={() => buscarPedidos(filtroId)}>
            Pesquisar
          </button>
        </div>
      </div>

      {/* 🔴 TRATAMENTO DE INTERFACE: LOADING OU ERRO */}
      {carregando && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted fw-bold">Buscando pedidos no banco de dados...</p>
        </div>
      )}
      {erro && <div className="alert alert-danger shadow-sm rounded-3">{erro}</div>}

      {/* 🗂️ EMISSÃO DOS CARDS EM GRADE (Responsivo: 1 coluna no celular, 3 no PC) */}
      {!carregando && !erro && (
        <div className="row g-3 m-0">
          {pedidos && pedidos.length > 0 ? (
            pedidos.map((pedido: any, index: number) => {
              const statusInfo = obterEstiloStatus(pedido.status);

              return (
                <div key={`${pedido.id || index}-${index}`} className="col-12 col-md-6 col-lg-4 p-0 px-md-2">
                  <div className="card h-100 border border-light-subtle shadow-sm bg-white rounded-3 p-3 d-flex flex-column justify-content-between transition-all hover-shadow">
                    
                    {/* Linha 1: Código do Pedido e Badge de Status */}
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <div>
                        <span className="text-muted small d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CÓDIGO</span>
                        <strong className="text-dark fs-6">PED-{pedido.id}</strong>
                      </div>
                      <span className={`badge px-2.5 py-1.5 fw-bold border ${statusInfo.classe}`}>
                        {statusInfo.texto}
                      </span>
                    </div>

                    {/* Linha 2: Dados do Cliente e Data */}
                    <div className="mb-3 text-start">
                      <span className="text-muted small d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CLIENTE / EMPRESA</span>
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
                        {pedido.id || pedido.quantidade || "Cliente não informado"}
                      </div>
                      
                      <div className="d-flex align-items-center gap-1 text-secondary mt-2 small">
                        <Calendar size={14} />
                        <span>Emissão: {pedido.dataRegistro || "---"}</span>
                      </div>
                    </div>

                    {/* Linha 3: Valor Total */}
                    <div className="bg-light p-2.5 rounded-3 mb-3 d-flex justify-content-between align-items-center">
                      <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR TOTAL</span>
                      <span className="fs-5 fw-black text-dark">
                        {pedido.valorTotal != null ? (
                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valorTotal)
                        ) : (
                          "R$ 0,00"
                        )}
                      </span>
                    </div>

                    {/* Linha 4: Botões de Ação Dinâmicos */}
                    <div className="d-flex gap-2 mt-auto">
                      <button 
                        type="button"
                        onClick={() => handleConsultarDetalhes(pedido.id)}
                        className="btn btn-sm btn-light border text-secondary fw-bold w-50 d-inline-flex align-items-center justify-content-center gap-1 py-2"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                      
                      {/* O botão de recebimento só fica ativo/destacado se o pedido estiver PENDENTE (status 1) */}
                      <button 
                        type="button"
                        disabled={pedido.status !== 1}
                        onClick={() => handleEfetuarRecebimento(pedido.id)}
                        className={`btn btn-sm fw-bold w-50 d-inline-flex align-items-center justify-content-center gap-1 py-2 ${
                          pedido.status === 1 ? 'btn-primary' : 'btn-light text-muted border'
                        }`}
                        style={{ fontSize: '0.78rem' }}
                      >
                        <DollarSign size={14} /> Receber
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
            
          ) : (
            /* Estado Vazio */
            <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm border w-100">
              <span className="d-block fs-3 mb-2">📦</span>
              <h5 className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>Nenhum pedido localizado</h5>
              <small className="text-muted">Altere o filtro da busca ou verifique os lançamentos no banco de dados.</small>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
