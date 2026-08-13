import '../styles/atendimento.css'; 

import React, { useState } from 'react';
import { PesquisarContrato } from './pesquisarContrato';

// 1. Alinhamos os tipos das abas (Deixei idêntico em ambos para evitar erros de TypeScript)
type AbaInferior = 'cards-gerais' | 'pesquisarContrato';

interface IMenuProps {
  // Se o componente pai não monitora essa aba, essa prop pode ser opcional. Deixei mantida por segurança.
  setAbaAtiva?: (pagina: AbaInferior) => void; 
}

export const Atendimento: React.FC<IMenuProps> = ({ }) => {

  // CORREÇÃO 1: Adicionamos a função 'setAbaAtiva' local para o React conseguir alterar o estado desta tela
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');
  const [titulo, setTitulo] = useState<string>('Modulos');

  //Função que altera o nome do modulo conforme click no menu
  const alterarTexto = (nomeModulo: string) => {
    // 2. Esta função muda o valor do estado
    setTitulo(`Modulo ${nomeModulo}`);
  };
  
  return (
    <div className="pagina-container-a">
        <h1 id="nomeModul{o">{titulo}</h1>
      {/* CONTEÚDO PRINCIPAL */}
      <main className="conteudo-principal-abaixo-a">
        
        {abaAtiva === 'cards-gerais' && (
          <div className="novos-cards-grid">
            
            <div className="menu-dropdown-secao-grupo-a">
              <p id="atendimento" className="menu-dropdown-secao-titulo-a">Atendimento</p>
              <ul><li onClick={() => {setAbaAtiva('pesquisarContrato'); alterarTexto('Atendimento');}}>Contratos</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Pedidos e Estoque de Tags</p>
              <ul><li onClick={() => {setAbaAtiva('pesquisarContrato'); alterarTexto('Pedidos e Estoque de Tags');}}>Em construção...</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Faturamento</p>
              <ul><li onClick={() => {setAbaAtiva('pesquisarContrato'); alterarTexto('Faturamento');}}>Em construção...</li></ul>
            </div>

            <div className="menu-dropdown-secao-grupo-a">
              <p className="menu-dropdown-secao-titulo-a">Usuarios</p>
              <ul><li onClick={() => {setAbaAtiva('pesquisarContrato'); alterarTexto('Usuarios');}}>Em construção...</li></ul>
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
