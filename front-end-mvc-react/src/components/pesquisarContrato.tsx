import React, { useState} from 'react';

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

      <div className="main-content-wrapper">   
      <div className="painel-operacional">
      {/* Envelopa o seu input de pesquisa existente junto com os dois botões */}
      <div className="ferramentas-tabela">
      <div className="grupo-operacional-pesquisa">
      <input type="text" id="inputPesquisa" placeholder="🔍 Número do contrato..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} />
    
      <button className="btn-crud btn-adicionar" onClick={() => buscarContractPorId(pesquisa)}>Bsucar</button>
    
        </div>
       </div>
      </div>
    </div>
  );
}
