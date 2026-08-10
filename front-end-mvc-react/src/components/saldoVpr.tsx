import React from 'react';

interface IDetalhesProps {
  onVoltar: () => void; // Função para permitir voltar à tela anterior
}

export const DetalhesPedagio: React.FC<IDetalhesProps> = ({ onVoltar }) => {
  return (
    <div className="tela-detalhes-container">
      <button className="botao-voltar" onClick={onVoltar} style={{ cursor: 'pointer' }}>
        ← Voltar para o Painel Geral
      </button>
      <h2>Detalhamento do Vale Pedágio</h2>
      <p>Este código está isolado e limpo neste arquivo!</p>
    </div>
  );
};
