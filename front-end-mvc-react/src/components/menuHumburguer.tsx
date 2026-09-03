import React, { useState } from 'react';
import '../styles/contrato.css'; // Carrega os estilos unificados
import { LogOut, ReceiptText, RefreshCcw, UserPen } from 'lucide-react';
import type { IMenuHumProps } from '../types/IMenuHumProps';

export const MenuHamburguer: React.FC<IMenuHumProps> = ({   
  setPaginaAtiva,  
  setAbaAtiva,
  usuario,
  usuarioLogado
}) => {
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

      {/* O Menu Suspenso que vai FLUTUAR perfeitamente via CSS absoluto */}
      {menuGeralAberto && (
        <div className="menu-dropdown-caixa-flutuante text-start">
          
          {/* Seção Frota / Usuários */}
          <div className="menu-dropdown-secao-grupo mb-3">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <UserPen size={18} className="text-secondary" /> Usuários
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setAbaAtiva('editar-usuario'); setMenuGeralAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Gestão de Usuários
              </li>
            </ul>
          </div>

          {/* Seção Faturamento / Contrato */}
          <div className="menu-dropdown-secao-grupo mb-3">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <ReceiptText size={18} className="text-secondary" /> Contrato
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setAbaAtiva('contrato-detalhe'); setMenuGeralAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Detalhes do Contrato
              </li>
            </ul>
          </div>

          {/* Seção Trocar Contrato */}
          {(usuarioLogado?.perfil !=='cliente' &&

                    <div className="menu-dropdown-secao-grupo mb-4">
            <p className="menu-dropdown-secao-titulo d-flex align-items-center gap-2 fw-bold text-dark m-0 pb-1 fs-6">
              <RefreshCcw size={18} className="text-secondary" /> Trocar contrato
            </p>
            <ul className="list-unstyled ps-1 mt-1">
              <li 
                onClick={() => { setPaginaAtiva('pesquisar-contrato'); setMenuGeralAberto(false); }}
                style={{ cursor: 'pointer' }}
                className="py-1 text-secondary small-hover"
              >
                Atendimento
              </li>
            </ul>
          </div>

          )}


          {/* 📊 SEÇÃO DE IDENTIFICAÇÃO E LOGOFF DENTRO DO SEU MenuHamburguer.tsx */}
          <div className="d-flex align-items-center justify-content-between border-top pt-3 mt-2 gap-2">
            <span className="text-secondary small fw-semibold text-truncate" style={{ maxWidth: '140px', fontSize: '0.75rem' }}>
              👤 {usuario?.nome || "Operador"}
            </span>
          
            <button 
              type="button"
              className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center gap-1 px-2.5 py-1.5 rounded-3"
              style={{ fontSize: '0.75rem' }}
              title="Encerrar sessão com segurança"
              onClick={() => {
                console.log("🧼 [MenuHamburguer] Forçando varredura e reset de disco...");
                
                // 1. Fecha a caixinha visual do menu
                setMenuGeralAberto(false);
                
                // 2. Apaga ABSOLUTAMENTE TUDO do navegador de uma vez só (Token, Usuário, Páginas)
                localStorage.clear();
                sessionStorage.clear();
          
                // 3. 🚀 A FORÇA BRUTA: Destrói toda a memória RAM e força o navegador a carregar a raiz do zero.
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
