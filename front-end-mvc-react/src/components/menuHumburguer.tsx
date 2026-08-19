import React, { useState } from 'react';
import '../styles/contrato.css'; // Carrega os estilos unificados

// Definimos estritamente os tipos de abas válidos para o sistema
import type { PaginaTipo } from './contrato';
import { ReceiptText, RefreshCcw, UserPen } from 'lucide-react';

interface IMenuProps {
  setAbaAtiva: (aba: any) => void;
  setPaginaAtiva: (pagina: PaginaTipo) => void; // <-- Modifique para 'any' aqui
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
            <p className="menu-dropdown-secao-titulo"><UserPen size={22} className="text-dark" /> Usuários</p>
            <ul>
              <li onClick={() => { setAbaAtiva('editar-usuario'); setMenuGeralAberto(false); }}>
                Gestão de Usuários
              </li>
            </ul>
          </div>

          {/* Seção Faturamento / Contrato */}
          <div className="menu-dropdown-secao-grupo">
            <p className="menu-dropdown-secao-titulo"><ReceiptText size={22} className="text-dark" />Contrato</p>
            <ul>
              <li onClick={() => { setAbaAtiva('faturas-abertas'); setMenuGeralAberto(false); }}>
                Detalhes do Contrato
              </li>
            </ul>
          </div>

          {/* Seção Faturamento / Contrato */}
          <div className="menu-dropdown-secao-grupo">
            <p className="menu-dropdown-secao-titulo"><RefreshCcw size={22} className="text-dark" /> Trocar contrato</p>
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
