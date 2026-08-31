import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, Building2, Calendar, Wallet, Car, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface IDetalhesContratoProps {
  contractId: number;
  onVoltar: () => void;
}

export const DetalhesContrato: React.FC<IDetalhesContratoProps> = ({ contractId, onVoltar }) => {
  const [contrato, setContrato] = useState<any>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarDadosContrato = async () => {
      if (!contractId) return;
      try {
        setCarregando(true);
        setErro(null);
        
        // Requisição para buscar os dados consolidados do contrato
        const resposta = await axios.get(`http://localhost:3000/api/contrato/${contractId}`, {
          params: { id: contractId }
        });
        
        setContrato(resposta.data);
      } catch (err: any) {
        console.error("Erro ao buscar detalhes do contrato:", err);
        setErro("Não foi possível carregar os detalhes do contrato.");
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosContrato();
  }, [contractId]);

  // Formatação de moeda nativa
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  return (
    <div className="container my-4 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* 🟢 CABEÇALHO DA TELA COM BOTÃO VOLTAR */}
      <div className="d-flex align-items-center gap-2 border-bottom pb-3 mb-4">
        <button 
          type="button"
          className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-1" 
          onClick={onVoltar}
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          title="Voltar para o Painel Geral"
        >
          <ArrowLeft size={16} className="text-dark" />
        </button>
        <div>
          <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <FileText size={22} className="text-primary" /> Informações do Contrato : {contractId}
          </h2>
          <small className="text-muted">Visão consolidada de termos comerciais, dados cadastrais e faturamento.</small>
        </div>
      </div>

      {carregando ? (
        <div className="text-center py-5 text-muted small fw-bold">🔄 Carregando dados do contrato...</div>
      ) : erro ? (
        <div className="alert alert-danger p-3 rounded-3 d-flex align-items-center gap-2">
          <AlertCircle size={18} /> {erro}
        </div>
      ) : contrato ? (
        <div className="row g-3 m-0">
          
          {/* ====================================================================
              SEÇÃO 1: RESUMO DOS DADOS CADASTRAIS (PROPRIETÁRIO)
              ==================================================================== */}
          <div className="col-12 p-0">
            <div className="card p-4 border border-light-subtle shadow-sm bg-white rounded-3">
              <h3 className="fs-6 fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <Building2 size={16} className="text-secondary" /> Titular do Contrato
              </h3>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <span className="text-muted d-block small" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>RAZÃO SOCIAL</span>
                  <strong className="text-dark text-truncate d-block mt-0.5">{contrato.nomeEmpresa || "Não informado"}</strong>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CNPJ</span>
                  <span className="text-secondary fw-semibold font-monospace d-block mt-0.5">{contrato.cnpj || "---"}</span>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CONTATO</span>
                  <span className="text-secondary small d-block mt-0.5">{'Telefone: ' + contrato.telefone + ', E-mail: ' + contrato.email || "---"}</span>
                </div>
                <div className="col-12 col-md-2 text-md-end">
                  <span className="text-muted d-block small mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>STATUS CONTRATO</span>
                  <span className={`badge px-2.5 py-1.5 fw-bold ${Number(contrato.contratoStatusId) === 1 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                    {'ATIVO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              SEÇÃO 2: BLOCOS OPERACIONAIS E FINANCEIROS
              ==================================================================== */}
          {/* Card A: Vigência */}
          <div className="col-12 col-md-4 p-0 pe-md-3">
            <div className="card p-3 border border-light-subtle shadow-sm bg-white rounded-3 h-100">
              <span className="text-muted d-block fw-bold mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                <Calendar size={14} className="text-secondary me-1" /> VIGÊNCIA E TERMOS
              </span>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-secondary small">Início do Vínculo</span>
                <span className="text-dark fw-bold small">{contrato.dataInicio || "---"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Tipo de Plano</span>
                <span className="badge bg-light text-dark border font-monospace">{Number(contrato.planoComercializadoTipo) === 1 ? "Mensalidade" :"Mensalidade + Taxa"}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Plano Comercializado</span>
                <span className="badge bg-light text-dark border font-monospace">{Number(contrato.planoPagamentoTipo) === 1 ? "Pós-Pago" :"Pré-Pago"}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Corte Faturamento</span>
                <span className="badge bg-light text-dark border font-monospace"> 
                    {Number(contrato.CorteFaturamentoTipo) === 1 ? "Semanal" :
                     Number(contrato.CorteFaturamentoTipo) === 2 ? "Quinzenal" :
                     Number(contrato.CorteFaturamentoTipo) === 3 ? "Mensal" : 
                     "Não definido"}</span>
              </div>

             <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Prazo para Pagamento</span>
                <span className="badge bg-light text-dark border font-monospace">{contrato.prazoPagamento}</span>
              </div>

             <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Dia do Faturamento</span>
                <span className="badge bg-light text-dark border font-monospace">{contrato.diaFaturamento}</span>
              </div>

              {Number(contrato.CorteFaturamentoTipo) === 1 &&  (
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Fatura dia da Semana</span>
                <span className="badge bg-light text-dark border font-monospace">{contrato.diaSemanaCorte}</span>
              </div>
              )}

            </div>
          </div>

          {/* Card B: Saldos e Créditos */}
          <div className="col-12 col-md-4 p-0 px-md-1">
            <div className="card p-3 border border-light-subtle shadow-sm bg-white rounded-3 h-100">
              <span className="text-muted d-block fw-bold mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                <Wallet size={14} className="text-secondary me-1" /> SALDO CONSOLIDADO
              </span>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-secondary small">Saldo em Conta</span>
                <span className="text-success fw-bold">{formatarMoeda(contrato.saldoContrato)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Limite Disponível</span>
                <span className="text-dark fw-semibold small">{formatarMoeda(contrato.limiteContrato)}</span>
              </div>
            </div>
          </div>

          {/* Card C: Frota Vinculada */}
          <div className="col-12 col-md-4 p-0 ps-md-3">
            <div className="card p-3 border border-light-subtle shadow-sm bg-white rounded-3 h-100">
              <span className="text-muted d-block fw-bold mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                <Car size={14} className="text-secondary me-1" /> RESUMO DA FROTA
              </span>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-secondary small">Total de Veículos</span>
                <span className="badge bg-dark font-monospace">{contrato.totalVeiculos || 0}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-secondary small">Aguardando Ativação</span>
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">{contrato.veiculosInativos || 0}</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-5 text-muted small border rounded-3 bg-light">
          📭 Contrato não localizado ou inexistente no sistema.
        </div>
      )}

    </div>

    
  );
};
