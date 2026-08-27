import React, { useEffect, useState } from 'react';
// IMPORTAÇÃO DOS ÍCONES DA LUCIDE (Deixa o botão e o topo muito mais profissionais)
import { ArrowLeft, Landmark, History } from 'lucide-react';
import axios from 'axios';

interface IDetalhesProps {
  contractId: number;
  onVoltar: () => void; // Função para permitir voltar à tela anterior
}

export const DetalhesPedagio: React.FC<IDetalhesProps> = ({ contractId, onVoltar }) => {

// 1. CORREÇÃO: Inicializa com um array vazio [] para o seu .map() não quebrar na primeira renderização
  const [saldoVeiculoVPR, setsaldoVeiculoVPR] = useState<any[]>([]);
  
  // Ajustado para capturar as funções de loading e erro que você declarou vazias
  const [, setCarregando] = useState<boolean>(false); 
  const [, setErro] = useState<string | null>(null);

  useEffect(() => {

    async function dispararFluxoAssincronoEConsulta() {
      if (!contractId) {
        return;
      }

      try {
        // 2. CORREÇÃO: Ativa o loading e limpa erros antes de bater na API
        setCarregando(true);
        setErro(null);

        console.log(`🔍 [Banco] Buscando VPR  do Contrato ID: ${contractId}`);

        // 3. CORREÇÃO: Requisição movida para DENTRO do bloco try/catch
        const respostaSaldoVPR = await axios.get(`http://localhost:3000/api/veiculo/VPR/${contractId}`);

        if (respostaSaldoVPR && respostaSaldoVPR.data) {
          console.log('[Sucesso] Faturas recebidas do SQLite:', respostaSaldoVPR.data);
          
          // 4. CORREÇÃO: Garante que estamos salvando uma Array pura (trata se o banco mandar nulo)
          setsaldoVeiculoVPR(Array.isArray(respostaSaldoVPR.data) ? respostaSaldoVPR.data : [respostaSaldoVPR.data]);
        } else {
          setsaldoVeiculoVPR([]);
        }

      } catch (err: any) {
        console.error('Erro no fluxo de consulta VPR:', err);
        setsaldoVeiculoVPR([]); // Evita travar a tela em caso de queda do servidor
        setErro(err.response?.data?.erro || err.message || "Erro ao carregar informações das faturas.");
      } finally {
        // Desliga o estado de espera na tela
        setCarregando(false);
      }
    }

    dispararFluxoAssincronoEConsulta();
   }, [contractId]); // Executa novamente de forma reativa sempre que o ID do contrato mudar

 return (
  // container limita a largura em 1200px, mantendo a simetria exata com o seu Header branco
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA COM BOTÃO VOLTAR INTEGRADO */}
    <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
      <div className="d-flex align-items-center gap-2">
        {/* Botão de seta redondo discreto e moderno */}
        <button 
            className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-1" 
            onClick={onVoltar} 
            style={{ width: '32px', height: '32px' }}
            title="Voltar para o Painel Geral"
          >
            <ArrowLeft size={16} className="text-dark" />
          </button>
        <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <Landmark size={22} className="text-primary" />Detalhamento do Vale Pedágio
        </h2>
      </div>

        {/* Badge clicável na direita servindo como segunda opção de escape rápida */}
        <span className="badge bg-light border text-secondary fw-semibold py-1.5 px-2 small cursor-pointer" onClick={onVoltar} style={{ cursor: 'pointer' }}>
          ← Voltar ao Painel
        </span>
      </div>

    {/* ====================================================================
        📊 TABELA CLEAN: CONTROLE DE PLACAS E SALDOS INTEGRADO
        ==================================================================== */}
    <div className="card border-0 bg-white shadow-sm rounded-3 overflow-hidden">
      
      {/* Sub-cabeçalho da Tabela */}
      <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
        <div>
          <History size={24} />
          <h5 className="fs-6 fw-bold text-dark m-0">🚗 Saldo de Veículos e Frotas</h5>
          <small className="text-muted">Acompanhamento de saldos ativos para passagens em pedágios.</small>
        </div>
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 fw-bold">
          {saldoVeiculoVPR?.length || 0} Cadastrados
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 text-start">
          <thead className="table-light text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <tr>
              <th className="py-3 ps-3" style={{ width: '20%' }}>PLACA</th>
              <th className="py-3" style={{ width: '35%' }}>VEÍCULO / MODELO</th>
              <th className="py-3 text-center" style={{ width: '20%' }}>STATUS</th>
              <th className="py-3 text-end pe-3" style={{ width: '25%' }}>SALDO DA CONTA</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {saldoVeiculoVPR && saldoVeiculoVPR.length > 0 ? (
              saldoVeiculoVPR.map((veiculo: any, index: number) => (
               /* CORREÇÃO 2: Usamos uma string combinada ultra-segura para a Key */
               <tr key={`${veiculo.placa || index}-${index}`} className="align-middle">
                 
                 {/* 1. PLACA */}
                 <td className="ps-3">
                   <span className="font-monospace fw-bold bg-dark text-white px-2 py-1 rounded border border-secondary" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                     {veiculo.placa || "---"}
                   </span>
                 </td>

                  {/* 2. MODELO E MARCA */}
                  <td>
                    <div className="fw-semibold text-dark">{veiculo.modelo || "Não informado"}</div>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                      Eixos: {veiculo.eixo || "1"} | Tipo: {veiculo.tipoveiculo === '2' ? 'Pesado' : 'Passeio'}
                    </small>
                  </td>

                  {/* 3. STATUS */}
                  <td className="text-center">
                    <span className={`badge px-2.5 py-1.5 fw-bold ${
                      veiculo?.status?.toLowerCase() === 'ativo' || veiculo?.status?.toLowerCase() === 'ativa'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                    }`}>
                      {veiculo?.status?.toUpperCase() || 'INATIVO'}
                    </span>
                  </td>

                  {/* 4. SALDO FORMATADO (R$) */}
                  <td className="text-end pe-3 fw-bold text-dark fs-6">
                    {veiculo.saldoContaVeiculo != null ? (
                      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(veiculo.saldoContaVeiculo)
                    ) : (
                      "R$ 0,00"
                    )}
                  </td>

                </tr>
              ))
            ) : (
              /* Estado Vazio */
              <tr>
                <td colSpan={4} className="text-center py-5 text-muted">
                  <span className="d-block fs-4 mb-2">📭</span>
                  <p className="fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>Nenhum veículo ativo neste contrato</p>
                  <small className="text-muted">Os novos registros aparecerão nesta grade em tempo real.</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

  </div> // 💡 Fecha o container mestre inicial
);

};

