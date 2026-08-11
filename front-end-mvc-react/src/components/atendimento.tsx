import './atendimento.css'; 

import React, { useState } from 'react';
import { PesquisarContrato } from './pesquisarContrato';

// 1. Alinhamos os tipos das abas (Deixei idêntico em ambos para evitar erros de TypeScript)
type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'pesquisarContrato';

interface IMenuProps {
  // Se o componente pai não monitora essa aba, essa prop pode ser opcional. Deixei mantida por segurança.
  setAbaAtiva?: (pagina: AbaInferior) => void; 
}

export const Atendimento: React.FC<IMenuProps> = ({ }) => {

  // CORREÇÃO 1: Adicionamos a função 'setAbaAtiva' local para o React conseguir alterar o estado desta tela
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');

  return (
    <div className="pagina-container-a">
        <h3>Gestão</h3>
      {/* CONTEÚDO PRINCIPAL */}
      <main className="conteudo-principal-abaixo">
        
        {abaAtiva === 'cards-gerais' && (
          <div className="novos-cards-grid">
            
            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Atendimento</p>
              <ul><li onClick={() => setAbaAtiva('pesquisarContrato')}>Contratos</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Pedidos</p>
              <ul><li onClick={() => setAbaAtiva('pesquisarContrato')}>Em construção...</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Faturamento</p>
              <ul><li onClick={() => setAbaAtiva('pesquisarContrato')}>Em construção...</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Usuarios</p>
              <ul><li onClick={() => setAbaAtiva('pesquisarContrato')}>Em construção...</li></ul>
            </div>

          </div>
        )}
    
        {/* CORREÇÃO 3: Agora essa condição será acionada perfeitamente! */}
        {abaAtiva === 'pesquisarContrato' && (
          <PesquisarContrato />
        )}
        
      </main>

    </div>
  );
};
