import { useState } from 'react';
import { Contrato } from './components/contrato.tsx';
import { Atendimento } from './components/atendimento.tsx';
import { Dashboard } from './components/dashboard.tsx';
import { ConsumoAPI } from './components/consumoAPI.tsx';
import {CadastroContrato} from './components/cadastroContrato.tsx'
import type { PaginaTipo } from './components/contrato.tsx';
import { PesquisarContrato } from './components/pesquisarContrato.tsx';
import {ConfiguracaoSistema} from './components/configuracaoSistema.tsx';

function App() {

  const [payloadGlobal, setPayloadGlobal] = useState<any>(null);

  const [paginaAtiva, setPaginaAtiva] = useState<PaginaTipo>('atendimento');
  
  // Fornecido a função modificadora "setIdContratoSelecionado" para caso você precise dela no futuro
  const [, setIdContratoSelecionado] = useState<string>('');

      return (
    <div>
      {/* Área do Conteúdo Principal Ajustada */}
      <div>     
        {paginaAtiva === 'dashboard' && <Dashboard />}
        {paginaAtiva === 'consumoAPI' && <ConsumoAPI />}

        {/* 🔥 REVISÃO CRUCIAL 1: Garanta que o termo seja 'contrato' em minúsculo */}
        {paginaAtiva === 'contrato' && (
          <Contrato 
            payloadEnvio={payloadGlobal}      /* 👈 Envia o payload que a pesquisa salvou na memória */
            setPaginaAtiva={setPaginaAtiva}   /* Permite voltar para o atendimento depois */
            paginaAtiva={paginaAtiva}
          />
        )}
        
        {/* REVISÃO CRUCIAL 2: Garanta que o atendimento repasse a função para a pesquisa salvar o payload */}
        {paginaAtiva === 'atendimento' && (
          <Atendimento 
            setPaginaAtiva={setPaginaAtiva} 
            setIdContratoSelecionado={setIdContratoSelecionado}
            setPayloadGlobal={setPayloadGlobal} /* 👈 Permite que a busca salve os dados de carona */
          />
        )}

        {paginaAtiva === 'pesquisar-contrato' && (
          <PesquisarContrato 
            setPaginaAtiva={setPaginaAtiva} 
            setIdContratoSelecionado={setIdContratoSelecionado}
            setPayloadGlobal={setPayloadGlobal} // 👈 Adicione esta linha
          />
        )}

        {paginaAtiva === 'cadastro-contrato' && (
          <CadastroContrato />
        )}

          {paginaAtiva === 'configuracao-sistema' && (
          <ConfiguracaoSistema />
        )}

      </div>
    </div>
  );
}

export default App;
