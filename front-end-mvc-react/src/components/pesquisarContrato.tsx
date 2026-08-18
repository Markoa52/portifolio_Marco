import React, { useState} from 'react';
import '../styles/pesquisaContrato.css'
import { Search } from 'lucide-react';

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
            <div className="input-group mb-3" style={{ maxWidth: '400px' }}>
              {/* A moldura cinza claro que segura a lupa da Lucide */}
              <span className="input-group-text bg-light border-end-0 text-secondary">
                <Search size={18} />
              </span>
              
              {/* O campo de digitação real com a borda esquerda zerada para colar no ícone */}
              <input 
                type="text" 
                className="form-control border-start-0 ps-1" 
                placeholder="Pesquisar registros..." 
                style={{ fontSize: '0.875rem', height:"50px" }}
                value={pesquisa} 
                onChange={(e) => setPesquisa(e.target.value)} 
              />
            </div>
            {/* O botão 'btn-dark' fica acoplado direto no input, criando uma barra de busca elegante */}
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
              type="button"
              style={{ fontSize: '0.875rem', height:"50px" }}
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
