import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { IPropsFaturas } from '../types/IPropsFaturas';

// const FATURAS_EM_ABERTO = [
//   { id: 'FAT-2026-1021', fechamento: '05/09/2026', vencimento: '15/10/2026', valor: 'R$ 2.550,00', Urgente: true  , status:'em aberto'},
//   { id: 'FAT-2026-1022', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true  , status:'vencida'},
//   { id: 'FAT-2026-1023', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1024', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1025', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true  , status:'vencida'},
//   { id: 'FAT-2026-1026', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1027', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1028', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true  , status:'vencida'},
//   { id: 'FAT-2026-1029', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1030', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1031', fechamento: '05/08/2026', vencimento: '15/08/2026', valor: 'R$ 1.450,00', Urgente: true  , status:'vencida'},
//   { id: 'FAT-2026-1032', fechamento: '12/08/2026', vencimento: '22/08/2026', valor: 'R$ 890,00',   Urgente: false , status:'fechado'},
//   { id: 'FAT-2026-1033', fechamento: '25/08/2026', vencimento: '05/09/2026', valor: 'R$ 3.200,00', Urgente: false , status:'fechado'},
// ];

export const FaturasAbertas: React.FC<IPropsFaturas> = ({ contractId }) => {

  // 1. CORREÇÃO: Inicializa com um array vazio [] para o seu .map() não quebrar na primeira renderização
  const [faturaCriado, setFaturaCriado] = useState<any[]>([]);
  
  // Ajustado para capturar as funções de loading e erro que você declarou vazias
  const [, setCarregando] = useState<boolean>(false); 
  const [, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function dispararFluxoAssincronoEConsulta() {
      if (!contractId) return;

      try {
        // 2. CORREÇÃO: Ativa o loading e limpa erros antes de bater na API
        setCarregando(true);
        setErro(null);

        console.log(`🔍 [Banco] Buscando faturas em aberto para o Contrato ID: ${contractId}`);

        // 3. CORREÇÃO: Requisição movida para DENTRO do bloco try/catch
        const respostaFaturas = await axios.get(`http://localhost:3000/api/fatura/aberto/${contractId}`);

        if (respostaFaturas && respostaFaturas.data) {
          console.log('✅ [Sucesso] Faturas recebidas do SQLite:', respostaFaturas.data);
          
          // 4. CORREÇÃO: Garante que estamos salvando uma Array pura (trata se o banco mandar nulo)
          setFaturaCriado(Array.isArray(respostaFaturas.data) ? respostaFaturas.data : [respostaFaturas.data]);
        } else {
          setFaturaCriado([]);
        }

      } catch (err: any) {
        console.error('❌ Erro no fluxo de consulta das faturas:', err);
        setFaturaCriado([]); // Evita travar a tela em caso de queda do servidor
        setErro(err.response?.data?.erro || err.message || "Erro ao carregar informações das faturas.");
      } finally {
        // Desliga o estado de espera na tela
        setCarregando(false);
      }
    }

    dispararFluxoAssincronoEConsulta();
   }, [contractId]); // Executa novamente de forma reativa sempre que o ID do contrato mudar

    const obterClasseCorValor = (status: number | string) => {
    // Convertemos para Number para bater com os status salvos no seu SQLite (1 a 5)
    switch (Number(status)) {
      case 1: // PENDENTE (Em aberto original)
        return 'text-primary'; // 🔵 Azul
      case 2: // EM PROCESSAMENTO (Fechada/A Pagar original)
        return { color: '#6f42c1' } // 🟡 Roxo/Laranja comercial legível 
      case 4: // EM ATRASO (Vencida original)
        return 'text-warning'; // 🟡 Amarelo/Laranja comercial legível 
      case 3: // PAGO
        return 'text-success fw-bold'; // 🟢 Verde para pagas
      case 5: // MUTADO/CANCELADO
        return 'text-danger fw-black'; // 🔴 Vermelho vivo e negrito pesado
      default:
        return 'text-dark'; // Cor padrão caso seja outro status
    }
   };

    const alterarTexto = (status: number | string) => {
      switch (Number(status)) {
        case 1:
          return 'Em aberto';
        case 2:
          return 'Aguardando Vencimento';
        case 4:
          return 'Débito Pendente';
        case 3:
          return 'Fatura Paga';
        case 5:
          return 'Fatura Cancelada';
        default:
          return 'Status Desconhecido';
      }
    };

    return (
    /* container limita a largura em 1200px e px-3 sincroniza milimetricamente com as bordas do seu Header */
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Faturas em Aberto</h2>
    </div>

    {/* LISTA DE FATURAS */}
    <div className="d-flex flex-column gap-3">
      {faturaCriado.map((fatura: any) => (
        /* O CARD DA FATURA: Se for urgente, adiciona uma borda vermelha de alerta (border-danger) */
        <div 
          key={fatura.id} 
          className={`card p-3 p-md-4 shadow-sm bg-white rounded-3 ${fatura.Urgente ? 'border border-danger border-2' : 'border border-light-subtle'}`}
        >
          
          {/* BADGE DE URGÊNCIA (Mostra apenas se a fatura for urgente) */}
          {fatura.Urgente && (
            <div className="mb-3">
              <span className="badge bg-danger fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                ⚠️ Atenção: Vencimento Próximo
              </span>
            </div>
          )}

          {/* 1. GRADE DE CONTEÚDO ALINHADO (RESPONSIVO) */}
          {/* col-6 no celular divide em 2 colunas pequenas por linha; col-md-3 no PC deixa as 4 lado a lado */}
          <div className="row g-3 text-start border-bottom pb-3 mb-3">
            
            <label>{alterarTexto(fatura.status)}</label>
           {/* VALOR A PAGAR COM COR DINÂMICA */}
           <div className="col-6 col-md-3">
           <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR</span>
           {/* 🌟 A mágica acontece aqui: a classe muda de cor baseada no status da fatura */}
           <h3 className={`fs-5 fw-bold m-0 ${obterClasseCorValor(fatura.status)}`}>
             {fatura.totalValor}
           </h3>
           </div>

            {/* CÓDIGO DA FATURA */}
            <div className="col-6 col-md-3">
              <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CÓDIGO DA FATURA</span>
              <span className="text-dark fw-bold fs-6">{fatura.id}</span>
            </div>

            {/* CAMPO DE FECHAMENTO */}
            <div className="col-6 col-md-3">
              <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>FECHAMENTO</span>
              <span className="text-secondary small">{fatura.fechamento}</span>
            </div>

            {/* VENCIMENTO */}
            <div className="col-6 col-md-3">
              <span className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VENCIMENTO</span>
              <strong className={`fs-6 ${fatura.Urgente ? 'text-danger fw-black' : 'text-dark'}`}>
                {fatura.vencimento}
              </strong>
            </div>

          </div>

          {/* 2. RODAPÉ DE AÇÕES COM BOTÕES ADAPTÁVEIS */}
          {/* flex-column no celular empilha os botões; flex-md-row no PC deixa em linha horizontal */}
          <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2" 
              onClick={() => alert('Abrindo detalhes completos da fatura...')}
            >
              Detalhes da Fatura
            </button>
            
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2" 
              onClick={() => alert('Abrindo demonstrativo...')}
            >
              Demonstrativo
            </button>
            
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2" 
              onClick={() => alert('Visualizando PDF...')}
            >
              Visualizar PDF
            </button>
            
            <button 
              className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2" 
              onClick={() => alert('Abrindo Nota Fiscal...')}
            >
              Nota Fiscal
            </button>
          </div>

        </div>
      ))}
    </div>

  </div>
);
};
