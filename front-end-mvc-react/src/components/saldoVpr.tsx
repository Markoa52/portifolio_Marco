import React from 'react';
// IMPORTAÇÃO DOS ÍCONES DA LUCIDE (Deixa o botão e o topo muito mais profissionais)
import { ArrowLeft, Landmark, History } from 'lucide-react';

interface IDetalhesProps {
  onVoltar: () => void; // Função para permitir voltar à tela anterior
}

export const DetalhesPedagio: React.FC<IDetalhesProps> = ({ onVoltar }) => {
<<<<<<< HEAD
  return (
=======
 return (
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
    // container limita a largura em 1200px, mantendo a simetria exata com o seu Header branco
    <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* CABEÇALHO DA TELA COM BOTÃO VOLTAR INTEGRADO */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          {/* Botão de seta redondo discreto e moderno */}
          <button 
            className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-1" 
            onClick={onVoltar} 
            style={{ width: '32px', height: '32px' }}
            title="Voltar para o Painel Geral"
          >
            <ArrowLeft size={16} className="text-dark" />
          </button>
          <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <Landmark size={22} className="text-primary" />Detalhamento do Vale Pedágio
          </h2>
        </div>

        {/* Badge clicável na direita servindo como segunda opção de escape rápida */}
        <span className="badge bg-light border text-secondary fw-semibold py-1.5 px-2 small cursor-pointer" onClick={onVoltar} style={{ cursor: 'pointer' }}>
          ← Voltar ao Painel
        </span>
      </div>

      {/* CONTEÚDO DO DETALHAMENTO (Card Branco Padrão do Sistema) */}
      <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100">
        
        {/* Bloco Informativo de Teste */}
        <div className="text-center py-5">
          <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 text-muted border" style={{ width: '56px', height: '56px' }}>
            <History size={24} />
          </div>
          <h4 className="fs-6 fw-bold text-dark mb-1">Módulo Isolado com Sucesso</h4>
          <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '400px' }}>
            Este código está isolado e limpo neste arquivo! Pronto para receber a sua tabela de transações, extratos ou filtros de recarga de pedágio.
          </p>
        </div>

      </div>

    </div>
  );
};

