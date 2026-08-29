import React from 'react';
import type { IPassagem } from '../types/IPassagem';

// Dados simulados de passagens (pedágios) para popular a tabela
const PASSAGENS_MOCK: IPassagem[] = [
  { id: 'PAS-001', placa: 'ABC-1234', dataPassagem: '10/08/2026 08:32', valorPassagem: 'R$ 14,50', local: 'Pedágio ViaOeste - Km 18' },
  { id: 'PAS-002', placa: 'XYZ-5678', dataPassagem: '10/08/2026 11:15', valorPassagem: 'R$ 7,20', local: 'Pedágio Imigrantes - Km 32' },
  { id: 'PAS-003', placa: 'ABC-1234', dataPassagem: '09/08/2026 17:40', valorPassagem: 'R$ 14,50', local: 'Pedágio ViaOeste - Km 18' },
  { id: 'PAS-004', placa: 'KGB-0077', dataPassagem: '08/08/2026 14:22', valorPassagem: 'R$ 22,10', local: 'Pedágio NovaDutra - Km 204' },
];

export const RelatorioPassagens: React.FC = () => {
  return (
  /* container limita a largura em 1200px e px-3 sincroniza as bordas laterais com o seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Relatório de Passagens</h2>
    </div>

    {/* PAINEL OPERACIONAL (Card Branco Limpo) */}
    <div className="card p-3 p-md-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* BARRA DE FERRAMENTAS SUPERIOR */}
      <div className="d-flex mb-4">
        <button 
          className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
          onClick={() => alert('Exportando relatório de passagens para Excel/CSV...')}
        >
          📥 Exportar Relatório
        </button>
      </div>

      {/* ==========================================================================
          VISÃO 1: COMPUTAÇÃO E NOTEBOOKS (Tabela Tradicional Completa)
          Exibe apenas do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-none d-md-block table-responsive border rounded-3 bg-white">
        <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
          
          <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ width: '20%' }}>Placa</th>
              <th style={{ width: '25%' }}>Data da Passagem</th>
              <th style={{ width: '40%' }}>Local / Praça</th>
              <th className="text-end" style={{ width: '15%', paddingRight: '24px' }}>Valor da Passagem</th>
            </tr>
          </thead>
          
          <tbody>
            {PASSAGENS_MOCK.map((passagem) => (
              <tr key={passagem.id}>
                {/* 1. Placa em negrito */}
                <td className="text-dark fw-bold">{passagem.placa}</td>
                
                {/* 2. Data da Passagem */}
                <td className="text-secondary">{passagem.dataPassagem}</td>
                
                {/* 3. Local / Praça */}
                <td style={{ color: '#64748b' }}>{passagem.local}</td>
                
                {/* 4. Valor destacado na direita */}
                <td className="text-end fw-bold text-dark" style={{ paddingRight: '24px' }}>
                  {passagem.valorPassagem}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* ==========================================================================
          VISÃO 2: CELULARES (Cards Verticais Compactos - Sem Barra de Rolagem)
          Exibe apenas no mobile e some do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-block d-md-none d-flex flex-column gap-2">
        {PASSAGENS_MOCK.map((passagem) => (
          <div key={passagem.id} className="p-3 bg-light border border-light-subtle rounded-3 text-start shadow-none">
            
            {/* Linha Superior: Placa e Ícone Informativo */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-dark fw-bold fs-6">{passagem.placa}</span>
              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>{passagem.dataPassagem}</span>
            </div>

            {/* Linha Central: Detalhes do Local e Preço do Pedágio */}
            <div className="row g-2 align-items-center" style={{ fontSize: '0.8rem' }}>
              <div className="col-7">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>LOCAL / PRAÇA</span>
                <span className="text-dark fw-medium d-block text-truncate" style={{ maxWidth: '170px' }}>
                  {passagem.local}
                </span>
              </div>
              
              {/* Lado Direito: Valor travado na extremidade da caixa */}
              <div className="col-5 text-end">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR</span>
                <strong className="fs-5 fw-black text-dark">
                  {passagem.valorPassagem}
                </strong>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>

  </div>
);
};
