import React, { useState } from 'react';
import './contrato.css'; // Carrega os estilos unificados

// Definimos estritamente os tipos de abas válidos para o sistema
export type PaginaTipo = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'pesquisarContrato';

interface IMenuProps {
  setAbaAtiva: (aba: any) => void;
  setPaginaAtiva: (pagina: any) => void; // <-- Modifique para 'any' aqui
}

// CORREÇÃO: Agora o componente recebe e desestrutura a propriedade enviada pelo pai
export const MenuHamburguer: React.FC<IMenuProps> = ({ setAbaAtiva, setPaginaAtiva}) => {
  const [menuGeralAberto, setMenuGeralAberto] = useState<boolean>(false);

  return (
    <div>
      
      {/* Botão minimalista do ícone */}
      <button 
        className="btn-menu-hamburguer-premium"
        onClick={() => setMenuGeralAberto(!menuGeralAberto)}
      >
        {menuGeralAberto ? '✕' : '☰'}
      </button>

      {/* O Menu Suspenso que agora vai FLUTUAR perfeitamente via CSS absoluto */}
      {menuGeralAberto && (
        <div className="menu-dropdown-caixa-flutuante">
          
          {/* Seção Frota / Usuários */}
          <div className="menu-dropdown-secao-grupo">
            <p className="menu-dropdown-secao-titulo">🛞 Usuários</p>
            <ul>
              <li onClick={() => { setAbaAtiva('listar-frota'); setMenuGeralAberto(false); }}>
                Gestão de Usuários
              </li>
            </ul>
          </div>

          {/* Seção Faturamento / Contrato */}
          <div className="menu-dropdown-secao-grupo">
            <p className="menu-dropdown-secao-titulo">📄 Contrato</p>
            <ul>
              <li onClick={() => { setAbaAtiva('faturas-abertas'); setMenuGeralAberto(false); }}>
                Detalhes do Contrato
              </li>
            </ul>
          </div>

          {/* Seção Faturamento / Contrato */}
          <div className="menu-dropdown-secao-grupo">
            <p className="menu-dropdown-secao-titulo">📄 Trocar contrato</p>
            <ul>
              <li onClick={() => { setPaginaAtiva('pesquisarContrato'); setMenuGeralAberto(false); }}>
                Atendimento
              </li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
