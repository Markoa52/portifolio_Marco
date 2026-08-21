import React, { useState } from 'react';
import '../styles/pesquisaContrato.css';
import type { IPerquisarContratoProps } from '../types/IPerquisarContratoProps';
import axios from 'axios';
import { Search } from 'lucide-react';

// 1. CORREÇÃO: Recebemos as propriedades obrigatórias da interface nas chaves { }
export const PesquisarContrato: React.FC<IPerquisarContratoProps> = ({ setPaginaAtiva, setIdContratoSelecionado, setPayloadGlobal }) => {
  const [textoDigitado, setTextoDigitado] = useState<string>('');
  // Guardamos os dados da resposta caso o backend retorne o contrato na consulta
  //sconst [dadosContrato] = useState<any>(null);

  // 2. CORREÇÃO: Ajustada a tipagem aceita para incluir a ação de busca ('consultar')
const handleConsultarContrato = async (formato: 'consultar', idDoContrato: string) => {
  if (!idDoContrato.trim()) {
    alert('Por favor, digite o ID do contrato.');
    return;
  }

  try {
    const payloadEnvio = {
      protocoloId: `PROT-${Date.now()}`, 
      acao: formato,                     
      dadosLimpos: { id: idDoContrato }
    };

    console.log('1. Disparando payload para a API/Fila...', payloadEnvio);

    // A) Primeiro faz a requisição. Se o ID não existir, o Backend joga o erro e o código pula direto para o CATCH!
   await axios.post('http://localhost:3000/api/contrato/pesquisa', payloadEnvio);

    // Se o código chegou até aqui, significa que a API deu sucesso e o ID existe!
    console.log('2. ID validado com sucesso no banco. Mudando de página...');

    // 🔥 CORREÇÃO DEFINITIVA: Estas três linhas DEVEM ficar aqui dentro, após o sucesso do Axios!
    setPayloadGlobal(payloadEnvio); 
    setIdContratoSelecionado(idDoContrato);
    setPaginaAtiva('contrato'); // 👈 Só muda de tela se o ID for válido!

  } catch (error: any) {
    console.error('Erro ao solicitar dados do contrato:', error);
    
    // Captura a mensagem real enviada pelo seu SQL Server ("O contrato número... não existe")
    const mensagemErro = error.response?.data?.erro || error.response?.data?.mensagem || error.message;
    
    alert(`Falha ao iniciar a consulta: ${mensagemErro}`);
    
    // 🛑 IMPORTANTE: Não coloque nenhum comando de setPaginaAtiva aqui! O usuário continuará preso na tela de busca.
  }
};


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
               value={textoDigitado} 
              onChange={(e) => setTextoDigitado(e.target.value)}
              />
            </div>
            {/* O botão 'btn-dark' fica acoplado direto no input, criando uma barra de busca elegante */}
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
              type="button"
              style={{ fontSize: '0.875rem', height:"50px" }}
              onClick={() => handleConsultarContrato ('consultar', textoDigitado)}
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
);
};
