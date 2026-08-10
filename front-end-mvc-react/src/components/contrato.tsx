import React, { useState } from 'react';
import inicial from '../assets/inicial.png'; 
import frota from '../assets/frota.png'; 
import fatura from '../assets/fatura.png'; 
import relatorio from '../assets/relatorio.png'; 
import Detalhes from '../assets/detalhes.jpg'; 
import DetalhesVpr from '../assets/detalhesvpr.png';

import { DetalhesPedagio } from './saldoVpr'; // Importa a nova página 
import { HistoricoFaturas } from './historicoFaturamento'; // Importa a nova página 
import {FaturasAbertas} from './faturasEmAberto';

type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas';
type PaginaTipo = 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato';

interface ISidebarProps {
  setPaginaAtiva: (pagina: PaginaTipo) => void;
}

export const Contrato: React.FC<ISidebarProps> = ({}) => {

  // Estado para controlar qual submenu está aberto (guarda o nome do menu ou null)
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');

  // Função para alternar a abertura do submenu ao clicar
  const alternarSubmenu = (menuName: string) => {
    setMenuAberto(menuAberto === menuName ? null : menuName);
  };

  return (
    
    <div className="pagina-container">
        
      {/* HEADER COM SUBMENUS */}
      <header className="header-sistema">

        <div className="layout-horizontal-container"> 
          <div className="grid-cards-esquerda">
            
            {/* ITEM 1: PÁGINA INICIAL (Botão simples) */}
            <div className="card" onClick={() => { setAbaAtiva('cards-gerais'); setMenuAberto(null); }} style={{ cursor: 'pointer' }}>
            <img src={inicial} alt="Ícone de Frota" className="card-imagem"/>
              <h2>Inicio ▾</h2>
            </div>

            {/* ITEM 2: FROTA (Com Submenu) */}
            <div className="card-com-submenu">
                
              <div className="card" onClick={() => alternarSubmenu('frota')} style={{ cursor: 'pointer' }}>
                <img src={frota} alt="Ícone de Frota" className="card-imagem"/>
                <h2>Frota ▾</h2>
              </div>
              {menuAberto === 'frota' && (
                <ul className="submenu-lista">
                  <li onClick={() => console.log('Listar Veículos')}>Listar Veículos</li>
                  <li onClick={() => console.log('Manutenção')}>Manutenção</li>
                  <li onClick={() => console.log('Abastecimento')}>Abastecimento</li>
                </ul>
              )}
            </div>
            
            {/* ITEM 3: FATURAS (Com Submenu) */}
            <div className="card-com-submenu">
            <div className="card" onClick={() => alternarSubmenu('faturas')} style={{ cursor: 'pointer' }}>
            <img src={fatura} alt="Ícone de Frota" className="card-imagem"/>
            <h2>Faturas ▾</h2>
            </div>
  
            {menuAberto === 'faturas' && (
            <ul className="submenu-lista">
            {/* Opção 1: Abre a página de histórico de faturas */}
            <li onClick={() => {
            setAbaAtiva('historico-fatura'); // Abre a nova página que você acabou de criar
            setMenuAberto(null);              // Fecha a listinha suspensa
            }}>
            Histórico de Pagamentos
            </li>

           {/* Opção 2: Exemplo caso você crie outra aba no futuro */}
           <li onClick={() => {
            setAbaAtiva('faturas-abertas'); 
            setMenuAberto(null);
           }}>
            Faturas Abertas
           </li>
           </ul>
           )}
           </div>

            {/* ITEM 4: RELATÓRIOS (Com Submenu) */}
            <div className="card-com-submenu">
              <div className="card" onClick={() => alternarSubmenu('relatorios')} style={{ cursor: 'pointer' }}>
                <img src={relatorio} alt="Ícone de Frota" className="card-imagem"/>
                <h2>Relatórios ▾</h2>
              </div>
              {menuAberto === 'relatorios' && (
                <ul className="submenu-lista">
                  <li onClick={() => console.log('Consumo Mensal')}>Consumo Mensal</li>
                  <li onClick={() => console.log('Gastos Anuais')}>Gastos Anuais</li>
                </ul>
              )}
            </div>

            <div className="card-com-submenu">

            <div className="card" style={{ cursor: 'pointer' }}>
                <img src={Detalhes} alt="Ícone de Frota" className="card-imagem"/>
                <h2>Detalhes</h2>
            </div>
            </div>

           </div>

           <div className="container-saldo-Vpr">
            <h4>Contrato: </h4> 
            <h4> 1 Teste</h4><br></br>

            <div className="grupo-operacional-pesquisa">
            <h4>Saldo Vale Pedágio: </h4> 
            <h4> R$ 1.000.00 </h4>     

            {/* O CLIQUE NA IMAGEM MUDA APENAS A ABA INFERIOR */}
              <div onClick={() => setAbaAtiva('detalhes-pedagio')} style={{ cursor: 'pointer' }}>
                <img src={DetalhesVpr} alt="Ícone de Frota" className="card-imagem-vpr"/>
              </div>
            
            </div>  
           </div>

          {/* Lado Direito: Bloco de Gastos */}
          <div className="container-gastos-direita">
            <h3>Gastos atuais</h3>
            <p>Valores aqui</p>
          </div>
          
        </div>

      </header>

      {/* GRADE 2x2 DE CARDS ABAIXO */}
      {/* 2. CONTEÚDO PRINCIPAL (Exibe estritamente uma tela OU a outra) */}
     <main className="conteudo-principal-abaixo">
     {abaAtiva === 'cards-gerais' && (
    
     /* SE FOR VERDADE: Mostra os cards gerais */
     <div className="novos-cards-grid">
      <div className="novo-card-item">
        <h3>Novo Card 1</h3>
        <p>Conteúdo original...</p>
      </div>
      <div className="novo-card-item">
        <h3>Novo Card 2</h3>
        <p>Conteúdo original...</p>
      </div>
      <div className="novo-card-item">
        <h3>Novo Card 3</h3>
        <p>Conteúdo original...</p>
      </div>
      <div className="novo-card-item">
        <h3>Novo Card 4</h3>
        <p>Conteúdo original...</p>
      </div>
     </div>

   )}
    
       {abaAtiva === 'detalhes-pedagio' && (
          // Chamamos o componente isolado e passamos a ação de voltar
          <DetalhesPedagio onVoltar={() => setAbaAtiva('cards-gerais')} />
        )}

        {abaAtiva === 'historico-fatura' && (
          // Chamamos o componente isolado e passamos a ação de voltar
          <HistoricoFaturas />
        )}

        {abaAtiva === 'faturas-abertas' && (
          // Chamamos o componente isolado e passamos a ação de voltar
          <FaturasAbertas  />
        )}

        

</main>

    </div>
  );
};
