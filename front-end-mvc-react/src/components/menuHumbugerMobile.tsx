import React, { useState } from 'react';
import '../styles/contrato.css'; // Carrega os estilos unificados
import type { IMenuMobileProps } from '../types/IMenuMobileProps';
import { BarChart3, FileText, LogOut, RefreshCcw, Tag, Truck } from 'lucide-react';

export const MenuMobileModulos: React.FC<IMenuMobileProps> = ({ setAbaAtiva, setPaginaAtiva, usuario, usuarioLogado }) => {
  const [aberto, setAberto] = useState<boolean>(false);

  console.log('usuario',usuarioLogado )

  return (
    <div className="container-menu-hamburguer-mobile-exclusivo" style={{ position: 'relative', display: 'inline-block' }}>
      
      {/* Botão quadrado compacto ☰ / ✕ */}
      <button className="btn-menu-hamburguer-premium"
        onClick={() => setAberto(!aberto)}
       
      >
        {aberto ? '✕' : '☰'}
      </button>

      {/* Caixa Dropdown Flutuante que desce ao clicar (Usa position absolute para VOAR por cima do layout) */}
      {aberto && (
        <div className="menu-dropdown-caixa-flutuante text-start">
          
          {/* Seção Inicio */}
         <div className="menu-dropdown-secao-grupo mb-0">
          <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setAbaAtiva('cards-gerais'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
               Inicio
              </li>
            </ul>
         </div>
          
          {/* Seção Frota */}
          <div className="menu-dropdown-secao-grupo mb-0">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <Truck size={18} className="text-secondary" /> Listar Veículos
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setAbaAtiva('listar-frota'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
               Frota
              </li>
            </ul>
          </div>

          {/* Seção Tag */}
          <div className="menu-dropdown-secao-grupo mb-0">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <Tag size={18} className="text-secondary" /> Tag
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
               onClick={() => { setAbaAtiva('consultaPedidosCards'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Pedido tag
              </li>

              <li 
                onClick={() => { setAbaAtiva('tag'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Ativar tag
              </li>
                            <li 
                onClick={() => { setAbaAtiva('estoque-tag'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Extoque tag
              </li>
            </ul>
          </div>

          {/* Seção Faturas */}
          <div className="menu-dropdown-secao-grupo mb-0">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <FileText size={18} className="text-secondary" /> Faturas
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setAbaAtiva('faturas-abertas'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Faturas Abertas
              </li>

              <li 
                onClick={() => { setAbaAtiva('historico-fatura'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Histórico de Pagamentos
              </li>
            </ul>
          </div>

          {/* Seção Relatórios */}
          <div className="menu-dropdown-secao-grupo mb-0">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <BarChart3 size={18} className="text-secondary" /> Relatórios
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
               onClick={() => { setAbaAtiva('relatorio-passagem'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Passagens
              </li>

              <li 
                onClick={() => { setAbaAtiva('relatorio-extrato'); setAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Extrato
              </li>
            </ul>
          </div>

          {/* Seção Trocar Contrato Otimizada */}
          <div className="menu-dropdown-secao-grupo mb-0">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <RefreshCcw size={18} className="text-secondary" /> Trocar contrato
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { 
                  // Se for admin vai para 'atendimento', senão vai para 'pesquisar-contrato'
                  setPaginaAtiva(usuarioLogado?.perfil === 'admin' ? 'atendimento' : 'pesquisar-contrato'); 
                  setAberto(false); 
                }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                {/* Se for admin exibe 'Modulos', senão exibe 'Atendimento' */}
                {usuarioLogado?.perfil === 'admin' ? 'Modulos' : 'Atendimento'}
              </li>
            </ul>
          </div>

          {/* SEÇÃO DE IDENTIFICAÇÃO E LOGOFF DENTRO DO SEU MenuHamburguer.tsx */}
          <div className="d-flex align-items-center justify-content-between border-top pt-0 mt-0 gap-2">
            <span className="text-secondary small fw-semibold text-truncate" style={{ maxWidth: '140px', fontSize: '0.75rem' }}>
              👤 {usuarioLogado?.nome || "Operador"}
            </span>
          
            <button 
              type="button"
              className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-3"
              style={{ fontSize: '0.75rem' }}
              title="Encerrar sessão com segurança"
              onClick={() => {
                console.log("🧼 [MenuHamburguer] Forçando varredura e reset de disco...");
                
                // 1. Fecha a caixinha visual do menu
                setAbaAtiva(false);
                
                // 2. Apaga ABSOLUTAMENTE TUDO do navegador de uma vez só (Token, Usuário, Páginas)
                localStorage.clear();
                sessionStorage.clear();
          
                // 3. A FORÇA BRUTA: Destrói toda a memória RAM e força o navegador a carregar a raiz do zero.
                // Como limpamos o localStorage acima, o App.tsx vai acordar sem token e vai montar a TelaLogin na hora!
                window.location.href = '/'; 
              }}
            >
              <LogOut size={13} /> Sair
            </button>
          </div>


        </div>
      )}
    </div>
  );
};
