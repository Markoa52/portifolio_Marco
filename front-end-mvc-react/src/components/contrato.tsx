import './contrato.css'; // Toda a estilização do header e abas fica presa aqui!

import React, { useState } from 'react';

import inicial from '../assets/inicial.png'; 
import frota from '../assets/frota.png'; 
import fatura from '../assets/fatura.png'; 
import relatorio from '../assets/relatorio.png'; 
//import Detalhes from '../assets/detalhes.jpg'; 
import DetalhesVpr from '../assets/detalhesvpr.png';
import Pagar from '../assets/pagar.png'

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
    
    {/*UNIFICADO: Agora TODOS os blocos (Menu, Contrato, Saldo e Gastos) estão no mesmo contêiner de linha */}
    <div className="bloco-valores-layout-painel">

      {/* ==========================================
      1. MENU HAMBÚRGUER (Aparece no PC, some no Celular)
      ========================================== */}
      <div className="central-menu-container">
        <MenuHamburguer setAbaAtiva={setAbaAtiva} setPaginaAtiva={setPaginaAtiva} />
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
            <li onClick={() => { setAbaAtiva('listar-frota'); setMenuAberto(null); }}>
              Listar Veículos
            </li>
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
            <li onClick={() => { setAbaAtiva('faturas-abertas'); setMenuAberto(null); }}>
              Faturas Abertas
            </li>
            <li onClick={() => { setAbaAtiva('historico-fatura'); setMenuAberto(null); }}>
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
            <li onClick={() => { setAbaAtiva('relatorio-passagem'); setMenuAberto(null); }}>
              Passagens
            </li>
            <li onClick={() => { setAbaAtiva('relatorio-extrato'); setMenuAberto(null); }}>
              Extrato
            </li>
          </ul>
        )}
      </div>

      {/* ==========================================
       2. BLOCO DO CONTRATO CORRIGIDO
       ========================================== */}
      <div className="coluna-financeira-contrato" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="legenda-mini-painel">CONTRATO</span>
        <span className="valor-num-painel-texto" style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, marginTop: '2px' }}>1 Teste</span>
      </div>
      
      {/* ==========================================
          3. BLOCO DO SALDO VALE PEDÁGIO CORRIGIDO
          ========================================== */}
      <div className="container-saldo-Vpr-novo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="legenda-mini-painel">SALDO PEDÁGIO</span>
        <div className="valor-com-icone-linha" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <span className="valor-num-painel" style={{ fontSize: '0.8rem', fontWeight: 700 }}>R$ 1.000,00</span>     
          <div onClick={() => setAbaAtiva('detalhes-pedagio')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img src={DetalhesVpr} alt="Ver detalhes" className="card-imagem-vpr-nova" style={{ width: '10px', height: '10px' }} />
          </div>
        </div>
      </div>  
      
      {/* ==========================================
          4. BLOCO DE GASTOS ATUAIS CORRIGIDO
          ========================================== */}
      <div className="container-gastos-painel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div className="gastos-titulos-linha" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span className="legenda-mini-painel">GASTOS ATUAIS</span>
          <span className="gastos-porcentagem-numero" style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700 }}>
            {Math.round(porcentagemConsumida)}%
          </span>
        </div>
      
        <span className="valor-num-painel" style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>{formatarMoeda(valorGasto)}</span>
      
        <div className="barra-progresso-painel-fundo" style={{ width: '100%', height: '3px', backgroundColor: '#222222', borderRadius: '10px', overflow: 'hidden', marginTop: '4px' }}>
          <div 
            style={{ 
              width: `${porcentagemConsumida}%`, 
              height: '100%', 
              background: porcentagemConsumida >= 90 ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : 'linear-gradient(90deg, #4f46e5, #6366f1)', 
              borderRadius: '10px'
            }}
          ></div>
        </div>
              <span className="legenda-limite-texto">Limite: {formatarMoeda(valorMeta)}</span>
            </div>
      
          </div>
        </div>
      </header>


      {/* CONTEÚDO PRINCIPAL (Muda dinamicamente conforme a aba) */}
      <main className="conteudo-principal-abaixo">
        {abaAtiva === 'cards-gerais' && (
          <div className="novos-cards-grid">

            {/* Usamos um nome de classe inédito para ignorar as 2600 linhas antigas */}
            <div className="caixa-card-fatura-limpa">
              <div className="card-linha-horizontal">
                <h3>Fatura</h3>
                <button className="link-fatura-direita" onClick={() => setAbaAtiva('historico-fatura')}>Consultar faturas →</button>
              </div><br></br>

                <div className="card-linha-horizontal">
                  <h1 style={{ color:'red' }}>A Pagar</h1>

                <div>
                  <span>MAIO</span><br></br>
                  <span>VENCIMENTO: 27/08/2024</span><br></br>
                  <span>R$: 32.965,69</span><br></br>
                </div>
                
              </div>
              
            </div>


            {/* Usamos um nome de classe inédito para ignorar as 2600 linhas antigas */}
            <div className="caixa-card-fatura-limpa">
              <div className="card-linha-horizontal">
                <h3>Ultimos pedidos</h3>
                <button className="link-fatura-direita" onClick={() => setAbaAtiva('historico-fatura')}>Consultar pedidos →</button>
              </div>
              conteudo em contrução
            </div>

            {/* Usamos um nome de classe inédito para ignorar as 2600 linhas antigas */}
            <div className="caixa-card-fatura-limpa">
              <div className="card-linha-horizontal">
                <h3>Veículos</h3>
                <button className="link-fatura-direita" onClick={() => setAbaAtiva('historico-fatura')}>Consultar veículos →</button>
              </div>
              conteudo em contrução
            </div>

            {/* Usamos um nome de classe inédito para ignorar as 2600 linhas antigas */}
            <div className="caixa-card-fatura-limpa">
              <div className="card-linha-horizontal">
                <h3>Tag</h3>
                <button className="link-fatura-direita" onClick={() => setAbaAtiva('historico-fatura')}>Ativar tags →</button>
              </div>
              conteudo em contrução
            </div>

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
