import React from 'react';


// Dados atualizados unificando o Histórico com os novos campos
const DADOS_MOCK = [
  { id: 'FAT-2026-1021', fechamento: '09/09/2026', vencimento: '10/010/2026', valor: 'R$ 2.450,00', status: 'Em aberto' },
  { id: 'FAT-2026-1022', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1023', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   status: 'Pendente' },
  { id: 'FAT-2026-1024', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1025', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
  { id: 'FAT-2026-1026', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1027', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   status: 'Pendente' },
  { id: 'FAT-2026-1028', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1029', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
  { id: 'FAT-2026-1030', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1031', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   status: 'Pendente' },
  { id: 'FAT-2026-1032', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1033', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
  { id: 'FAT-2026-1034', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1035', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   status: 'Pendente' },
  { id: 'FAT-2026-1036', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1037', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
];

export const HistoricoFaturas: React.FC = () => {
  return (
  /* container limita a largura em 1200px e px-3 sincroniza as bordas com o seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Histórico de Faturas</h2>
    </div>

    {/* PAINEL DA TABELA (Card Branco Limpo) */}
    <div className="card p-3 p-md-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* ==========================================================================
          VISÃO 1: COMPUTAÇÃO E NOTEBOOKS (Tabela Tradicional Completa)
          Exibe apenas do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-none d-md-block table-responsive border rounded-3 bg-white">
        <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
          
          <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ width: '15%' }}>Código da Fatura</th>
              <th style={{ width: '15%' }}>Valor</th>
              <th style={{ width: '15%' }}>Fechamento</th>
              <th style={{ width: '15%' }}>Vencimento</th>
              <th style={{ width: '15%' }}>Status</th>
              <th className="text-center" style={{ width: '25%', minWidth: '260px' }}>Ações</th>
            </tr>
          </thead>
          
          <tbody>
            {DADOS_MOCK.map((item) => (
              <tr key={item.id}>
                <td className="text-dark fw-bold">{item.id}</td>
                <td className="text-dark fw-medium">{item.valor}</td>
                <td className="text-secondary">{item.fechamento}</td>
                <td>
                  <strong className={item.status === 'Pendente' ? 'text-danger fw-bold' : 'text-dark fw-normal'}>
                    {item.vencimento}
                  </strong>
                </td>
                <td>
                  <span className={`badge px-2.5 py-1.5 fw-bold ${
                    item.status.toLowerCase() === 'em aberto' ? 'bg-primary-subtle text-primary-emphasis border border-primary-subtle' :
                    item.status.toLowerCase() === 'pago' ? 'bg-success-subtle text-success border border-success-subtle' :
                    item.status.toLowerCase() === 'pendente' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' :
                    'bg-light text-secondary border'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-1">
                    <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo detalhes...')}>Detalhes</button>
                    <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo demonstrativo...')}>Demonstrativo</button>
                    <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo PDF...')}>PDF</button>
                    <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo Nota Fiscal...')}>NF</button>
                  </div>
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
      <div className="d-block d-md-none d-flex flex-column gap-3">
        {DADOS_MOCK.map((item) => (
          <div key={item.id} className="p-3 bg-light border border-light-subtle rounded-3 text-start shadow-none">
            
            {/* Linha 1: Código e Status */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-dark fw-bold fs-6">{item.id}</span>
              <span className={`badge px-2.5 py-1.5 fw-bold ${
                item.status.toLowerCase() === 'pago' ? 'bg-success-subtle text-success border border-success-subtle' :
                item.status.toLowerCase() === 'pendente' ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' :
                'bg-light text-secondary border'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Linha 2: Informações de Valores e Datas */}
            <div className="row g-2 mb-3 text-start" style={{ fontSize: '0.8rem' }}>
              <div className="col-6">
                <span className="text-muted d-block mb-0.5" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR</span>
                <strong className="text-dark fs-6">{item.valor}</strong>
              </div>
              <div className="col-6 text-end">
                <span className="text-muted d-block mb-0.5" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VENCIMENTO</span>
                <strong className={`fs-6 ${item.status === 'Pendente' ? 'text-danger fw-black' : 'text-dark fw-bold'}`}>
                  {item.vencimento}
                </strong>
              </div>
              <div className="col-10 mt-1">
                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Fechamento: <strong>{item.fechamento}</strong></span>
              </div>
            </div>

            {/* Linha 3: Grade com os 4 Botões de Ação para Celular */}
            {/* O grid divide em 2 botões por linha de forma limpa e compacta */}
            <div className="row g-1.5 border-top pt-2.5" >
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo detalhes...')}>
                  Detalhes
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo demonstrativo...')}>
                  Demonstrativo
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo PDF...')}>
                  Baixar PDF
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo Nota Fiscal...')}>
                  Nota Fiscal
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>

  </div>
);
};
