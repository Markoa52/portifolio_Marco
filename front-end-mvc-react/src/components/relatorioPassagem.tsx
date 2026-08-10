import React from 'react';


// Interface estrita para os dados de passagem
interface IPassagem {
  id: string;
  placa: string;
  dataPassagem: string;
  valorPassagem: string;
  local: string;
}

// Dados simulados de passagens (pedágios) para popular a tabela
const PASSAGENS_MOCK: IPassagem[] = [
  { id: 'PAS-001', placa: 'ABC-1234', dataPassagem: '10/08/2026 08:32', valorPassagem: 'R$ 14,50', local: 'Pedágio ViaOeste - Km 18' },
  { id: 'PAS-002', placa: 'XYZ-5678', dataPassagem: '10/08/2026 11:15', valorPassagem: 'R$ 7,20', local: 'Pedágio Imigrantes - Km 32' },
  { id: 'PAS-003', placa: 'ABC-1234', dataPassagem: '09/08/2026 17:40', valorPassagem: 'R$ 14,50', local: 'Pedágio ViaOeste - Km 18' },
  { id: 'PAS-004', placa: 'KGB-0077', dataPassagem: '08/08/2026 14:22', valorPassagem: 'R$ 22,10', local: 'Pedágio NovaDutra - Km 204' },
];

export const RelatorioPassagens: React.FC = () => {
  return (
    <div className="tabela-pagina-container">
      
      {/* Barra de Ferramentas Superior do Relatório */}
      <div className="frota-acoes-topo" style={{ marginBottom: '20px' }}>
        <button 
          className="btn-fatura secundario" 
          onClick={() => alert('Exportando relatório de passagens para Excel/CSV...')}
          style={{ marginRight: 'auto' }} /* Mantém o Exportar na esquerda */
        >
          📥 Exportar Relatório
        </button>
      </div>

      {/* Tabela Estruturada com os campos solicitados */}
      <div className="tabela-responsiva-wrapper">
        <table className="tabela-moderna">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Data da Passagem</th>
              <th>Local / Praça</th>
              <th className="texto-centralizado">Valor da Passagem</th>
            </tr>
          </thead>
          <tbody>
            {PASSAGENS_MOCK.map((passagem) => (
              <tr key={passagem.id}>
                {/* 1. Placa com destaque em negrito */}
                <td className="texto-negrito-id" style={{ fontFamily: 'sans-serif' }}>
                  {passagem.placa}
                </td>
                
                {/* 2. Data da Passagem */}
                <td>{passagem.dataPassagem}</td>
                
                {/* Campo extra opcional para dar contexto ao relatório */}
                <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  {passagem.local}
                </td>
                
                {/* 3. Valor da Passagem (Destacado na direita/centro) */}
                <td className="texto-valor texto-centralizado" style={{ color: '#0f172a' }}>
                  {passagem.valorPassagem}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
