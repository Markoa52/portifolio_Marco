import React from 'react';


// Dados atualizados unificando o Histórico com os novos campos
const DADOS_MOCK = [
  { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', status: 'Pendente' },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1027', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', status: 'Pendente' },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1027', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', status: 'Pendente' },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1027', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', status: 'Pago' },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', status: 'Pendente' },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', status: 'Pago' },
  { id: 'FAT-2026-1027', fechamento: '01/09/2026', vencimento: '10/09/2026', valor: 'R$ 2.100,00', status: 'Cancelado' },
];

export const HistoricoFaturas: React.FC = () => {
  return (
    <div className="tabela-pagina-container">
      
      <div className="tabela-header-acoes">

        <h2>Histórico de Movimentações</h2>
      </div>

      <div className="tabela-responsiva-wrapper">
        <table className="tabela-moderna">
          <thead>
            <tr>
              <th>Código da Fatura</th>
              <th>Valor</th>
              <th>Fechamento</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th className="texto-centralizado">Ações</th>
            </tr>
          </thead>
          <tbody>
            {DADOS_MOCK.map((item) => (
              <tr key={item.id}>
                {/* 1. ID com estilo de código */}
                <td className="texto-negrito-id">{item.id}</td>
                
                {/* 2. Valor destacado */}
                <td className="texto-valor">{item.valor}</td>
                
                {/* 3. Fechamento (Novo) */}
                <td>{item.fechamento}</td>
                
                {/* 4. Vencimento */}
                <td>
                  <strong className={item.status === 'Pendente' ? 'texto-alerta' : ''}>
                    {item.vencimento}
                  </strong>
                </td>
                
                {/* 5. Badge de Status */}
                <td>
                  <span className={`badge status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>

                {/* 6. Os 4 Botões integrados na linha (Novo) */}
                <td>
                  <div className="tabela-grupo-botoes">
                    <button className="btn-tabela-acao link" onClick={() => alert('Abrindo detalhes...')}>
                      Detalhes
                    </button>
                    <button className="btn-tabela-acao" onClick={() => alert('Abrindo demonstrativo...')}>
                      Demonstrativo
                    </button>
                    <button className="btn-tabela-acao" onClick={() => alert('Abrindo PDF...')}>
                      PDF
                    </button>
                    <button className="btn-tabela-acao destaque" onClick={() => alert('Abrindo Nota Fiscal...')}>
                      NF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
