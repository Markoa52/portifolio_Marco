import React, { useState } from 'react';

interface IMenuMobileProps {
  setAbaAtiva: (aba: any) => void;
}

export const MenuMobileModulos: React.FC<IMenuMobileProps> = ({ setAbaAtiva }) => {
  const [aberto, setAberto] = useState<boolean>(false);

  return (
    <div className="container-menu-hamburguer-mobile-exclusivo" style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Botão quadrado compacto ☰ / ✕ */}
      <button 
        onClick={() => setAberto(!aberto)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          border: '1px solid #333333',
          borderRadius: '6px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: 0
        }}
      >
        {aberto ? '✕' : '☰'}
      </button>

      {/* Caixa Dropdown Flutuante que desce ao clicar (Usa position absolute para VOAR por cima do layout) */}
      {aberto && (
        <div style={{
          position: 'absolute',
          top: '46px',
          left: '0',
          backgroundColor: '#161616',
          border: '1px solid #262626',
          borderRadius: '8px',
          width: '230px',
          padding: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 999999
        }}>
          
          <div style={{ padding: '6px 10px', color: '#ffffff', fontSize: '0.88rem', cursor: 'pointer', borderRadius: '4px' }} 
               onClick={() => { setAbaAtiva('cards-gerais'); setAberto(false); }}>🏠 Início</div>
          
          <div style={{ padding: '4px 10px', color: '#71717a', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '6px', borderTop: '1px solid #222', paddingTop: '6px' }}>🛞 Frota</div>
          <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }} 
               onClick={() => { setAbaAtiva('listar-frota'); setAberto(false); }}>Listar Veículos</div>

          <div style={{ padding: '4px 10px', color: '#71717a', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '6px', borderTop: '1px solid #222', paddingTop: '6px' }}>📄 Faturas</div>
          <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }} 
               onClick={() => { setAbaAtiva('faturas-abertas'); setAberto(false); }}>Faturas Abertas</div>
          <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }} 
               onClick={() => { setAbaAtiva('historico-fatura'); setAberto(false); }}>Histórico de Pagamentos</div>

          <div style={{ padding: '4px 10px', color: '#71717a', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '6px', borderTop: '1px solid #222', paddingTop: '6px' }}>📊 Relatórios</div>
          <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }} 
               onClick={() => { setAbaAtiva('relatorio-passagem'); setAberto(false); }}>Passagens</div>
          <div style={{ padding: '6px 10px', color: '#cbd5e1', fontSize: '0.85rem', cursor: 'pointer' }} 
               onClick={() => { setAbaAtiva('relatorio-extrato'); setAberto(false); }}>Extrato</div>

        </div>
      )}
    </div>
  );
};
