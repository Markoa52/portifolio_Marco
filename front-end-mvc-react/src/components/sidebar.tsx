import React from 'react';
// 1. IMPORTA O LOGO COMO UMA VARIÁVEL NO TOPO DO ARQUIVO
import logoEmpresa from '../assets/logo.png'; 

interface ISidebarProps {
  paginaAtiva: 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato';
  setPaginaAtiva: (pagina: 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato') => void;
}

export const Sidebar: React.FC<ISidebarProps> = ({ paginaAtiva, setPaginaAtiva }) => {
  return (
    <div className="sidebar">
      <div className="brand">
        {/* 2. CHAMA A VARIÁVEL ENTRE CHAVES NO SRC */}
        <img src={logoEmpresa} alt="Logo IMONITORE" className="company-logo" />
        <h2>Automações</h2>
      </div>
      
      <div className="nav-menu">
        {/* Botão Visão Geral */}
        <button 
          className={`nav-btn ${paginaAtiva === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setPaginaAtiva('visao-geral')}
        >
          📊 Visão Geral
        </button>

        {/* Botão Gerenciador */}
        <button 
          className={`nav-btn ${paginaAtiva === 'gerenciador' ? 'active' : ''}`}
          onClick={() => setPaginaAtiva('gerenciador')}
        >
          ⚙️ Gerenciador
        </button>

        {/* Botão Dashboard */}
        <button 
          className={`nav-btn ${paginaAtiva === 'dashboard' ? 'active' : ''}`}
          onClick={() => setPaginaAtiva('dashboard')}
        >
          📈 Dashboard GLPI
        </button>

        {/* Botão ConsumoAPI */}
        <button 
          className={`nav-btn ${paginaAtiva === 'consumoAPI' ? 'active' : ''}`}
          onClick={() => setPaginaAtiva('consumoAPI')}
        >
         📍 API externa CEP
        </button>

        {/* Botão ConsumoAPI */}
        <button 
          className={`nav-btn ${paginaAtiva === 'contrato' ? 'active' : ''}`}
          onClick={() => setPaginaAtiva('contrato')}
        >
         Contrato
        </button>
      </div>
    </div>
  );
};
