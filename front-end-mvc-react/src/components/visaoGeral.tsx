import React, { useState, useMemo } from 'react';
import axios from 'axios'; // IMPORTANTE: Adicione o Axios para fazer a ponte com a API
import type { IEmailRegistro } from '../types';

interface IVisaoGeralProps {
  dados: IEmailRegistro[];
}

export const VisaoGeral: React.FC<IVisaoGeralProps> = ({ dados }) => {
  // 1. ESTADOS (States) do Componente
  const [pesquisa, setPesquisa] = useState<string>('');
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [registroSelecionado, setRegistroSelecionado] = useState<IEmailRegistro | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false); // Estado para controlar o loading do download
  
  const registrosPorPagina = 5;

  // 2. FILTRAGEM DINÂMICA (Performance inteligente com useMemo)
  const dadosFiltrados = useMemo(() => {
    const termo = pesquisa.toLowerCase().trim();
    if (!termo) return dados;
    
    return dados.filter(item => 
      item.assunto.toLowerCase().includes(termo) || 
      item.email.toLowerCase().includes(termo)
    );
  }, [pesquisa, dados]);

  // Resetar a paginação se o usuário começar a pesquisar
  useMemo(() => {
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
      const resposta = await axios.post('/api/gerarArquivoSend', {
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

  // SE O USUÁRIO CLICAR EM "VER DETALHES"
  if (registroSelecionado) {
    return (
      <div className="main-content-wrapper">      
        <div className="header-container-sistema-bloco">
          <h2 className="titulo-gerenciador-fluxos">🔍 Visualizar Detalhes do Registro</h2>
          
          <div className="botoes-topo-gerenciador-esquerda">
            <button 
              className="btn-crud" 
              style={{ backgroundColor: '#e63946', color: '#fff' }} 
              onClick={() => setRegistroSelecionado(null)} 
            >
              ⬅️ Voltar para a Listagem
            </button>
          </div>
        </div>
        <div style={{ padding: '20px', background: '#2d2d2d', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
          <h3 style={{ color: '#3399ff', marginTop: 0 }}>Informações Estruturadas</h3>
          <p style={{ color: '#fff' }}><strong>Assunto:</strong> {registroSelecionado.assunto}</p>
          <p style={{ color: '#aaa' }}><strong>Remetente:</strong> {registroSelecionado.email}</p>
          <p style={{ color: '#aaa' }}><strong>Data de Processamento:</strong> {registroSelecionado.data}</p>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO DA LISTAGEM TRADICIONAL
  return (
    <div className="main-content-wrapper">  
      <h2 className="titulo-com-linha">📋 Listagem de E-mails Registrados</h2>  
       
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

        {dadosFiltrados.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center', padding: '20px 0' }}>Nenhum registro encontrado.</p>
        ) : (
          <>
            <div className="tabela-scroll-container">
              <table className="tabela-sistema">
                <thead>
                  <tr>
                    <th className="col-data">Data</th>
                    <th className="col-assunto">Assunto</th>
                    <th className="col-email">Email</th>
                    <th className="col-acoes" style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensDaPagina.map((item, index) => (
                    <tr key={index}>
                      <td>{item.data}</td>
                      <td>{item.assunto}</td>
                      <td>{item.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-ver" onClick={() => setRegistroSelecionado(item)}>🔍 Ver</button>
                      </td>
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
  );
};
