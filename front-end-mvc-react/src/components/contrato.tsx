import '../styles/contrato.css'; // Toda a estilização do header e abas fica presa aqui!
import { Home, Truck, FileText, BarChart3, Info } from "lucide-react";

import React, { useState } from 'react';

import { DetalhesPedagio } from './saldoVpr'; 
import { HistoricoFaturas } from './historicoFaturamento'; 
import { FaturasAbertas } from './faturasEmAberto';
import { ListarFrota } from './listarFrota';
import { RelatorioPassagens } from './relatorioPassagem';
import { RelatorioExtrato } from './relatorioExtrato';
import { EditarUsuario } from './editarUsuario';
import { Usuario } from './usuario';
import { MenuMobileModulos } from './menuHumbugerMobile';
//import { Pedidos} from './pedidos';

// 1. IMPORTA O SEU NOVO COMPONENTE (Ajuste o caminho do arquivo se necessário)
import { MenuHamburguer } from './menuHumburguer'; 
import type { IEmailRegistro } from '../types';

export type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'editar-usuario' | 'usuario' | 'cadastro-Contrato' | 'pedidos';

export type PaginaTipo = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'pesquisarContrato' | 'editar-usuario' | 'usuario' | 'pedidos'
 |'contrato' | 'dashboard' | 'consumoAPI' | 'atendimento' | 'cadastro-Contrato';

interface IContratoProps {
  setPaginaAtiva: (pagina: any) => void;
  paginaAtiva: string;
  dadosOneDrive: IEmailRegistro[]; // 🌟 Recebe os dados normalizados vindos do App.tsx
}

