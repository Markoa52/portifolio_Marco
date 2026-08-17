import React, { useState} from 'react';
import '../styles/pesquisaContrato.css'

export const PesquisarContrato: React.FC = () => {
    
  const [pesquisa, setPesquisa] = useState<string>('');

      async function buscarContractPorId(contractId: string) {

      //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
      if (!contractId) return;

      try {
      const resposta = await fetch(`/api/externa/${contractId}`);
      const dados = await resposta.json();

      console.log({texto: "Id retornado!", dados: dados});
      } catch (erro) {
      console.error({ texto: "Falha ao buscar Id", erro: erro });
      } 
    }

      return (
  // container-fluid limita a largura máxima em 1200px para alinhar com o Header e o Menu de Módulos
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* PAINEL OPERACIONAL (Card Branco Padrão do Sistema) */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100">
      
      {/* TÍTULO INTERNO DA BUSCA */}
      <h4 className="text-primary fs-6 fw-bold text-uppercase tracking-wider mb-3">Pesquisar Contrato</h4>
      
      {/* BARRA DE FERRAMENTAS: Input e Botão acoplados usando o input-group do Bootstrap */}
      <div className="row g-3 m-0">
        <div className="col-md-6 p-0">
          <div className="input-group">
            {/* O campo de texto ganha um visual limpo e moderno */}
            <input 
              type="text" 
              className="form-control" 
              placeholder="🔍 Número do contrato..." 
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              value={pesquisa} 
              onChange={(e) => setPesquisa(e.target.value)} 
            />
            {/* O botão 'btn-dark' fica acoplado direto no input, criando uma barra de busca elegante */}
            <button 
              className="btn btn-dark fw-semibold px-4" 
              type="button"
              style={{ fontSize: '0.875rem' }}
              onClick={() => buscarContractPorId(pesquisa)}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
);

}
