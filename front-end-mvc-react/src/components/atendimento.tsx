import React, { useState } from 'react';
import { Layers, PlusCircle, ShoppingBag, CreditCard, Users, ArrowLeft } from 'lucide-react';
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

  const voltarParaModulos = () => {
    setAbaAtiva('cards-gerais');
    setTitulo('Módulos');
  };

  return (
    /* TRAVA 1: Força o container a ocupar 100% da largura disponível na tela, limpando travas do pai */
    <div className="container my-3 my-md-4 px-3 pagina-layout-atendimento-blindado">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom pb-3 mb-4 text-start gap-2">
        <div className="d-flex align-items-center gap-2">
          {abaAtiva !== 'cards-gerais' && (
            <button className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-1" onClick={voltarParaModulos} style={{ width: '32px', height: '32px' }}>
              <ArrowLeft size={16} className="text-dark" />
            </button>
          )}
          <h1 className="fs-4 fw-bold text-dark m-0">{titulo}</h1>
        </div>
        
        {abaAtiva !== 'cards-gerais' && (
          <span className="badge bg-light border text-secondary fw-semibold py-1.5 px-2 small cp" onClick={voltarParaModulos} style={{ cursor: 'pointer' }}>
            ← Módulos de Atendimento
          </span>
        )}
      </div>

      {/* TRAVA 2: Força o <main> a limpar displays antigos (como flex/grid manuais) e ocupar a largura inteira */}
      {/* CONTEÚDO PRINCIPAL (Trocamos a classe antiga 'conteudo-principal-abaixo-a' por 'w-100') */}
<main className="w-100 text-start mt-2">
  
  {/* ABA PRINCIPAL: MENU DE SEÇÕES */}
  {abaAtiva === 'cards-gerais' && (
    /* CORREÇÃO CHAVE: Removemos a div '.novos-cards-grid' antiga que quebrava o layout */
    /* A 'row' agora fica livre e comanda as colunas perfeitamente */
    <div className="row g-3 g-md-4 m-0 w-100">
      
      {/* GRUPO 1: Atendimento */}
      {/* No celular (col-12) ocupa a tela cheia. No notebook (col-md-6 col-lg-4) divide em 3 colunas */}
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card p-3 p-md-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3">
          <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
            <Layers size={18} className="text-primary" />
            <h4 className="fs-6 fw-bold text-dark m-0">Atendimento</h4>
          </div>
          <ul className="list-unstyled mb-0">
            <li className="btn btn btn-light border btn-sm text-secondary fw-semibold border-0 text-start w-100 py-2 px-3 fw-semibold rounded-2 d-flex align-items-center justify-content-between cp" 
                onClick={() => { setAbaAtiva('pesquisarContrato'); alterarTexto('Atendimento'); }}>
              <span style={{ fontSize: '0.9rem' }}>📄 Contratos de Clientes</span>
              <span className="text-muted">➔</span>
            </li>
          </ul>
        </div>
      </div>

      {/* GRUPO 2: Cadastro de Contratos */}
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card p-3 p-md-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3">
          <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
            <PlusCircle size={18} className="text-success" />
            <h4 className="fs-6 fw-bold text-dark m-0">Operações e Vendas</h4>
          </div>
          <ul className="list-unstyled mb-0">
            <li className="btn btn btn-light border btn-sm text-secondary fw-semibold border-0 text-start w-100 py-2 px-3 fw-semibold rounded-2 d-flex align-items-center justify-content-between cp" 
                onClick={() => { setAbaAtiva('cadastro-Contrato'); alterarTexto('Cadastro'); }}>
              <span style={{ fontSize: '0.9rem' }}>➕ Incluir Novo Contrato</span>
              <span className="text-muted">➔</span>
            </li>
          </ul>
        </div>
      </div>

      {/* GRUPO 3: Pedidos e Estoque (Em Construção) */}
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card p-3 p-md-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
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
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card p-3 p-md-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
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
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card p-3 p-md-4 h-100 shadow-sm border border-light-subtle bg-white rounded-3 opacity-75">
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
