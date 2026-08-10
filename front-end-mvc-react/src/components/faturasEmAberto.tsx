import React from 'react';

const FATURAS_EM_ABERTO = [
  { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', Urgente: false },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', Urgente: false },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', Urgente: false },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false },
    { id: 'FAT-2026-1024', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true },
  { id: 'FAT-2026-1025', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00', Urgente: false },
  { id: 'FAT-2026-1026', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false },
];

export const FaturasAbertas: React.FC = () => {
  return (
    <div className="faturas-pagina-container">
      
      <div className="faturas-header-acoes">
        <h2>Faturas em Aberto</h2>
      </div>

      <div className="faturas-lista-vertical">
        {FATURAS_EM_ABERTO.map((fatura) => (
          <div key={fatura.id} className={`fatura-card-item-longo ${fatura.Urgente ? 'borda-urgente' : ''}`}>
            
            {/* Conteúdo do Card - Organizado com 4 colunas principais */}
            <div className="fatura-card-conteudo-alinhado">
              
              {/* 1. VALOR A PAGAR */}
              <div className="bloco-info-fatura">
                <p className="fatura-label-valor">Valor a Pagar</p>
                <h3 className="fatura-valor-destaque-pequeno">{fatura.valor}</h3>
              </div>

              {/* 2. CÓDIGO DA FATURA */}
              <div className="bloco-info-fatura">
                <p className="fatura-label-valor">Código da Fatura</p>
                <span className="texto-negrito-id">{fatura.id}</span>
              </div>

              {/* 3. CAMPO DE FECHAMENTO (Novo) */}
              <div className="bloco-info-fatura">
                <p className="fatura-label-valor">Fechamento</p>
                <span>{fatura.fechamento}</span>
              </div>

              {/* 4. VENCIMENTO */}
              <div className="bloco-info-fatura">
                <p className="fatura-label-valor">Vencimento</p>
                <strong className={fatura.Urgente ? 'texto-alerta' : ''}>{fatura.vencimento}</strong>
              </div>

            </div>

            {/* Rodapé com os 4 botões */}
            <div className="fatura-card-tres-botoes">
              <button className="btn-fatura link-detalhes" onClick={() => alert('Abrindo detalhes completos da fatura...')}>
                Detalhes da Fatura
              </button>
              
              <button className="btn-fatura secundario" onClick={() => alert('Abrindo demonstrativo...')}>
                Demonstrativo
              </button>
              
              <button className="btn-fatura secundario" onClick={() => alert('Visualizando PDF...')}>
                Visualizar PDF
              </button>
              
              <button className="btn-fatura primario" onClick={() => alert('Abrindo Nota Fiscal...')}>
                Nota Fiscal
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
