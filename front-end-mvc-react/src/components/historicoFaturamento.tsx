import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface PropsFaturas {
  contractId: number;
}

export const HistoricoFaturas: React.FC<PropsFaturas> = ({ contractId }) => {

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

          const [respostaFaturas] = await Promise.all([        // Endpoint 1: Dados base do SQLite
          axios.get(`http://localhost:3000/api/contrato/faturas/${contractId}`) 
          ]);

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

  return (
  /* container limita a largura em 1200px e px-3 sincroniza as bordas com o seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Histórico de Faturas</h2>
    </div>

    {/* PAINEL DA TABELA (Card Branco Limpo) */}
    <div className="card p-3 p-md-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* ==========================================================================
          VISÃO 1: COMPUTAÇÃO E NOTEBOOKS (Tabela Tradicional Completa)
          Exibe apenas do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-none d-md-block table-responsive border rounded-3 bg-white">
        <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
          
          <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ width: '15%' }}>Código da Fatura</th>
              <th style={{ width: '15%' }}>Valor</th>
              <th style={{ width: '15%' }}>Fechamento</th>
              <th style={{ width: '15%' }}>Vencimento</th>
              <th style={{ width: '15%' }}>Status</th>
              <th className="text-center" style={{ width: '25%', minWidth: '260px' }}>Ações</th>
            </tr>
          </thead>
          
          <tbody>
     {faturaCriado?.map((fatura: any) => (
    <tr key={fatura.id}>
      {/* 1. Código da Fatura */}
      <td className="text-dark fw-bold">FAT-{fatura.id}</td>
      
      {/* 2. CORREÇÃO: Mudado de fatura.valor para fatura.totalValor + Máscara R$ */}
      <td className="text-dark fw-medium">
        {fatura.totalValor != null ? (
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fatura.totalValor)
        ) : (
          "R$ 0,00"
        )}
      </td>
      
      {/* 3. Data de Fechamento */}
      <td className="text-secondary">{fatura.fechamento || "---"}</td>
      
      {/* 4. Vencimento com Cor Condicional Baseada no Status Numérico */}
      <td>
        {/* Status 1 = Em aberto/Pendente, Status 4 = Em atraso */}
        <strong className={Number(fatura.status) === 4 ? 'text-danger fw-bold' : 'text-dark fw-normal'}>
          {fatura.vencimento || "---"}
        </strong>
      </td>
      
      {/* 5. CORREÇÃO: Fim do .toLowerCase() em números e mapeamento correto dos Badges do Bootstrap */}
      <td>
        <span className={`badge px-2.5 py-1.5 fw-bold ${
          Number(fatura.status) === 1 ? 'bg-primary-subtle text-primary-emphasis border border-primary-subtle' : // Azul
          Number(fatura.status) === 3 ? 'bg-success-subtle text-success border border-success-subtle' :         // Verde
          Number(fatura.status) === 2 ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : // Amarelo
          Number(fatura.status) === 4 ? 'bg-danger-subtle text-danger border border-danger-subtle' :             // Vermelho
          'bg-light text-secondary border'
        }`}>
          {/* Usa a nossa função auxiliar para escrever o texto humano legível na tabela */}
          {Number(fatura.status) === 1 ? 'Em Aberto' :
           Number(fatura.status) === 2 ? 'Aguardando Vencimento' :
           Number(fatura.status) === 3 ? 'Pago' :
           Number(fatura.status) === 4 ? 'Débito Pendente' : 'Cancelado'}
        </span>
      </td>
      
      {/* 6. Botões de Ação */}
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert(`Abrindo detalhes da fatura ${fatura.id}...`)}>Detalhes</button>
          <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo demonstrativo...')}>Demonstrativo</button>
          <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo PDF...')}>PDF</button>
          <button className="btn btn-light btn-sm border text-secondary" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo Nota Fiscal...')}>NF</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>


        </table>
      </div>

      {/* ==========================================================================
          VISÃO 2: CELULARES (Cards Verticais Compactos - Sem Barra de Rolagem)
          Exibe apenas no mobile e some do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-block d-md-none d-flex flex-column gap-3">
        {faturaCriado.map((fatura) => (
          <div key={fatura.id} className="p-3 bg-light border border-light-subtle rounded-3 text-start shadow-none">
            
           {/* Linha 1: Código e Status */}
           <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
             {/* Adicionado o prefixo FAT- para melhor legibilidade */}
             <span className="text-dark fw-bold fs-6">FAT-{fatura.id}</span>
             
             <span className={`badge px-2.5 py-1.5 fw-bold ${
               Number(fatura.status) === 3 ? 'bg-success-subtle text-success border border-success-subtle' :       // 3 = Pago
               Number(fatura.status) === 2 ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' : // 2 = Aguardando Vencimento
               Number(fatura.status) === 1 ? 'bg-primary-subtle text-primary-emphasis border border-primary-subtle' : // 1 = Em aberto
               Number(fatura.status) === 4 ? 'bg-danger-subtle text-danger border border-danger-subtle' :           // 4 = Em atraso
               'bg-light text-secondary border'
             }`}>
               {/* Exibe o nome humano legível na tela baseando-se no ID do banco */}
               {Number(fatura.status) === 1 ? 'Em Aberto' :
                Number(fatura.status) === 2 ? 'Aguardando Vencimento' :
                Number(fatura.status) === 3 ? 'Pago' :
                Number(fatura.status) === 4 ? 'Débito Pendente' : 'Cancelado'}
             </span>
           </div>


            {/* Linha 2: Informações de Valores e Datas */}
            <div className="row g-2 mb-3 text-start" style={{ fontSize: '0.8rem' }}>
              <div className="col-6">
                <span className="text-muted d-block mb-0.5" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALOR</span>
                <strong className="text-dark fs-6">{fatura.valor}</strong>
              </div>
              <div className="col-6 text-end">
                <span className="text-muted d-block mb-0.5" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VENCIMENTO</span>
                <strong className={`fs-6 ${fatura.status === 'Pendente' ? 'text-danger fw-black' : 'text-dark fw-bold'}`}>
                  {fatura.vencimento}
                </strong>
              </div>
              <div className="col-10 mt-1">
                <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Fechamento: <strong>{fatura.fechamento}</strong></span>
              </div>
            </div>

            {/* Linha 3: Grade com os 4 Botões de Ação para Celular */}
            {/* O grid divide em 2 botões por linha de forma limpa e compacta */}
            <div className="row g-1.5 border-top pt-2.5" >
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo detalhes...')}>
                  Detalhes
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo demonstrativo...')}>
                  Demonstrativo
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo PDF...')}>
                  Baixar PDF
                </button>
              </div>
              <div className="col-6">
                <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 order-3 order-md-2 w-100" style={{ fontSize: '0.75rem' }} onClick={() => alert('Abrindo Nota Fiscal...')}>
                  Nota Fiscal
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>

  </div>
);
};
