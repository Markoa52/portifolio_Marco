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
  <div>
    <div>

        <div className="grid">
        <input type="text" placeholder='Digite o CEP' value={textoDigitado} onChange={(e) => setTextoDigitado(e.target.value)} /> 
        <button type="button" onClick={() => puxarDadosAPIExterna(textoDigitado)}>Buscar</button>
        </div><br></br>

        <h2>Dados API externa(ViaCep)</h2><br></br>      

         {Array.isArray(DadosApiExterna) && DadosApiExterna.length > 0 ? (
         DadosApiExterna.map((item: any, index: number) => (
           <div key={index} >
             {Object.entries(item || {}).map(([chave, valor]) => (
               <p key={chave} style={{ margin: '4px 0', fontSize: '14px' }}>
                 <strong style={{ color: '#6c757d', textTransform: 'uppercase' }}>{chave}:</strong>{' '}
                 {typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}
               </p>
             ))}
           </div>
         ))
         ) : (
          <p style={{ color: '#666' }}>Nenhum dado do tipo lista recebido ainda.</p>
         )}

    </div>
   </div>

  );
}