// CORREÇÃO 1: Adicionado o parâmetro desestruturado correto para sumir com o erro de compilação
export const Contrato: React.FC<IContratoProps> = ({ setPaginaAtiva, paginaAtiva }) => {
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
      
    {/* ==========================================================================
        1. CABEÇALHO PRINCIPAL (FLEXBOX FLUIDO E TOTALMENTE RESPONSIVO)
        ========================================================================== */}
    {/* 🌟 CALIBRAÇÃO FINAL DO TAMANHO DO HEADER */}
    <header 
      className="navbar navbar-light bg-white py-3 shadow-sm mx-auto"  
      style={{ 
        width: 'calc(100% - 33px)', // Ajustado de 32px para 24px para expandir o cabeçalho no celular
        maxWidth: "1200px",          // Ajustado de 1152px para 1176px para alinhar de ponta a ponta no notebook
        margin: "0 auto", 
        borderRadius: "0 0 12px 12px", 
        borderBottom: "1px solid #e2e8f0",
        boxSizing: 'border-box'
      }}
    >

      {/* d-flex flex-column flex-md-row faz o menu ficar em linha no PC e empilhar bonito no celular */}
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 p-0 w-100">
        
        {/* LADO ESQUERDO: MENUS E NAVEGAÇÃO */}
        {/* 'justify-content-center justify-content-md-start' centraliza os ícones apenas no celular */}
        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-1 gap-md-2 flex-wrap" style={{ marginTop: '-20px' }}>
          
          {/* MENU HAMBÚRGUER MOBILE */}
          <div className="d-block d-md-none me-2 text-dark" style={{ marginTop: '-37px' }} >
            <MenuMobileModulos setAbaAtiva={setAbaAtiva} />
          </div>

          {/* MENU HAMBÚRGUER DESKTOP */}
          <div className="d-none d-md-block mx-2 mx-md-3">
            <MenuHamburguer setAbaAtiva={setAbaAtiva} setPaginaAtiva={setPaginaAtiva} />
          </div>

          {/* ITEM 1: INÍCIO */}
          <div 
            className="btn btn-menu-limpo d-flex flex-column align-items-center p-2 text-decoration-none text-dark border-0" 
            onClick={() => { setAbaAtiva('cards-gerais'); setMenuAberto(null); }}
            style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
          >
            <Home size={26} color="#475569" strokeWidth={2} className="mb-2" />
            <span className="fs-5 fw-bold">Início</span>
          </div>

          {/* ITEM 2: FROTA */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'frota' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('frota')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <Truck size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Frota</span>
            </button>
            {menuAberto === 'frota' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('listar-frota'); setMenuAberto(null); }}>
                  Listar Veículos
                </li>
              </ul>
            )}
          </div>
          
          {/* ITEM 3: FATURAS */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'faturas' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('faturas')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <FileText size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Faturas</span>
            </button>
            {menuAberto === 'faturas' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('faturas-abertas'); setMenuAberto(null); }}>
                  Faturas Abertas
                </li>
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('historico-fatura'); setMenuAberto(null); }}>
                  Histórico de Pagamentos
                </li>
              </ul>
            )}
          </div>

          {/* ITEM 4: RELATÓRIOS */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'relatorios' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('relatorios')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <BarChart3 size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Relatórios</span>
            </button>
            {menuAberto === 'relatorios' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('relatorio-passagem'); setMenuAberto(null); }}>
                  Passagens
                </li>
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('relatorio-extrato'); setMenuAberto(null); }}>
                  Extrato
                </li>
              </ul>
            )}
          </div>

        </div>

        {/* LADO DIREITO: BLOCOS INFORMATIVOS FINANCEIROS (BLINDADO VIA STYLES INLINE) */}
        <div className="d-flex align-items-center justify-content-end text-dark mt-2 mt-md-0 px-2 px-md-0" style={{ gap: '35px' }}>
          
          {/* CONTRATO */}
          {/* MUDANÇA: Forçado margin-right de 24px para afastar do Saldo Pedágio */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', marginRight: '16px' }}>
            <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CONTRATO</span>
            <span className="fs-5 fw-bold text-dark mt-1">1 Teste</span>
          </div>
          
          {/* SALDO VALE PEDÁGIO CORRIGIDO */}
          {/* MUDANÇA: Alterado 'alignItems' de 'flex-end' para 'flex-start' para puxar o texto para a esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', marginRight: '16px' }}>
            <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>SALDO PEDÁGIO</span>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="fs-5 fw-bold text-dark">R$ 1.000,00</span>     
              <div onClick={() => setAbaAtiva('detalhes-pedagio')} className="cp d-flex align-items-center" style={{ cursor: 'pointer' }}>
                <Info size={14} color="#64748b" strokeWidth={2.5} />
              </div>
            </div>
          </div>  

          {/* GASTOS ATUAIS COM VALOR TRAVADO À DIREITA */}
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', minWidth: '140px', maxWidth: '140px' }}>
  
         <div className="d-flex justify-content-between w-100 align-items-center">
         <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>GASTOS ATUAIS</span>
         <span className="fw-bold text-primary" style={{ fontSize: '0.85rem', marginRight: '10px' }}>
           {Math.round(porcentagemConsumida)}%
         </span>
         </div>

         {/* CORREÇÃO CHAVE: 'd-block w-100 text-end' força o valor financeiro a pular para a ponta direita */}
         <span className="fs-5 fw-bold mt-1 text-dark d-block w-100 text-start" style={{ textAlign: 'left' }}>
           {formatarMoeda(valorGasto)}
         </span>

         <div className="progress w-100 bg-light mt-1 rounded-pill" style={{ height: '10px', border: '1px solid #e2e8f0',marginRight: '5px' }}>
           <div 
             className={`progress-bar rounded-pill ${porcentagemConsumida >= 90 ? 'bg-danger' : 'bg-primary'}`}
             role="progressbar"
             style={{ width: `${porcentagemConsumida}%` }}
             aria-valuenow={porcentagemConsumida}
           ></div>
         </div>
         
         <span className="fs-10 fw-bold mt-1 text-dark d-block w-100 text-start" style={{  textAlign: 'left' }}>
           Limite: {formatarMoeda(valorMeta)}
         </span>

           </div>
           </div>
           </div>
           </header>

      {/* ==========================================================================
          CONTEÚDO PRINCIPAL DINÂMICO (GRID TOTALMENTE RESPONSIVO)
          ========================================================================== */}
       {/* CONTEÚDO PRINCIPAL (Muda dinamicamente conforme a aba) */}
      <main className="container my-4 p-0" style={{ maxWidth: "1200px", margin: "0 auto", width: 'calc(100% - 33px)'}}>
      
        {/* ABA 1: PAINEL GERAL (CARDS) */}
        {abaAtiva === 'cards-gerais' && (
          /* MUDANÇA: 'g-3' gerencia o espaçamento de forma simétrica e correta */
          <div className="row g-3">
      
        {/* CARD 1: Fatura (Esquerda Superior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Fatura</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Consultar faturas →
              </button>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: '0.85rem' }}>
              Sua fatura está fechada e aguardando pagamento
            </p>
            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
              <h1 className="fs-4 mb-0 fw-bold text-danger">A Pagar</h1>
              <div className="text-end fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                <span className="badge bg-secondary mb-1">MAIO</span><br />
                <span className="d-block mb-1">VENCIMENTO: 27/08/2024</span>
                <span className="fs-6 fw-bold text-dark d-block">R$: 32.965,69</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Últimos Pedidos (Direita Superior) */}
        <div className="col-md-6 p-2">
          <div className="card p-3 h-100 shadow-sm border border-light-subtle bg-white d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Últimos pedidos</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Consultar pedidos →
              </button>
            </div>

            <div className="position-relative px-2 mt-1 pt-1">
              <div className="position-absolute start-0 end-0 bg-secondary-subtle" style={{ height: '2px', zIndex: 0, top: '10px' }}></div>
              
              <div className="d-flex justify-content-between text-center position-relative mb-1" style={{ zIndex: 1 }}>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>✓</span></div>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>2</span></div>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-secondary-subtle text-secondary border d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>3</span></div>
              </div>

              <div className="d-flex justify-content-between text-center">
                <div style={{ width: '30%' }}>
                  <p className="fw-bold text-success mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Realizado</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>12 Ago • 14:32</span>
                </div>
                <div style={{ width: '30%' }}>
                  <p className="fw-bold text-primary mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Em separação</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>12 Ago • 15:10</span>
                </div>
                <div style={{ width: '30%' }}>
                  <p className="fw-semibold text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Enviado para transportadora</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>Aguardando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Veículos (Esquerda Inferior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Veículos</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Consultar veículos →
              </button>
            </div>
            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
              <h2 className="fs-2 mb-0 fw-bold text-dark">2.800</h2>
              <div className="text-end fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                <span className="badge bg-success mb-1" style={{ fontSize: '0.7rem' }}>1.800</span>
                <span className="d-block mb-2 text-muted" style={{ fontSize: '0.75rem' }}>Com tag ativa</span>
                <span className="badge bg-secondary mb-1" style={{ fontSize: '0.7rem' }}>400</span>
                <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>Sem tag</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Tag (Direita Inferior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Tag</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Ativar tags →
              </button>
            </div>
            <div className="alert alert-secondary py-2 px-3 text-center mb-0 fw-medium" role="alert" style={{ fontSize: '0.8rem' }}>
              🛠️ Conteúdo em construção
            </div>
          </div>
        </div>

      </div>
    )}

    {/* ==========================================================================
        RESTAURAÇÃO DAS OUTRAS ABAS DO SEU SISTEMA
        ========================================================================== */}
    <div className="w-100 m-0 p-0">
      {abaAtiva === 'detalhes-pedagio' && (
        <DetalhesPedagio onVoltar={() => setAbaAtiva('cards-gerais')} />
      )}
    
      {abaAtiva === 'historico-fatura' && (
        <HistoricoFaturas />
      )}
    
      {abaAtiva === 'faturas-abertas' && (
        <FaturasAbertas />
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
    
      {abaAtiva === 'editar-usuario' && (
        <EditarUsuario 
          setPaginaAtiva={setPaginaAtiva} 
          setAbaAtiva={setAbaAtiva} 
        />
      )}
    
      {(abaAtiva === 'usuario' || paginaAtiva === 'usuario') && (
        <Usuario setPaginaAtiva={setPaginaAtiva} />
      )}
    </div>
  
  </main>

</div>
  );
};

