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
    <div className="tabela-pagina-container">
      
      {/* Barra de Ferramentas Superior do Extrato */}
      <div className="frota-acoes-topo" style={{ marginBottom: '20px' }}>
        <button 
          className="btn-fatura secundario" 
          onClick={() => alert('Exportando extrato completo para Excel/CSV...')}
          style={{ marginRight: 'auto' }} /* Truque: Mantém o Exportar na extrema esquerda */
        >
          📥 Exportar Extrato
        </button>
      </div>

      {/* Tabela Estruturada com os campos solicitados */}
      <div className="tabela-responsiva-wrapper">
        <table className="tabela-moderna">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Data</th>
              <th>Tipo de Lançamento</th>
              <th>Status da Viagem</th>
              <th className="texto-centralizado">Valor</th>
            </tr>
          </thead>
          <tbody>
            {EXTRATO_MOCK.map((item) => (
              <tr key={item.id}>
                {/* 1. Placa (com tratamento se for um lançamento sem veículo, tipo recargas) */}
                <td className="texto-negrito-id" style={{ fontFamily: 'sans-serif' }}>
                  {item.placa}
                </td>
                
                {/* 2. Data do lançamento */}
                <td>{item.data}</td>
                
                {/* 3. Tipo (Pedágio, Recarga, etc.) */}
                <td style={{ fontWeight: 500 }}>{item.tipo}</td>
                
                {/* 4. Status da Viagem com Badges Dinâmicas */}
                <td>
                  <span className={`badge status-${item.statusViagem.toLowerCase()}`}>
                    {item.statusViagem}
                  </span>
                </td>
                
                {/* 5. Valor (Verde se for positivo/crédito, escuro se for débito) */}
                <td 
                  className="texto-valor texto-centralizado" 
                  style={{ color: item.valor.includes('+') ? '#2e7d32' : '#0f172a' }}
                >
                  {item.valor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
