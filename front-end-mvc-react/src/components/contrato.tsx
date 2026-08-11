import './contrato.css'; // Toda a estilização do header e abas fica presa aqui!

import React, { useState } from 'react';

import inicial from '../assets/inicial.png'; 
import frota from '../assets/frota.png'; 
import fatura from '../assets/fatura.png'; 
import relatorio from '../assets/relatorio.png'; 
//import Detalhes from '../assets/detalhes.jpg'; 
import DetalhesVpr from '../assets/detalhesvpr.png';

import { DetalhesPedagio } from './saldoVpr'; 
import { HistoricoFaturas } from './historicoFaturamento'; 
import { FaturasAbertas } from './faturasEmAberto';
import { ListarFrota } from './listarFrota';
import { RelatorioPassagens } from './relatorioPassagem';
import { RelatorioExtrato } from './relatorioExtrato';

// 1. IMPORTA O SEU NOVO COMPONENTE (Ajuste o caminho do arquivo se necessário)
import { MenuHamburguer } from './menuHumburguer'; 

type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato';

export type PaginaTipo = 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato';

interface ISidebarProps {
  setPaginaAtiva: (pagina: PaginaTipo) => void;
}

// CORREÇÃO 1: Adicionado o parâmetro desestruturado correto para sumir com o erro de compilação
export const Contrato: React.FC<ISidebarProps> = ({ setPaginaAtiva }) => {

  const valorGasto  = 4700;
  const valorMeta  = 5000;
     // O React calcula a porcentagem exata automaticamente
  const porcentagemConsumida = Math.min((valorGasto / valorMeta) * 100, 100); // 64

  // Formata os números para o padrão de moeda brasileiro (R$ 3.200,00)
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');

  const alternarSubmenu = (menuName: string) => {
    setMenuAberto(menuAberto === menuName ? null : menuName);
  };

  return (
    <div className="pagina-container">
        
      <header className="header-sistema-novo">
        
        <div className="layout-horizontal-container-novo"> 
          
           {/* BLOCO ÚNICO EM LINHA RETA: Menu, Contrato, Saldo e Gastos */}
           <div className="bloco-valores-layout-painel">

            {/* ==========================================
            1. MENU HAMBÚRGUER (Agora colado na direita, abrindo a linha de valores)
            ========================================== */}
            <div className="central-menu-container">
            <MenuHamburguer  setAbaAtiva={setAbaAtiva} setPaginaAtiva={setPaginaAtiva} />
            </div>

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

            {/* <div className="card-com-submenu">
              <div className="card" style={{ cursor: 'pointer' }}>
                <img src={Detalhes} alt="Ícone" className="card-imagem"/>
                <h2>Detalhes</h2>
              </div>
            </div> */}

            

          </div>

          {/* 1. BLOCO DE SALDO DO CONTRATO COM ESPAÇAMENTO */}
          <div className="container-saldo-Vpr-novo" >
            
            {/* Linha superior: Informações do Contrato */}
            <div style={{ display: 'flex', flexDirection: 'column'}}>
              <span  className="legenda-mini-painel">CONTRATO:</span>
              <span>1 Teste</span>
            </div>
          
            {/* Linha inferior: Título do Saldo e Valor (Adicionado margin-top para dar o espaço) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '30px' }}>
              <span className="legenda-mini-painel">SALDO VALE PEDÁGIO</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '35px' }}>
                <span>R$ 1.000,00</span>     
                
                <div 
                  onClick={() => setAbaAtiva('detalhes-pedagio')} 
                  className="botao-icone-vpr-click"
                  title="Ver detalhes do saldo"
                >
                  <img src={DetalhesVpr} alt="Ver detalhes" className="card-imagem-vpr-nova" />
                </div>
              </div>
            </div>  
            
          </div>


          {/* Lado Direito: Bloco de Gastos Atuais com Barra de Progressão */}
          {/* 2. GASTOS ATUAIS AUTOMÁTICO E DINÂMICO */}
          <div className="container-gastos-painel" style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '160px' }}>
          <div className="gastos-titulos-linha" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span className="legenda-mini-painel">GASTOS ATUAIS</span>
    
          {/* Exibe a porcentagem real arredondada */}
          <span className="gastos-porcentagem-numero" style={{ fontSize: '0.75rem', color: porcentagemConsumida >= 90 ? '#ef4444' : '#6366f1', fontWeight: 700 }}>
            {Math.round(porcentagemConsumida)}%
          </span>
          </div>
  
          {/* Exibe o valor gasto formatado automaticamente */}
          <span className="valor-num-painel">{formatarMoeda(valorGasto)}</span>
  
          {/* A BARRA DE PROGRESSÃO: O preenchimento muda de cor se passar de 90% */}
          <div style={{ width: '100%', height: '6px', backgroundColor: '#222222', borderRadius: '10px', overflow: 'hidden', display: 'block', marginTop: '6px' }}>
          <div 
          style={{ 
          width: `${porcentagemConsumida}%`, // <-- A MÁGICA: A largura agora é dinâmica!
          height: '100%', 
          background: porcentagemConsumida >= 90 
          ? 'linear-gradient(90deg, #ef4444, #b91c1c)' // Vermelho de alerta se estourar 90%
          : 'linear-gradient(90deg, #4f46e5, #6366f1)', // Roxo padrão do sistema
          borderRadius: '10px', 
          display: 'block',
          transition: 'width 0.5s ease-in-out' // Cria um efeito suave de deslize quando o valor muda
          }}
          
          
        ></div>
        
        </div>
        <span>Limite: {formatarMoeda(valorMeta)} </span>
        
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
