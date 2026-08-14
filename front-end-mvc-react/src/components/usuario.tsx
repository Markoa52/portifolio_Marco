import React, { useState, useMemo, useEffect } from 'react';
import '../styles/usuario.css';
import type { IEmailRegistro } from '../types/index.ts';
import type { PaginaTipo } from './contrato.tsx';
import axios from 'axios';

// 1. Como a página busca os próprios dados, deixamos a prop 'dados' como opcional ou limpamos
export interface IVisaoGeralProps {
  dados?: any[]; 
  setPaginaAtiva?: (pagina: PaginaTipo) => void;
}

export const Usuario: React.FC<IVisaoGeralProps> = ({ }) => {

  // ==========================================================================
  // 🌟 1. TODOS OS ESTADOS NO TOPO (ESSENCIAL PARA NÃO TRAVAR O COMPONENTE)
  // ==========================================================================
  const [dadosSharePoint, setDadosSharePoint] = useState<IEmailRegistro[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false); // 🛠️ Movido para o topo!
  const [pesquisa, setPesquisa] = useState<string>(''); // 🛠️ Movido para o topo!
  const [paginaAtual, setPaginaAtual] = useState<number>(1); // 🛠️ Movido para o topo!
  
  const [, setErro] = useState<string | null>(null);
  const [larguraJanela, setLarguraJanela] = useState<number>(window.innerWidth);

  const registrosPorPagina = 5;

  // ==========================================================================
  // ✈️ 2. CICLO DE VIDA (Agora ele enxerga todos os setEstados perfeitamente)
  // ==========================================================================

  useEffect(() => {
  async function puxarDadosDoExpress(){

    const tratarRedimensionamento = () => setLarguraJanela(window.innerWidth);
    window.addEventListener('resize', tratarRedimensionamento);

      try {
        setCarregando(true);
        console.log("✈️ Tentando disparar requisição para a API...");

        const resposta = await fetch('http://localhost:3000/api/dados', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!resposta.ok) throw new Error(`Erro no servidor: Status ${resposta.status}`);
        const resultado = await resposta.json();

        const dadosNormalizados: IEmailRegistro[] = resultado.map((item: any) => ({
          data: item.Data || item.data || '-',
          assunto: item.Assunto || item.assunto || '-',
          email: item.Email || item.email || '-',
          acoes: item.Acoes || item.acoes || '-'
        }));

        setDadosSharePoint(dadosNormalizados);
        console.log("✅ Dados recebidos e salvos no estado!");
      } catch (err: any) {
        console.error("❌ Erro ao puxar dados:", err);
        setErro(err.message || "Falha na conexão.");
      } finally {
        setCarregando(false);
      }
    }

    const tratarRedimensionamento = () => setLarguraJanela(window.innerWidth);
    window.addEventListener('resize', tratarRedimensionamento);
    
    // Força a execução da função livre
    puxarDadosDoExpress();

    return () => window.removeEventListener('resize', tratarRedimensionamento);
  }, []);

      //Deteta se o utilizador está num ecrã de computador ou num smartphone/tablet
   const isMobile = larguraJanela <= 1024;

  // ==========================================================================
  // 📊 3. FILTRAGEM DINÂMICA E LOGÍCA ABAIXO DO CICLO DE VIDA
  // ==========================================================================
  const dadosFiltrados = useMemo(() => {
    return dadosSharePoint.filter((item) => {
      return (
        item.assunto?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        item.email?.toLowerCase().includes(pesquisa.toLowerCase())
      );
    });
  }, [dadosSharePoint, pesquisa]);

  // Resetar a paginação se o usuário começar a pesquisar
useEffect(() => {
  setPaginaAtual(1);
}, [pesquisa]);

  // 3. MATEMÁTICA DA PAGINAÇÃO
  const totalPaginas = Math.ceil(dadosFiltrados.length / registrosPorPagina);
  const indiceInicial = (paginaAtual - 1) * registrosPorPagina;
  
  const itensDaPagina = useMemo(() => {
    return dadosFiltrados.slice(indiceInicial, indiceInicial + registrosPorPagina);
  }, [dadosFiltrados, paginaAtual]);

  // 4. FUNÇÃO LOGÍSTICA PARA EXPORTAÇÃO E DOWNLOAD AUTOMÁTICO
  const handleExportarArquivo = async (formato: 'excel' | 'pdf') => {
    try {
      setCarregando(true);

      // 1. Solicita a geração do arquivo enviando o formato
      const resposta = await axios.post('http://localhost:3000/api/gerarArquivoSend', {
        tipoArquivo: formato 
      });

      // Captura o protocolo retornado pela nova controller
      const protocoloId = resposta.data?.protocoloId;

      if (!protocoloId) {
        alert('O servidor aceitou a requisição, mas não gerou um número de protocolo válido.');
        setCarregando(false);
        return;
      }

      console.log(`Processamento iniciado. Protocolo: ${protocoloId}. Iniciando Polling...`);

      // 2. Inicia o Polling (Verificação contínua a cada 2 segundos)
      // 2. Inicia o Polling (Verificação contínua a cada 2 segundos)
      const checarIntervalo = setInterval(async () => {
        try {
          const checagem = await axios.get(`/api/checar-arquivo/${protocoloId}/${formato}`);

          // CORREÇÃO: Alinhado com o JSON de sucesso retornado pela API principal (sucesso: true)
          // Também validamos o status 200 para garantir que o arquivo foi encontrado de verdade
          if (checagem.status === 200 && checagem.data && checagem.data.sucesso) {
            clearInterval(checarIntervalo); // Interrompe o Polling imediatamente

            // 3. Executa a logística do download automático com o link real
            const linkVirtual = document.createElement('a');
            linkVirtual.href = checagem.data.url; 
            
            // Força a abertura em uma nova aba para evitar bloqueios de CORS do navegador caso ocorram
            linkVirtual.setAttribute('target', '_blank');
            
            const extensao = formato === 'excel' ? 'xlsx' : 'pdf';
            linkVirtual.setAttribute('download', `relatorio_emails_${protocoloId}.${extensao}`);
            
            document.body.appendChild(linkVirtual);
            linkVirtual.click(); 
            document.body.removeChild(linkVirtual); 

            setCarregando(false); // Remove o estado de loading da tela
          }
        } catch (erro) {
          console.error('Erro ao verificar status do arquivo no servidor:', erro);
        }
      }, 2000); // 2000ms = 2 segundos de intervalo entre checagens

    } catch (error: any) {
      console.error('Erro ao solicitar arquivo para download:', error);
      alert(`Falha ao iniciar a geração do arquivo: ${error.response?.data?.mensagem || error.message}`);
      setCarregando(false);
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        width: '100%',            
        height: '100vh',          /* FORÇA a altura estrita do monitor para prender o layout */
        backgroundColor: '#121212',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overflow: 'hidden'        /* PROÍBE a página global de rolar e mexer o Sidebar */
      }}
      >
      <div 
        className="main-content"
        style={{ 
          flex: 1, 
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          height: '100%',         /* Ocupa a altura total disponível ao lado do sidebar */
          padding: isMobile ? '12px' : '20px 25px', 
          overflowY: 'auto',      /* MÁGICA: A rolagem vertical acontece EXCLUSIVAMENTE aqui dentro */
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}
      ></div>

    <div className="main-content-wrapper">  
      <h2>📋 Usuários</h2>  
       
      <div className="painel-operacional">
        <div className="ferramentas-tabela" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* ENVELOPE DO SUCESSO: Barra de pesquisa à esquerda */}
          <div className="grupo-operacional-pesquisa" style={{ flex: 1 }}>
            <input 
              type="text" 
              id="inputPesquisa" 
              placeholder="🔍 Pesquisar por assunto ou e-mail..." 
              value={pesquisa} 
              onChange={(e) => setPesquisa(e.target.value)} 
            />
          </div>

          {/* ADIÇÃO DOS BOTÕES DE EXPORTAÇÃO (Alinhados à direita) */}
          <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
            <button 
              className="btn-ver" 
              style={{ backgroundColor: '#2ec4b6', color: '#fff', opacity: carregando ? 0.6 : 1 }}
              disabled={carregando || dadosFiltrados.length === 0}
              onClick={() => handleExportarArquivo('excel')}
            >
              {carregando ? '⏳ Aguarde...' : '📥 Baixar Excel'}
            </button>
            <button 
              className="btn-ver" 
              style={{ backgroundColor: '#ff9f1c', color: '#fff', opacity: carregando ? 0.6 : 1 }}
              disabled={carregando || dadosFiltrados.length === 0}
              onClick={() => handleExportarArquivo('pdf')}
            >
              {carregando ? '⏳ Aguarde...' : '📄 Baixar PDF'}
            </button>
          </div>
        </div>

        {carregando  ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Carregando .</p>
        ) : (
          <>
            <div className="tabela-scroll-container">
              <table className="tabela-sistema">
                <thead>
                  <tr>
                    <th className="col-data">Data</th>
                    <th className="col-assunto">Assunto</th>
                    <th className="col-email">Email</th>
                    {/* <th className="col-acoes" style={{ textAlign: 'center' }}>Ações</th> */}
                  </tr>
                </thead>
                <tbody>
                  {itensDaPagina.map((item, index) => (
                    <tr key={index}>
                      <td>{item.data}</td>
                      <td>{item.assunto}</td>
                      <td>{item.email}</td>
                      {/* <td style={{ textAlign: 'center' }}>
                        <button className="btn-ver" onClick={() => setRegistroSelecionado(item)}>🔍 Ver</button> 
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="paginacaoContainer">
              <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                A mostrar {indiceInicial + 1} a {Math.min(indiceInicial + registrosPorPagina, dadosFiltrados.length)} de {dadosFiltrados.length} registros (Página {paginaAtual}/{totalPaginas || 1})
              </span>
              <div className="botoes-paginacao">
                <button 
                  className="btn-ver" 
                  disabled={paginaAtual === 1}
                  onClick={() => setPaginaAtual(prev => prev - 1)}
                >
                  Anterior
                </button>
                <button 
                  className="btn-ver" 
                  disabled={paginaAtual === totalPaginas || totalPaginas === 0}
                  onClick={() => setPaginaAtual(prev => prev + 1)}
                >
                  Próximo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
};
