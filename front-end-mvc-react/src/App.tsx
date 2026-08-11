import { useState, useEffect } from 'react';
import { Sidebar } from './components/sidebar.tsx';
import { VisaoGeral } from './components/visaoGeral.tsx';
import { Gerenciador } from './components/gerenciador.tsx';
import { Dashboard } from './components/dashboard.tsx';
import { ConsumoAPI } from './components/consumoAPI.tsx';
import { Contrato } from './components/contrato.tsx';
import { Atendimento } from './components/atendimento.tsx';

import type { IEmailRegistro } from './types/index.ts';

type PaginaTipo = 'visao-geral' | 'gerenciador' | 'dashboard' | 'consumoAPI' | 'contrato' | 'atendimento';

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<PaginaTipo>('atendimento');
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
      {/* Barra de Navegação Adaptativa (Fica travada na esquerda no PC) */}
      <Sidebar paginaAtiva={paginaAtiva} setPaginaAtiva={setPaginaAtiva} />

      {/* Área do Conteúdo Principal Ajustada */}
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
      >
        {/* Renderização das suas páginas condicionais (visao-geral, contrato, etc) */}
        {paginaAtiva === 'visao-geral' && (
          <>
            {carregando && <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}><p>⏳ A carregar dados...</p></div>}
            {erro && <div style={{ textAlign: 'center', padding: '40px', color: '#e63946' }}><p>❌ Erro: {erro}</p></div>}
            {!carregando && !erro && <VisaoGeral dados={dadosSharePoint} />}
          </>
        )}

        {paginaAtiva === 'gerenciador' && <Gerenciador dadosIniciais={dadosSharePoint} />}
        {paginaAtiva === 'dashboard' && <Dashboard />}
        {paginaAtiva === 'consumoAPI' && <ConsumoAPI />}
        {paginaAtiva === 'contrato' && (
          <Contrato setPaginaAtiva={setPaginaAtiva} />
        )}

         {paginaAtiva === 'atendimento' && (
          <Atendimento />
        )}

      </div>
    </div>
  );


}
export default App;
