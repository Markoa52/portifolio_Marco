import React, { useState } from 'react';
// IMPORTAÇÃO DOS ÍCONES DA LUCIDE (Caso use, para deixar os módulos bonitos)
import { ArrowLeft, Layers, ShoppingBag, CreditCard, Users, PlusCircle } from 'lucide-react';
import { PesquisarContrato } from './pesquisarContrato';
import { CadastroContrato } from './cadastroContrato';
import '../styles/atendimento.css'

type AbaInferior = 'cards-gerais' | 'pesquisarContrato' | 'cadastro-Contrato';

interface IMenuProps {
  setAbaAtiva?: (pagina: AbaInferior) => void; 
}

export const Atendimento: React.FC<IMenuProps> = ({ }) => {
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');
  const [titulo, setTitulo] = useState<string>('Módulos');

  const alterarTexto = (nomeModulo: string) => {
    setTitulo(`Módulo ${nomeModulo}`);
  };

  // Nova função para resetar e voltar ao menu principal de Atendimento
  const voltarParaModulos = () => {
    setAbaAtiva('cards-gerais');
    setTitulo('Módulos');
  };

  return (
    // container limita a largura em 1200px, alinhando perfeitamente com o seu Header branco
    <div className="container my-4 p-0 px-2" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 text-start">
        <div className="d-flex align-items-center gap-2">
          {/* Se não estiver na tela principal, mostra um botão discreto de Voltar */}
          {abaAtiva !== 'cards-gerais' && (
            <button className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-2" onClick={voltarParaModulos} style={{ width: '32px', height: '32px' }}>
              <ArrowLeft size={16} className="text-dark" />
            </button>
          )}
          <h1 className="fs-4 fw-bold text-dark m-0">{titulo}</h1>
        </div>
        
        {abaAtiva !== 'cards-gerais' && (
          <span className="badge bg-light border text-secondary fw-semibold py-1.5 px-2 small cp" onClick={voltarParaModulos}>
            ← Módulos de Atendimento
          </span>
        )}
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="w-100 text-start">
        
        {/* ABA PRINCIPAL: MENU DE SEÇÕES */}
        {abaAtiva === 'cards-gerais' && (
          // row e g-4 organizam os grupos de módulos em colunas simétricas
          <div className="row g-4 m-0">
            
            {/* GRUPO 1: Atendimento */}
            <div className="col-md-6 col-lg-4 ps-0">
              <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <Layers size={18} className="text-primary" />
                  <h4 className="fs-6 fw-bold text-dark m-0">Atendimento</h4>
                </div>
                <ul className="list-unstyled mb-0">
                  <li className="btn btn-outline-dark border-0 text-start w-100 py-2 px-3 fw-semibold rounded-2 d-flex align-items-center justify-content-between cp" 
                      onClick={() => { setAbaAtiva('pesquisarContrato'); alterarTexto('Atendimento'); }}>
                    <span>📄 Contratos de Clientes</span>
                    <span className="text-muted">➔</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GRUPO 2: Cadastro de Contratos */}
            <div className="col-md-6 col-lg-4">
              <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <PlusCircle size={18} className="text-success" />
                  <h4 className="fs-6 fw-bold text-dark m-0">Operações e Vendas</h4>
                </div>
                <ul className="list-unstyled mb-0">
                  <li className="btn btn-outline-dark border-0 text-start w-100 py-2 px-3 fw-semibold rounded-2 d-flex align-items-center justify-content-between cp" 
                      onClick={() => { setAbaAtiva('cadastro-Contrato'); alterarTexto('Cadastro'); }}>
                    <span>➕ Incluir Novo Contrato</span>
                    <span className="text-muted">➔</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GRUPO 3: Pedidos e Estoque (Em Construção) */}
            <div className="col-md-6 col-lg-4 pe-0">
              <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <ShoppingBag size={18} className="text-secondary" />
                  <h4 className="fs-6 fw-bold text-secondary m-0">Pedidos e Estoque de Tags</h4>
                </div>
                <p className="text-muted small mb-0 p-2 bg-light border rounded text-center">
                  🛠️ Módulo em desenvolvimento
                </p>
              </div>
            </div>

            {/* GRUPO 4: Faturamento (Em Construção) */}
            <div className="col-md-6 col-lg-4 ps-0">
              <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <CreditCard size={18} className="text-secondary" />
                  <h4 className="fs-6 fw-bold text-secondary m-0">Faturamento</h4>
                </div>
                <p className="text-muted small mb-0 p-2 bg-light border rounded text-center">
                  🛠️ Módulo em desenvolvimento
                </p>
              </div>
            </div>

            {/* GRUPO 5: Usuários (Em Construção) */}
            <div className="col-md-6 col-lg-4">
              <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <Users size={18} className="text-secondary" />
                  <h4 className="fs-6 fw-bold text-secondary m-0">Usuários</h4>
                </div>
                <p className="text-muted small mb-0 p-2 bg-light border rounded text-center">
                  🛠️ Módulo em desenvolvimento
                </p>
              </div>
            </div>

          </div>
        )}
    
        {/* SUB-ABAS DINÂMICAS */}
        <div className="w-100 m-0 p-0">
          {abaAtiva === 'pesquisarContrato' && <PesquisarContrato />}
          {abaAtiva === 'cadastro-Contrato' && <CadastroContrato />}
        </div>
        
      </main>
    </div>
  );
};
