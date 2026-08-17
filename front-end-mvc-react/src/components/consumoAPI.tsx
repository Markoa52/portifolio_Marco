import React, { useState, useEffect } from 'react';
import type { IConsumoApiCep } from '../types';

export const ConsumoAPI: React.FC = () => {

  // Estado inicial zerado seguindo a interface do TypeScript
  const [DadosApiExterna, setDadosApiExterna] = useState<IConsumoApiCep[]>([]);
   const [textoDigitado, setTextoDigitado] = useState<string>('');

    async function puxarDadosAPIExterna(numCep: string) {
  if (!numCep) return;
  try {
    const resposta = await fetch(`/api/externa/${numCep}`);
    const dados = await resposta.json();
    
    // A CORREÇÃO SEGURA:
    if (Array.isArray(dados)) {
      setDadosApiExterna(dados); // Se já veio uma lista, salva direto
    } else if (dados && typeof dados === 'object') {
      setDadosApiExterna([dados]); // Se veio um objeto único, transforma em lista de 1 item
    } else {
      setDadosApiExterna([]); // Se veio nulo ou texto puro, limpa o estado
    }

  } catch (erro) {
    console.error("Erro na busca da API:", erro);
    setDadosApiExterna([]); // Evita deixar o estado quebrado
  }
}

  useEffect(() => {
    // Primeira execução imediata ao entrar na página
    //puxarDadosAPIExterna();

  }, []);

return (
  // Mantém a trava padrão de 1200px centralizada para sincronizar com todo o sistema
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* PAINEL OPERACIONAL (Card Branco Padrão) */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100">
      
      {/* 1. BARRA DE PESQUISA DO CEP */}
      <h4 className="text-primary fs-6 fw-bold text-uppercase tracking-wider mb-3">Consultar CEP Integrado</h4>
      <div className="row g-3 m-0 mb-4">
        <div className="col-md-6 p-0">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Digite o CEP (apenas números)..." 
              style={{ padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
              value={textoDigitado} 
              onChange={(e) => setTextoDigitado(e.target.value)} 
            />
            {/* Botão acoplado no mesmo tom preto fosco corporativo */}
            <button 
              className="btn btn-dark fw-semibold px-4" 
              type="button"
              style={{ fontSize: '0.875rem' }}
              onClick={() => puxarDadosAPIExterna(textoDigitado)}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* 2. ÁREA DE EXIBIÇÃO DOS RESULTADOS */}
      <div className="border-top pt-3">
        {/* Título da seção de dados alinhado à esquerda */}
        <h2 className="fs-5 fw-bold text-dark mb-3">Dados API externa (ViaCep)</h2>

        {Array.isArray(DadosApiExterna) && DadosApiExterna.length > 0 ? (
          DadosApiExterna.map((item: any, index: number) => (
            // 'list-group shadow-sm' formata os dados mapeados como linhas de tabela limpas
            <div key={index} className="list-group shadow-sm rounded-3 border-0 overflow-hidden" style={{ maxWidth: "600px" }}>
              {Object.entries(item || {}).map(([chave, valor]) => (
                <div 
                  key={chave} 
                  className="list-group-item d-flex justify-content-between align-items-center py-2 px-3 border-light-subtle"
                  style={{ fontSize: '0.875rem', backgroundColor: '#fafafa' }}
                >
                  {/* Nome do campo (ex: LOGRADOURO) em cinza discreto e caixa alta */}
                  <strong className="text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {chave}:
                  </strong>
                  {/* Valor do campo alinhado à direita em cinza escuro */}
                  <span className="text-dark fw-medium text-end">
                    {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          // Mensagem de "vazio" discreta nativa
          <div className="alert alert-light border py-2 px-3 d-inline-block small text-muted mb-0" role="alert">
            ℹ️ Nenhum dado do tipo lista recebido ainda.
          </div>
        )}
      </div>

    </div>
  </div>
);

}