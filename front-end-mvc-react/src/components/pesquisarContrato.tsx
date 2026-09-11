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
   await axios.post('/api/contrato/pesquisa', payloadEnvio);

    // Se o código chegou até aqui, significa que a API deu sucesso e o ID existe!
    console.log('2. ID validado com sucesso no banco. Mudando de página...');

    // CORREÇÃO DEFINITIVA: Estas três linhas DEVEM ficar aqui dentro, após o sucesso do Axios!
    setPayloadGlobal(payloadEnvio); 
    setIdContratoSelecionado(idDoContrato);
    setPaginaAtiva('contrato'); // Só muda de tela se o ID for válido!

  } catch (error: any) {
    console.error('Erro ao solicitar dados do contrato:', error);
    
    // Captura a mensagem real enviada pelo seu SQL Server ("O contrato número... não existe")
    const mensagemErro = error.response?.data?.erro || error.response?.data?.mensagem || error.message;
    
    alert(`Falha ao iniciar a consulta: ${mensagemErro}`);
    
    // IMPORTANTE: Não coloque nenhum comando de setPaginaAtiva aqui! O usuário continuará preso na tela de busca.
  }
};


  return (
  // container limita a largura máxima em 1200px para manter a simetria com o sistema
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* PAINEL OPERACIONAL */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* TÍTULO INTERNO DA BUSCA */}
      <h4 className="text-secondary fs-6 fw-bold text-uppercase tracking-wider mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
        Pesquisar Contrato
      </h4>
      
      {/* BARRA DE FERRAMENTAS: Bloco único integrado */}
      <div className="row m-0">
        <div className="col-12 col-md-6 p-0">
          <div className="input-group shadow-sm rounded-3 overflow-hidden" style={{ maxWidth: '450px' }}>
            
            {/* Ícone de Lupa da Lucide */}
            <span className="input-group-text bg-white border-end-0 text-muted ps-3">
              <Search size={18} />
            </span>
            
            {/* Campo de digitação real */}
            <input 
              type="text" 
              className="form-control border-start-0 border-end-0 ps-2 bg-white" 
              placeholder="Digite o número do contrato..." 
              style={{ fontSize: '0.9rem', height: "48px", boxShadow: "none" }}
              value={textoDigitado} 
              onChange={(e) => setTextoDigitado(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConsultarContrato('consultar', textoDigitado)}
            />

            {/* Botão de Limpar Dinâmico (Aparece apenas se houver texto) */}
            {textoDigitado && (
              <button 
                className="btn bg-white border-top border-bottom text-muted px-2" 
                type="button"
                onClick={() => setTextoDigitado('')}
                style={{ borderColor: '#dee2e6' }}
              >
                ✕
              </button>
            )}
            
            {/* Botão de Ação integrado na ponta direita */}
            <button 
              className="btn btn-primary fw-semibold px-4" 
              type="button"
              style={{ fontSize: '0.9rem', height: "48px" }}
              onClick={() => handleConsultarContrato('consultar', textoDigitado)}
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
