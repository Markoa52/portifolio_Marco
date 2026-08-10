import React, { useState } from 'react';
import inicial from '../assets/inicial.png'; 
import frota from '../assets/frota.png'; 
import fatura from '../assets/fatura.png'; 
import relatorio from '../assets/relatorio.png'; 
import Detalhes from '../assets/detalhes.jpg'; 
import DetalhesVpr from '../assets/detalhesvpr.png';

import { DetalhesPedagio } from './saldoVpr'; 
import { HistoricoFaturas } from './historicoFaturamento'; 
import { FaturasAbertas } from './faturasEmAberto';
import { ListarFrota } from './listarFrota';
import { RelatorioPassagens } from './relatorioPassagem';
import { RelatorioExtrato } from './relatorioExtrato';

type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato';

export type PaginaTipo = 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato';

interface ISidebarProps {
  setPaginaAtiva: (pagina: PaginaTipo) => void;
}

// CORREÇÃO 1: Adicionado o parâmetro desestruturado correto para sumir com o erro de compilação
export const Contrato: React.FC<ISidebarProps> = () => {

  // const gasto = 3200;
  // const limite = 5000;
  // const porcentagem = (gasto / limite) * 100; // 64

  // No style: style={{ width: `${porcentagem}%`, background: porcentagem > 90 ? '#ef4444' : '#4f46e5' }}


  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');

  const alternarSubmenu = (menuName: string) => {
    setMenuAberto(menuAberto === menuName ? null : menuName);
  };

  return (
    <div className="pagina-container">
        
      <header className="header-sistema">
        <div className="layout-horizontal-container"> 
          <div className="grid-cards-esquerda">
            
            {/* ITEM 1: INÍCIO */}
            <div className="card" onClick={() => { setAbaAtiva('cards-gerais'); setMenuAberto(null); }} style={{ cursor: 'pointer' }}>
              <img src={inicial} alt="Ícone" className="card-imagem"/>
              <h2>Inicio</h2>
            </div>

            {/* ITEM 2: FROTA */}
            <div className="card-com-submenu">
              <div className="card" onClick={() => alternarSubmenu('frota')} style={{ cursor: 'pointer' }}>
                <img src={frota} alt="Ícone" className="card-imagem"/>
                <h2>Frota ▾</h2>
              </div>
              {menuAberto === 'frota' && (
                <ul className="submenu-lista">
                  {/* CORREÇÃO 2: Plugado o clique real para abrir a tela de Listar Frota */}
                  <li onClick={() => {
                    setAbaAtiva('listar-frota');
                    setMenuAberto(null);
                  }}>
                    Listar Veículos
                  </li>
                  {/* <li onClick={() => console.log('Manutenção')}>Manutenção</li>
                  <li onClick={() => console.log('Abastecimento')}>Abastecimento</li> */}
                </ul>
              )}
            </div>
            
            {/* ITEM 3: FATURAS */}
            <div className="card-com-submenu">
              <div className="card" onClick={() => alternarSubmenu('faturas')} style={{ cursor: 'pointer' }}>
                <img src={fatura} alt="Ícone" className="card-imagem"/>
                <h2>Faturas ▾</h2>
              </div>
              {menuAberto === 'faturas' && (
                <ul className="submenu-lista">
                  <li onClick={() => {
                    setAbaAtiva('faturas-abertas'); 
                    setMenuAberto(null);
                  }}>
                    Faturas Abertas
                  </li>
                  <li onClick={() => {
                    setAbaAtiva('historico-fatura'); 
                    setMenuAberto(null);              
                  }}>
                    Histórico de Pagamentos
                  </li>
                </ul>
              )}
            </div>

            {/* ITEM 4: RELATÓRIOS */}
            <div className="card-com-submenu">
              <div className="card" onClick={() => alternarSubmenu('relatorios')} style={{ cursor: 'pointer' }}>
                <img src={relatorio} alt="Ícone" className="card-imagem"/>
                <h2>Relatórios ▾</h2>
              </div>
              {menuAberto === 'relatorios' && (
              <ul className="submenu-lista">
                <li onClick={() => {
                  setAbaAtiva('relatorio-passagem');
                  setMenuAberto(null);
                }}>
                  Passagens
                </li>
                {/* SEGUNDO LINK ATUALIZADO */}
                <li onClick={() => {
                  setAbaAtiva('relatorio-extrato'); // <-- Abre a tela de extrato
                  setMenuAberto(null);
                }}>
                  Extrato
                </li>
              </ul>
            )}
            </div>

            <div className="card-com-submenu">
              <div className="card" style={{ cursor: 'pointer' }}>
                <img src={Detalhes} alt="Ícone" className="card-imagem"/>
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
              <div onClick={() => setAbaAtiva('detalhes-pedagio')} style={{ cursor: 'pointer' }}>
                <img src={DetalhesVpr} alt="Ícone" className="card-imagem-vpr"/>
              </div>
            </div>  
          </div>

          {/* Lado Direito: Bloco de Gastos Atuais Reforçado */}
          <div className="container-gastos-direita-fixo">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Gastos atuais</h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Limite: R$ 5.000,00</span>
          </div>
          
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>R$ 3.200,00</p>
          
          {/* A Barra de Progressão com CSS Inline Forçado para Teste Absoluto */}
          <div style={{ width: '100%', height: '10px', backgroundColor: '#2d2d2d', borderRadius: '10px', overflow: 'hidden', display: 'block', margin: '6px 0' }}>
            <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #4f46e5, #6366f1)', borderRadius: '10px', display: 'block' }}></div>
          </div>
          
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>64% consumido</span>
          </div>
          
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (Muda dinamicamente conforme a aba) */}
      <main className="conteudo-principal-abaixo">
        {abaAtiva === 'cards-gerais' && (
          <div className="novos-cards-grid">
            <div className="novo-card-item"><h3>Novo Card 1</h3><p>Conteúdo original...</p></div>
            <div className="novo-card-item"><h3>Novo Card 2</h3><p>Conteúdo original...</p></div>
            <div className="novo-card-item"><h3>Novo Card 3</h3><p>Conteúdo original...</p></div>
            <div className="novo-card-item"><h3>Novo Card 4</h3><p>Conteúdo original...</p></div>
          </div>
        )}
    
        {abaAtiva === 'detalhes-pedagio' && (
          <DetalhesPedagio onVoltar={() => setAbaAtiva('cards-gerais')} />
        )}

        {abaAtiva === 'historico-fatura' && (
          <HistoricoFaturas />
        )}

        {abaAtiva === 'faturas-abertas' && (
          <FaturasAbertas  />
        )}

        {abaAtiva === 'listar-frota' && (
          <ListarFrota />
        )}

        {abaAtiva === 'relatorio-passagem' && (
          <RelatorioPassagens />
        )}
        {abaAtiva === 'relatorio-extrato' && (
          <RelatorioExtrato />
        )}

      </main>

    </div>
  );
};
