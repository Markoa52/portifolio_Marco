import { useState } from 'react';
import { Contrato } from './components/contrato.tsx';
import { Atendimento } from './components/atendimento.tsx';
import { Dashboard } from './components/dashboard.tsx';
import { ConsumoAPI } from './components/consumoAPI.tsx';
import type { PaginaTipo } from './components/contrato.tsx';

function App() {

  const [paginaAtiva, setPaginaAtiva] = useState<PaginaTipo>('contrato');

      return (
    <div>
      {/* Área do Conteúdo Principal Ajustada */}
      <div>     
        {paginaAtiva === 'dashboard' && <Dashboard />}
        {paginaAtiva === 'consumoAPI' && <ConsumoAPI />}
        {paginaAtiva === 'contrato' && (
        <Contrato 
          setPaginaAtiva={setPaginaAtiva}
          paginaAtiva={paginaAtiva} dadosOneDrive={[]}  />
        )}

         {paginaAtiva === 'atendimento' && (
          <Atendimento />
        )}

      </div>
    </div>
  );
}

export default App;
