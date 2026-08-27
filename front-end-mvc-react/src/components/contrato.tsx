import '../styles/contrato.css'; // Toda a estilização do header e abas fica presa aqui!
import { Home, Truck, FileText, BarChart3, Info } from "lucide-react";
import React, { useEffect, useState } from 'react';

import { DetalhesPedagio } from './saldoVpr'; 
import { HistoricoFaturas } from './historicoFaturamento'; 
import { FaturasAbertas } from './faturasEmAberto';
import { ListarFrota } from './listarFrota';
import { RelatorioPassagens } from './relatorioPassagem';
import { RelatorioExtrato } from './relatorioExtrato';

//import { MenuMobileModulos } from './menuHumbugerMobile';

// 1. IMPORTA O SEU NOVO COMPONENTE (Ajuste o caminho do arquivo se necessário)
import { MenuHamburguer } from './menuHumburguer'; 

export type AbaInferior = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'editar-usuario' | 'usuario' | 'contrato-detalhe' | 'pesquisar-contrato' | 'cadastro-contrato' | 'configuracao-sistema';

export type PaginaTipo = 'cards-gerais' | 'detalhes-pedagio' | 'historico-fatura' | 'faturas-abertas' | 'listar-frota' | 'relatorio-passagem' | 'relatorio-extrato' | 'pesquisar-contrato' | 'editar-usuario' | 'usuario' |'contrato' | 'dashboard' | 'consumoAPI' | 'atendimento'| 'cadastro-contrato' | 'configuracao-sistema';

import type { IContratoProps } from '../types/IContratoProps';
import type { IDetalhesContrato } from '../types/IDetalhesContrato';
import { EditarUsuario } from './editarUsuario';
import { Usuario } from './usuario';
import axios from 'axios';

