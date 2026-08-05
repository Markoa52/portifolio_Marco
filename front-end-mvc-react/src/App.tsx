import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar.tsx';
import { VisaoGeral } from './components/visaoGeral.tsx';
import { Gerenciador } from './components/gerenciador.tsx';
import { Dashboard } from './components/dashboard.tsx';
import { ConsumoAPI } from './components/consumoAPI.tsx';

import type { IEmailRegistro } from './types/index.ts';

type PaginaTipo = 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI';

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaTipo>('visao-geral');
  const [dadosSharePoint, setDadosSharePoint] = useState<IEmailRegistro[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  // MONITOR DE ÁREA ÚTIL: O React descobre o tamanho real do ecrã a cada milissegundo!
  const [larguraJanela, setLarguraJanela] = useState<number>(window.innerWidth);

  useEffect(() => {
    const tratarRedimensionamento = () => setLarguraJanela(window.innerWidth);
    window.addEventListener('resize', tratarRedimensionamento);
    
    async function puxarDadosDoExpress() {
      try {
        setCarregando(true);

        //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
        const resposta = await fetch('/api/dados');

        if (!resposta.ok) throw new Error(`Erro no servidor: Status ${resposta.status}`);
        const resultado = await resposta.json();

        //Nesse ponto popula a interface com os dados que retornaram da rota da API(back-end)
        const dadosNormalizados: IEmailRegistro[] = resultado.map((item: any) => ({
          data: item.Data || item.data || '-',
          assunto: item.Assunto || item.assunto || '-',
          email: item.Email || item.email || '-',
          acoes: item.Acoes || item.acoes || '-'
        }));
        setDadosSharePoint(dadosNormalizados);
      } catch (err: any) {
        console.error(err);
        setErro(err.message || "Falha na conexão.");
      } finally {
        setCarregando(false);
      }
    }

    puxarDadosDoExpress();

    return () => window.removeEventListener('resize', tratarRedimensionamento);
  }, []);

  // Deteta se o utilizador está num ecrã de computador ou num smartphone/tablet
  const isMobile = larguraJanela <= 1024;

  return (
    <div 
      style={{ 
        display: 'flex', 
        // O SEGREDO DO SUCESSO: Se for mobile, empilha no TOPO (column). Se for PC, fica na lateral (row).
        flexDirection: isMobile ? 'column' : 'row', 
        width: '100vw', 
        height: '100vh', 
        overflow: isMobile ? 'auto' : 'hidden',
        backgroundColor: '#121212',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Barra de Navegação Adaptativa */}
      <Sidebar paginaAtiva={paginaAtiva} setPaginaAtiva={setPaginaAtiva} />

      {/* Área do Conteúdo Principal com Geometria Fixa Controlada por Hardware */}
      <div 
        className="main-content"
        style={{ 
          flex: 1, 
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          padding: isMobile ? '12px' : '20px 25px', 
          overflowY: isMobile ? 'visible' : 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          // CENTRA O LAYOUT NO SMARTPHONE: Força o alinhamento simétrico nas laterais móveis
          alignItems: isMobile ? 'center' : 'flex-start'
        }}
      >
        {/* Popula uma variavel com os dados da API para usar no componente que vai criar a pagina */}
        {paginaAtiva === 'visao-geral' && (
          <>
            {carregando && <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}><p>⏳ A carregar dados físicos do SharePoint...</p></div>}
            {erro && <div style={{ textAlign: 'center', padding: '40px', color: '#e63946' }}><p>❌ Erro de Integração: {erro}</p></div>}
            {!carregando && !erro && <VisaoGeral dados={dadosSharePoint} />}
          </>
        )}

        {paginaAtiva === 'gerenciador' && (
          <Gerenciador dadosIniciais={dadosSharePoint} />
        )}

        {paginaAtiva === 'dashboard' && (
          <Dashboard />
        )}

          {paginaAtiva === 'consumoAPI' && (
          <ConsumoAPI />
        )}
      </div>
    </div>
  );
}

export default App;
