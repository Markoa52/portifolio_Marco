import React from 'react';

// Interface para estruturar as colunas pedidas
interface IExtrato {
  id: string;
  placa: string;
  data: string;
  tipo: string;         /* Ex: Pedágio, Recarga, Taxa, Estorno */
  statusViagem: string; /* Ex: Confirmada, Contestada, Processando */
  valor: string;
}

// Dados simulados de extrato financeiro para popular a tabela
const EXTRATO_MOCK: IExtrato[] = [
  { id: 'EXT-001', placa: 'ABC-1234', data: '10/08/2026 14:05', tipo: 'Pedágio', statusViagem: 'Confirmada', valor: 'R$ -14,50' },
  { id: 'EXT-002', placa: 'Não se aplica', data: '10/08/2026 09:00', tipo: 'Recarga Saldo', statusViagem: 'Confirmada', valor: 'R$ +500,00' },
  { id: 'EXT-003', placa: 'XYZ-5678', data: '09/08/2026 18:22', tipo: 'Pedágio', statusViagem: 'Processando', valor: 'R$ -7,20' },
  { id: 'EXT-004', placa: 'KGB-0077', data: '08/08/2026 11:40', tipo: 'Pedágio', statusViagem: 'Contestada', valor: 'R$ -22,10' },
  { id: 'EXT-005', placa: 'ABC-1234', data: '07/08/2026 16:15', tipo: 'Taxa Adm.', statusViagem: 'Confirmada', valor: 'R$ -5,00' },
];

export const RelatorioExtrato: React.FC= () => {
  return (
  /* container limita a largura em 1200px e px-3 sincroniza as bordas com o seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Extrato de Utilização</h2>
    </div>

    {/* PAINEL OPERACIONAL (Card Branco Limpo) */}
    <div className="card p-3 p-md-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* BARRA DE FERRAMENTAS SUPERIOR */}
      <div className="d-flex mb-4">
        <button 
          className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
          onClick={() => alert('Exportando extrato completo para Excel/CSV...')}
        >
          📥 Exportar Extrato
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
              <th style={{ width: '15%' }}>Placa</th>
              <th style={{ width: '20%' }}>Data</th>
              <th style={{ width: '25%' }}>Tipo de Lançamento</th>
              <th style={{ width: '20%' }}>Status da Viagem</th>
              <th className="text-end" style={{ width: '15%', paddingRight: '24px' }}>Valor</th>
            </tr>
          </thead>
          
          <tbody>
            {EXTRATO_MOCK.map((item) => (
              <tr key={item.id}>
                {/* 1. Placa em negrito */}
                <td className="text-dark fw-bold">{item.placa}</td>
                
                {/* 2. Data */}
                <td className="text-secondary">{item.data}</td>
                
                {/* 3. Tipo */}
                <td className="text-dark">{item.tipo}</td>
                
                {/* 4. Status com Badge Limpa */}
                <td>
                  <span className={`badge px-2.5 py-1.5 fw-semibold ${
                    item.statusViagem.toLowerCase() === 'concluída' || item.statusViagem.toLowerCase() === 'concluido' ? 'bg-success-subtle text-success' :
                    item.statusViagem.toLowerCase() === 'processando' ? 'bg-warning-subtle text-warning-emphasis' :
                    'bg-light text-secondary border'
                  }`}>
                    {item.statusViagem}
                  </span>
                </td>
                
                {/* 5. Valor (Verde para créditos, Grafite para débitos) */}
                <td 
                  className="text-end fw-bold" 
                  style={{ color: item.valor.includes('+') ? '#2e7d32' : '#0f172a', paddingRight: '24px' }}
                >
                  {item.valor}
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
        {EXTRATO_MOCK.map((item) => (
          <div key={item.id} className="p-3 bg-light border border-light-subtle rounded-3 text-start shadow-none">
            
            {/* Linha Superior: Placa e Status */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-dark fw-bold fs-6">{item.placa}</span>
              <span className={`badge px-2 py-1 ${
                item.statusViagem.toLowerCase() === 'concluída' || item.statusViagem.toLowerCase() === 'concluido' ? 'bg-success-subtle text-success' :
                item.statusViagem.toLowerCase() === 'processando' ? 'bg-warning-subtle text-warning-emphasis' :
                'bg-light text-secondary border'
              }`}>
                {item.statusViagem}
              </span>
            </div>

            {/* Linha Central: Data e Tipo de Lançamento */}
            <div className="row g-2 align-items-center" style={{ fontSize: '0.8rem' }}>
              <div className="col-7">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>LANÇAMENTO</span>
                <span className="text-dark fw-medium">{item.tipo}</span>
                <span className="text-muted d-block small" style={{ fontSize: '0.7rem' }}>{item.data}</span>
              </div>
              
              {/* Lado Direito: O Valor Monetário focado na ponta */}
              <div className="col-5 text-end">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR</span>
                <strong 
                  className="fs-5 fw-black" 
                  style={{ color: item.valor.includes('+') ? '#2e7d32' : '#0f172a' }}
                >
                  {item.valor}
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