// CORREÇÃO 1: Adicionado o parâmetro desestruturado correto para sumir com o erro de compilação
export const Contrato: React.FC<IContratoProps> = ({ payloadEnvio, setPaginaAtiva }) => {

  const mapearStatusCor = (status: number) => {
  switch (status) {
    case 5:
      return { texto: 'text-danger', badge: 'bg-danger text-white' }; // Vermelho
    case 4:
      return { texto: 'text-warning', badge: 'bg-warning text-dark' }; // Amarelo
    case 3:
      return { texto: 'text-success', badge: 'bg-success text-white' }; // Verde
    case 2:
      return { texto: 'text-purple', badge: 'bg-purple text-white', estilo: { color: '#6f42c1', backgroundColor: '#6f42c1' } }; // Roxo (Customizado)
    case 1:
      return { texto: 'text-primary', badge: 'bg-primary text-white' }; // Azul
    default:
      return { texto: 'text-secondary', badge: 'bg-secondary text-white' }; // Cinza Padrão
    }
  };

  const [dados, setDados] = useState<any>(null);
  const [contratoCriado, setContratoCriado] = useState<any>(null);
  const [faturaCriado, setFaturaCriado] = useState<any>(null);
  const [gastosAtuais, setGastosAtuais] = useState<any>(null);
  const [veiculoContrato, setVeiculoContrato] = useState<any>(null);
  const [veiculoContaVPR, setVeiculoContaVPR] = useState<any>(null);
  const [limiteContrato, setlimiteContrato] = useState<any>(null);
  
  // ALTERAÇÃO DE FLUXO: Inicializamos como false para não travar a tela se a API demorar
  const [, setCarregando] = useState<boolean>(false); 
  const [, setErro] = useState<string | null>(null);
  
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaInferior>('cards-gerais');

  // Captura o ID vindo direto de dentro do payload enviado de carona pela pesquisa
  //const idContratoDoc = payloadEnvio?.dadosLimpos?.id || payloadEnvio?.id || '-';

  // Cálculos matemáticos blindados com valores de segurança contra nulos
  const valorGasto = Number(gastosAtuais?.totalValor || 0); // 3200 de fallback visual enquanto o banco não responde
  const valorMeta = Number(limiteContrato?.limiteContrato || 0);
  const porcentagemConsumida = Math.min((valorGasto / valorMeta) * 100, 100);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

    useEffect(() => {
    async function dispararFluxoAssincronoEConsulta() {
      if (!payloadEnvio) return;

      // Extrai o ID numérico que o usuário digitou e veio de carona no payload
      const idContrato = payloadEnvio?.dadosLimpos?.id || payloadEnvio?.id;

      try {
        setCarregando(true);
        setErro(null);

        // console.log('1. [Fila] Enviando intenção para a rota do RabbitMQ:', payloadEnvio);
        
        // // A) MANDA PARA A FILA (Mantém o seu POST atual intacto para acionar o Worker)
        // await axios.post('http://localhost:3000/api/contrato', payloadEnvio);

        console.log(`2. [Banco] Buscando dados visuais da tela para o ID: ${idContrato}`);

        // B) DISPARA A CONSULTA DIRETA: Consome a sua rota GET que lê direto do SQL Server
        //const respostaDados = await axios.get(`http://localhost:3000/api/contrato/${idContrato}`);

        const [respostaDados, respostaFaturas, respostaGastosAtuais, respostaVeiculo, respostaContaVeiculoVPR, respostaLimiteContrato ] = await Promise.all([
          axios.get(`http://localhost:3000/api/contrato/${idContrato}`),        
          axios.get(`http://localhost:3000/api/contrato/fatura/${idContrato}`),  
          axios.get(`http://localhost:3000/api/contrato/saldo/${idContrato}`),
          axios.get(`http://localhost:3000/api/veiculo/${idContrato}`),
          axios.get(`http://localhost:3000/api/veiculo/saldoVPR/${idContrato}`),
          axios.get(`http://localhost:3000/api/contrato/limite/${idContrato}`)    
        ]);

          // 3. CORREÇÃO: Alimenta o contratoCriado lendo direto as colunas do SQLite (id e nomeEmpresa)
          setContratoCriado(respostaDados.data);
          setFaturaCriado(respostaFaturas.data);
          setGastosAtuais(respostaGastosAtuais.data);
          setVeiculoContrato(respostaVeiculo.data);
          setVeiculoContaVPR(respostaContaVeiculoVPR.data);
          setlimiteContrato(respostaLimiteContrato.data);
        
          if (respostaDados && respostaDados.data) {
          const resultado = respostaDados.data;
          console.log('3. [Sucesso] Dados do SQLite recebidos para a tela:', resultado);

          // 1. Define qual é o objeto com os dados reais (trata se veio array ou objeto direto)
          const dadosDoContrato = Array.isArray(resultado) && resultado.length > 0 
            ? resultado[0] 
            : resultado;

          // 2. Salva no estado geral
          setDados(dadosDoContrato);


        } else {
          throw new Error("A rota de consulta não retornou dados para este ID.");
        }

        return respostaDados;

      } catch (err: any) {
        console.error('Erro no fluxo misto (Fila/Consulta) do Contrato:', err);
        // Captura o erro se o ID digitado não existir no banco de dados
        setErro(err.response?.data?.erro || err.message || "Erro ao carregar informações.");
      } finally {
        setCarregando(false);
      }
    }

    dispararFluxoAssincronoEConsulta();
  }, [payloadEnvio]);


  const alternarSubmenu = (menuName: string) => {
    setMenuAberto(menuAberto === menuName ? null : menuName);
  };

  const coresStatus = mapearStatusCor(faturaCriado?.status);

  return (
  <div className="pagina-container">
      
    {/* ==========================================================================
        1. CABEÇALHO PRINCIPAL (FLEXBOX FLUIDO E TOTALMENTE RESPONSIVO)
        ========================================================================== */}
    {/* 🌟 CALIBRAÇÃO FINAL DO TAMANHO DO HEADER */}
    <header 
      className="navbar navbar-light bg-white py-3 shadow-sm mx-auto"  
      style={{ 
        width: 'calc(100% - 33px)', // Ajustado de 32px para 24px para expandir o cabeçalho no celular
        maxWidth: "1200px",          // Ajustado de 1152px para 1176px para alinhar de ponta a ponta no notebook
        margin: "0 auto", 
        borderRadius: "0 0 12px 12px", 
        borderBottom: "1px solid #e2e8f0",
        boxSizing: 'border-box'
      }}
    >

      {/* d-flex flex-column flex-md-row faz o menu ficar em linha no PC e empilhar bonito no celular */}
      <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 p-0 w-100">
        
        {/* LADO ESQUERDO: MENUS E NAVEGAÇÃO */}
        {/* 'justify-content-center justify-content-md-start' centraliza os ícones apenas no celular */}
        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-1 gap-md-2 flex-wrap" style={{ marginTop: '-20px' }}>
          
          {/* MENU HAMBÚRGUER MOBILE */}
          {/* <div className="d-block d-md-none me-2 text-dark" style={{ marginTop: '-37px' }} >
            <MenuMobileModulos setAbaAtiva={setAbaAtiva} />
          </div> */}

          {/* MENU HAMBÚRGUER DESKTOP */}
          <div className="d-none d-md-block mx-2 mx-md-3">
            <MenuHamburguer setAbaAtiva={setAbaAtiva} setPaginaAtiva={setPaginaAtiva} />
          </div>

          {/* ITEM 1: INÍCIO */}
          <div 
            className="btn btn-menu-limpo d-flex flex-column align-items-center p-2 text-decoration-none text-dark border-0" 
            onClick={() => { setAbaAtiva('cards-gerais'); setMenuAberto(null); }}
            style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
          >
            <Home size={26} color="#475569" strokeWidth={2} className="mb-2" />
            <span className="fs-5 fw-bold">Início</span>
          </div>

          {/* ITEM 2: FROTA */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'frota' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('frota')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <Truck size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Frota</span>
            </button>
            {menuAberto === 'frota' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('listar-frota'); setMenuAberto(null); }}>
                  Listar Veículos
                </li>
              </ul>
            )}
          </div>
          
          {/* ITEM 3: FATURAS */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'faturas' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('faturas')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <FileText size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Faturas</span>
            </button>
            {menuAberto === 'faturas' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('faturas-abertas'); setMenuAberto(null); }}>
                  Faturas Abertas
                </li>
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('historico-fatura'); setMenuAberto(null); }}>
                  Histórico de Pagamentos
                </li>
              </ul>
            )}
          </div>

          {/* ITEM 4: RELATÓRIOS */}
          <div className="dropdown">
            <button 
              className={`btn btn-menu-limpo d-flex flex-column align-items-center p-2 dropdown-toggle fs-5 fw-bold text-dark border-0 ${menuAberto === 'relatorios' ? 'show' : ''}`}
              onClick={() => alternarSubmenu('relatorios')}
              style={{ minWidth: '90px', transition: 'background-color 0.2s' }}
            >
              <BarChart3 size={26} color="#475569" strokeWidth={2} className="mb-2" />
              <span>Relatórios</span>
            </button>
            {menuAberto === 'relatorios' && (
              <ul className="dropdown-menu show position-absolute shadow border-light-subtle bg-white">
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('relatorio-passagem'); setMenuAberto(null); }}>
                  Passagens
                </li>
                <li className="dropdown-item cp" onClick={() => { setAbaAtiva('relatorio-extrato'); setMenuAberto(null); }}>
                  Extrato
                </li>
              </ul>
            )}
          </div>

        </div>

        {/* LADO DIREITO: BLOCOS INFORMATIVOS FINANCEIROS (BLINDADO VIA STYLES INLINE) */}
        <div className="d-flex align-items-center justify-content-end text-dark mt-2 mt-md-0 px-2 px-md-0" style={{ gap: '35px' }}>
          
          {/* CONTRATO */}
          {/* MUDANÇA: Forçado margin-right de 24px para afastar do Saldo Pedágio */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', marginRight: '16px' }}>
            <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>CONTRATO</span>
            <span className="fs-7 fw-bold text-dark mt-1">{contratoCriado ?`${contratoCriado.id}-${contratoCriado.nomeEmpresa}` : "---"}</span>
          </div>
          
          {/* SALDO VALE PEDÁGIO CORRIGIDO */}
          {/* MUDANÇA: Alterado 'alignItems' de 'flex-end' para 'flex-start' para puxar o texto para a esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', marginRight: '16px',  minWidth: '80px' }}>
            <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VALE PEDÁGIO</span>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="fs-7 fw-bold text-dark">{veiculoContaVPR != null ? 
              (new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(typeof veiculoContaVPR === 'object' ? veiculoContaVPR.total : veiculoContaVPR)) 
              : ("R$ 0,00")}</span>     
              <div onClick={() => setAbaAtiva('detalhes-pedagio')} className="cp d-flex align-items-center" style={{ cursor: 'pointer' }}>
                <Info size={14} color="#64748b" strokeWidth={2.5} />
              </div>
            </div>
          </div>  

          {/* GASTOS ATUAIS COM VALOR TRAVADO À DIREITA */}
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', minWidth: '140px', maxWidth: '140px' }}>
  
         <div className="d-flex justify-content-between w-100 align-items-center">
         <span className="text-muted fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>GASTOS ATUAIS</span>
         <span className="fw-bold text-primary" style={{ fontSize: '0.85rem', marginRight: '10px' }}>
           {Math.round(porcentagemConsumida)}%
         </span>
         </div>

         {/* CORREÇÃO CHAVE: 'd-block w-100 text-end' força o valor financeiro a pular para a ponta direita */}
         <span className="fs-5 fw-bold mt-1 text-dark d-block w-100 text-start" style={{ textAlign: 'left' }}>
           {formatarMoeda(valorGasto)}
         </span>

         <div className="progress w-100 bg-light mt-1 rounded-pill" style={{ height: '10px', border: '1px solid #e2e8f0',marginRight: '5px' }}>
           <div 
             className={`progress-bar rounded-pill ${porcentagemConsumida >= 90 ? 'bg-danger' : 'bg-primary'}`}
             role="progressbar"
             style={{ width: `${porcentagemConsumida}%` }}
             aria-valuenow={porcentagemConsumida}
           ></div>
         </div>
         
         <span className="fs-10 fw-bold mt-1 text-dark d-block w-100 text-start" style={{  textAlign: 'left' }}>
           Limite: {formatarMoeda(valorMeta)}
         </span>

           </div>
           </div>
           </div>
           </header>

      {/* ==========================================================================
          CONTEÚDO PRINCIPAL DINÂMICO (GRID TOTALMENTE RESPONSIVO)
          ========================================================================== */}
       {/* CONTEÚDO PRINCIPAL (Muda dinamicamente conforme a aba) */}
      <main className="container my-4 p-0" style={{ maxWidth: "1200px", margin: "0 auto", width: 'calc(100% - 33px)'}}>
      
        {/* ABA 1: PAINEL GERAL (CARDS) */}
        {abaAtiva === 'cards-gerais' && (
          /* MUDANÇA: 'g-3' gerencia o espaçamento de forma simétrica e correta */
          <div className="row g-3">
      
        {/* CARD 1: Fatura (Esquerda Superior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Fatura</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Consultar faturas →
              </button>
            </div>
            <h5 className="text-start m-0">{faturaCriado?.billId}</h5>
            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
      
      {/* 1. TEXTO DO STATUS: Aplica a cor dinâmica (Vermelho, Amarelo, Verde, Roxo ou Azul) */}
      <h1 
        className={`fs-4 mb-0 fw-bold ${coresStatus.texto}`}
        style={faturaCriado?.status === 2 ? { color: '#6f42c1' } : {}} // Injeta a cor roxa nativa se for status 2
      >
        {faturaCriado?.status === 5 ? 'VENCIDO' :
         faturaCriado?.status === 4 ? 'A PAGAR' :
         faturaCriado?.status === 3 ? 'PAGO' :
         faturaCriado?.status === 2 ? 'EM FECHAMENTO' :
         faturaCriado?.status === 1 ? 'EM ABERTO' : ''}
      </h1>
      
      <div className="text-end fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
        
        {/* 2. BADGE DO MÊS: Acompanha a mesma cor do status para fazer sentido visual */}
        <span  
          className={`badge mb-1 ${coresStatus.badge}`}
          style={faturaCriado?.status === 2 ? { backgroundColor: '#6f42c1', color: '#fff' } : {}} // Injeta o fundo roxo se for status 2
        >
          {faturaCriado?.dataAbertura ? (
            new Date(`${faturaCriado.dataAbertura}T12:00:00`)
              .toLocaleString('pt-BR', { month: 'long' })
              .replace(/^\w/, (c) => c.toUpperCase())
          ) : (
            "---"
          )}
        </span>
        <br />

        <span className="d-block mb-1">FECHAMENTO: {faturaCriado?.dataFechamento || "---"}</span>
        <span className="d-block mb-1">VENCIMENTO: {faturaCriado?.dataVencimento || "---"}</span>
        
        {/* VALOR FORMATADO EM REAIS (R$) */}
        <span className="fs-6 fw-bold text-dark d-block">
          {faturaCriado?.totalValor != null ? (
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturaCriado.totalValor)
          ) : (
            "R$ 0,00"
          )}
        </span>
      </div>
    </div>
          </div>
        </div>

        {/* CARD 2: Últimos Pedidos (Direita Superior) */}
        <div className="col-md-6 p-2">
          <div className="card p-3 h-100 shadow-sm border border-light-subtle bg-white d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Últimos pedidos</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Consultar pedidos →
              </button>
            </div>

            <div className="position-relative px-2 mt-1 pt-1">
              <div className="position-absolute start-0 end-0 bg-secondary-subtle" style={{ height: '2px', zIndex: 0, top: '10px' }}></div>
              
              <div className="d-flex justify-content-between text-center position-relative mb-1" style={{ zIndex: 1 }}>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>✓</span></div>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>2</span></div>
                <div style={{ width: '30%' }}><span className="rounded-circle bg-secondary-subtle text-secondary border d-inline-flex align-items-center justify-content-center fw-bold lh-1" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>3</span></div>
              </div>

              <div className="d-flex justify-content-between text-center">
                <div style={{ width: '30%' }}>
                  <p className="fw-bold text-success mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Realizado</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>12 Ago • 14:32</span>
                </div>
                <div style={{ width: '30%' }}>
                  <p className="fw-bold text-primary mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Em separação</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>12 Ago • 15:10</span>
                </div>
                <div style={{ width: '30%' }}>
                  <p className="fw-semibold text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.1' }}>Enviado para transportadora</p>
                  <span className="text-muted d-block" style={{ fontSize: '0.6rem' }}>Aguardando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Veículos (Esquerda Inferior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white">

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Veículos</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('listar-frota')}>
                Consultar veículos →
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
              <h2 className="fs-2 mb-0 fw-bold text-dark">{veiculoContrato?.length || 0}
              <span className="d-block mb-2 text-muted" style={{ fontSize: '0.75rem' }}>Veículos cadastrados</span>
              </h2>
      
              <div className="text-end fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                <span className="badge bg-success mb-1" style={{ fontSize: '0.7rem' }}>{veiculoContrato?.every((item: any) => item.status !== 'aguardando ativação') ? (veiculoContrato?.length || 0) : 0}</span>
                <span className="d-block mb-2 text-muted" style={{ fontSize: '0.75rem' }}>Com tag ativa</span>
                <span className="badge bg-secondary mb-1" style={{ fontSize: '0.7rem' }}>{veiculoContrato?.every((item: any) => item.status === 'aguardando ativação') ? (veiculoContrato?.length || 0) : 0}</span>
                <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>Sem tag</span>
              </div>

            </div>
          </div>
        </div>

        {/* CARD 4: Tag (Direita Inferior) */}
        <div className="col-md-6 p-2">
          <div className="card p-4 h-100 shadow-sm border border-light-subtle bg-white d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 mb-0 fw-bold text-dark">Tag</h3>
              <button className="btn btn-light border btn-sm text-secondary fw-semibold" style={{ fontSize: '0.8rem' }} onClick={() => setAbaAtiva('historico-fatura')}>
                Ativar tags →
              </button>
            </div>
            <div className="alert alert-secondary py-2 px-3 text-center mb-0 fw-medium" role="alert" style={{ fontSize: '0.8rem' }}>
              🛠️ Conteúdo em construção
            </div>
          </div>
        </div>

      </div>
    )}

     {/* ==========================================
      RESTAURAÇÃO DAS OUTRAS ABAS DO SEU SISTEMA
      ========================================== */}
  
        {abaAtiva === 'detalhes-pedagio' && (
          <DetalhesPedagio contractId={Number(payloadEnvio.dadosLimpos.id)} onVoltar={() => setAbaAtiva('cards-gerais')}/>
        )}

        {abaAtiva === 'historico-fatura' && (
          <HistoricoFaturas contractId={Number(payloadEnvio.dadosLimpos.id)} />
        )}

        {abaAtiva === 'faturas-abertas' && (
          <FaturasAbertas contractId={Number(payloadEnvio.dadosLimpos.id)}/>
        )}

        {abaAtiva === 'listar-frota' && (
          <ListarFrota contractId={Number(payloadEnvio.dadosLimpos.id)} />
        )}

        {abaAtiva === 'relatorio-passagem' && (
          <RelatorioPassagens />
        )}
  
        {abaAtiva === 'relatorio-extrato' && (
          <RelatorioExtrato />
        )}

        {abaAtiva === 'editar-usuario' && (
          <EditarUsuario 
            setPaginaAtiva={setPaginaAtiva} 
            setAbaAtiva={setAbaAtiva} 
          />
        )}

        {(abaAtiva === 'usuario') && (
          <Usuario setPaginaAtiva={setPaginaAtiva} />
        )}

       </main>

        {abaAtiva === 'contrato-detalhe' && (
          <ContratoDetailComponent dados={dados} />
        )}

       </div>
  
      );
     };

    // Componente auxiliar local para exibir os dados textuais do contrato sem loop de importação
    const ContratoDetailComponent: React.FC<{ dados: IDetalhesContrato | null }> = ({ dados }) => {
    if (!dados) return <p>Nenhum dado de contrato carregado.</p>;
        return (
     // 🛠️ ALINHAMENTO GÊMEO: Copiado o exato padrão de tamanho, centralização e bordas do seu Header
     <div 
      className="card bg-white text-dark p-4 border-0 shadow-sm my-3" 
      style={{ 
        width: "100%",
        maxWidth: "1200px",       /* 👈 Espelha o tamanho do header */
        margin: "0 auto",         /* 👈 Garante a mesma centralização no PC */
        borderRadius: "12px",     /* Arredondamento suave combinando com o topo */
        boxSizing: "border-box"
      }}
     >
      
      {/* Título interno minimalista escuro */}
      <h3 className="fs-6 fw-bold text-dark opacity-75 border-bottom border-light pb-2 mb-4 text-start text-uppercase" style={{ letterSpacing: '0.5px' }}>
        Informações Contratuais
      </h3>

      {/* Estrutura de grid compacta */}
      <div className="container-fluid p-0 text-start">
        
        {/* row-cols-md-4 divide os itens em 4 colunas horizontais limpas no PC */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4 m-0 p-0">
          
          {/* Item 1: Data de Início */}
          <div className="col ps-0"> {/* ps-0 cola o primeiro item perfeitamente no alinhamento esquerdo */}
            <span className="d-block fw-semibold text-uppercase text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
              Data de Início
            </span>
            <span className="d-block fs-6 fw-bold text-dark mt-1">
              {dados.StartDate || dados.StartDate ? new Date(dados.StartDate || dados.StartDate).toLocaleDateString('pt-BR') : '-'}
            </span>
          </div>

          {/* Item 2: Data de Encerramento */}
          <div className="col">
            <span className="d-block fw-semibold text-uppercase text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
              Data de Encerramento
            </span>
            <span className="d-block fs-6 fw-bold text-dark mt-1">
              {dados.EndDate || dados.EndDate ? new Date(dados.EndDate || dados.EndDate).toLocaleDateString('pt-BR') : 'Vigente'}
            </span>
          </div>

          {/* Item 3: Código de Faturamento */}
          <div className="col">
            <span className="d-block fw-semibold text-uppercase text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
              Código de Faturamento
            </span>
            <span className="d-block fs-6 fw-bold text-dark mt-1">
              {dados.BillingCode || dados.BillingCode || '-'}
            </span>
          </div>

          {/* Item 4: Prazo de Pagamento */}
          <div className="col pe-0"> {/* pe-0 cola o último item na borda direita */}
            <span className="d-block fw-semibold text-uppercase text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
              Prazo de Pagamento
            </span>
            <span className="d-block fs-6 fw-bold text-dark mt-1">
              {dados.PaymentTerm || dados.PaymentTerm ? `${dados.PaymentTerm || dados.PaymentTerm} dias` : '-'}
            </span>
          </div>

          {/* Item 5: Valor Mensalidade */}
          <div className="col-12 mt-3 pt-3 border-top border-light ps-0">
            <span className="d-block fw-semibold text-uppercase text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
              Valor Mensalidade Tag
            </span>
            <span className="d-block fs-5 fw-bold mt-1" style={{ color: '#4f46e5' }}>
              R$ {dados.TagMonthlyFeeUnitValue || dados.TagMonthlyFeeUnitValue || '0,00'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
