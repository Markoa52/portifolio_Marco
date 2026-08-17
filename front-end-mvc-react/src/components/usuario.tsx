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
  // Limpa o visual escuro antigo e trava na largura padrão de 1200px alinhada ao Header
  <div className="container my-4 p-0 px-2 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">📋 Usuários</h2>  
    </div>
       
    {/* PAINEL OPERACIONAL (Card Branco Limpo) */}
    <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 mx-0 w-100 mb-4">
      
      {/* BARRA DE FERRAMENTAS: Pesquisa na esquerda e Exportações na direita */}
      <div className="row g-3 align-items-center mb-3">
        
        {/* Barra de Pesquisa */}
        <div className="col-md-6">
          <input 
            type="text" 
            className="form-control" 
            placeholder="🔍 Pesquisar por assunto ou e-mail..." 
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.875rem' }}
            value={pesquisa} 
            onChange={(e) => setPesquisa(e.target.value)} 
          />
        </div>

        {/* Botões de Exportação alinhados à direita com cores corporativas sutis */}
        <div className="col-md-6 d-flex justify-content-md-end gap-2">
          <button 
            className="btn btn-outline-dark btn-sm fw-semibold px-3 py-2" 
            style={{ opacity: carregando ? 0.6 : 1 }}
            disabled={carregando || dadosFiltrados.length === 0}
            onClick={() => handleExportarArquivo('excel')}
          >
            {carregando ? '⏳ Aguarde...' : '📥 Baixar Excel'}
          </button>
          <button 
            className="btn btn-dark btn-sm fw-semibold px-3 py-2" 
            style={{ opacity: carregando ? 0.6 : 1 }}
            disabled={carregando || dadosFiltrados.length === 0}
            onClick={() => handleExportarArquivo('pdf')}
          >
            {carregando ? '⏳ Aguarde...' : '📄 Baixar PDF'}
          </button>
        </div>

      </div>

      {/* FEEDBACK DE CARREGAMENTO */}
      {carregando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary mb-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
          <p className="text-muted small my-0">Carregando dados dos usuários...</p>
        </div>
      ) : (
        <>
          {/* TABELA DE CONSULTA RESTRUTURADA */}
          <div className="table-responsive border rounded-3 bg-white mt-2">
            <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
              <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <tr>
                  <th style={{ width: '20%' }}>Data</th>
                  <th style={{ width: '45%' }}>Assunto</th>
                  <th style={{ width: '35%' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted text-center py-4 small">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  itensDaPagina.map((item, index) => (
                    <tr key={index}>
                      <td className="text-dark fw-medium">{item.data}</td>
                      <td className="text-secondary">{item.assunto}</td>
                      <td className="text-secondary">{item.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINAÇÃO RESPONSIVOS */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-3 pt-2 border-top">
            <span className="text-muted small">
              Mostrando {indiceInicial + 1} a {Math.min(indiceInicial + registrosPorPagina, dadosFiltrados.length)} de {dadosFiltrados.length} registros (Página {paginaAtual}/{totalPaginas || 1})
            </span>
            <div className="btn-group">
              <button 
                className="btn btn-light btn-sm border fw-medium px-3" 
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(prev => prev - 1)}
              >
                Anterior
              </button>
              <button 
                className="btn btn-light btn-sm border fw-medium px-3" 
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
);

};
