import React, { useState } from 'react';

// Atualizamos as opções de sub-telas da frota com os novos cadastros
type SubAbaFrota = 'lista' | 'editar' | 'ativacao' | 'detalhes' | 'cadastro-unico' | 'cadastro-lote';

interface IVeiculo {
  placa: string;
  tag: string;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  dataAtivacao: string;
}

const VEICULOS_MOCK: IVeiculo[] = [
  { placa: 'ABC-1234', tag: 'TAG-99812', status: 'Ativo', dataAtivacao: '12/01/2025' },
  { placa: 'XYZ-5678', tag: 'TAG-44321', status: 'Inativo', dataAtivacao: '20/03/2025' },
  { placa: 'KGB-0077', tag: 'TAG-11223', status: 'Manutenção', dataAtivacao: '05/06/2025' },
];

export const ListarFrota: React.FC = () => {
  const [subAba, setSubAba] = useState<SubAbaFrota>('lista');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<IVeiculo | null>(null);

  const navegarPara = (tela: SubAbaFrota, veiculo: IVeiculo | null) => {
    setVeiculoSelecionado(veiculo);
    setSubAba(tela);
  };

    // -------------------------------------------------------------
  // TELA 1: LISTAGEM DA FROTA (TABELA COM O BOTÃO EXPORTAR INCLUÍDO)
  // -------------------------------------------------------------
  if (subAba === 'lista') {
    return (
      <div className="frota-lista-container">
        <h2>Frota</h2>
        {/* Barra de Ações de Topo Atualizada */}
        <div className="frota-acoes-topo">
          {/* NOVO BOTÃO EXPORTAR (Alinhado à esquerda do grupo de cadastro) */}
          <button 
            className="btn-fatura secundario" 
            onClick={() => alert('Gerando arquivo Excel/CSV... O download começará em instantes!')}
            style={{ marginRight: 'auto' }} /* TRUQUE: Empurra este botão para a esquerda e os de cadastro para a direita! */
          >
            📥 Exportar Lista
          </button>

          <button 
            className="btn-fatura secundario" 
            onClick={() => setSubAba('cadastro-lote')}
          >
            📦 Adicionar em Lote
          </button>
          
          <button 
            className="btn-fatura primario" 
            onClick={() => setSubAba('cadastro-unico')}
          >
            ➕ Adicionar Veículo
          </button>
        </div>

        {/* Tabela de Veículos (Continua igual) */}
        <div className="tabela-responsiva-wrapper">
          <table className="tabela-moderna">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tag</th>
                <th>Status</th>
                <th>Data de Ativação</th>
                <th className="texto-centralizado">Ações</th>
              </tr>
            </thead>
            <tbody>
              {VEICULOS_MOCK.map((veiculo) => (
                <tr key={veiculo.placa}>
                  <td>
                    <button className="link-clicavel-tabela" onClick={() => navegarPara('editar', veiculo)}>
                      {veiculo.placa}
                    </button>
                  </td>
                  <td className="texto-negrito-id">{veiculo.tag}</td>
                  <td>
                    <button className={`badge-botao status-${veiculo.status.toLowerCase()}`} onClick={() => navegarPara('ativacao', veiculo)}>
                      {veiculo.status} ⚙
                    </button>
                  </td>
                  <td>{veiculo.dataAtivacao}</td>
                  <td className="texto-centralizado">
                    <button className="btn-tabela-acao" onClick={() => navegarPara('detalhes', veiculo)}>
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }


  // -------------------------------------------------------------
  // TELA NUEVA: CADASTRO ÚNICO DE VEÍCULO
  // -------------------------------------------------------------
  if (subAba === 'cadastro-unico') {
    return (
      <div className="sub-tela-frota-container">
        <h3>➕ Cadastrar Novo Veículo</h3>
        <p>Preencha os campos abaixo para inserir um veículo individualmente no sistema.</p>
        {/* Formulário básico simulado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '15px 0' }}>
          <input type="text" placeholder="Placa (Ex: ABC-1234)" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
          <input type="text" placeholder="Número da Tag" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-fatura primario" onClick={() => { alert('Veículo cadastrado!'); setSubAba('lista'); }}>Salvar Veículo</button>
          <button className="botao-voltar-moderno" onClick={() => setSubAba('lista')}>Cancelar</button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TELA NUEVA: CADASTRO EM LOTE (UPLOAD)
  // -------------------------------------------------------------
  if (subAba === 'cadastro-lote') {
    return (
      <div className="sub-tela-frota-container">
        <h3>📦 Importar Veículos em Lote</h3>
        <p>Faça o upload de um arquivo de planilha (.csv ou .xlsx) contendo as colunas de Placas e Tags.</p>
        
        <div className="zona-upload-simulada" style={{ border: '2px dashed #cbd5e1', padding: '30px', textAlign: 'center', borderRadius: '8px', margin: '20px 0', backgroundColor: '#f8fafc' }}>
          <p style={{ margin: 0, color: '#64748b' }}>Arraste seu arquivo aqui ou clique para selecionar</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-fatura primario" onClick={() => { alert('Planilha processada com sucesso!'); setSubAba('lista'); }}>Processar Arquivo</button>
          <button className="botao-voltar-moderno" onClick={() => setSubAba('lista')}>Cancelar</button>
        </div>
      </div>
    );
  }

  // TELA DE EDIÇÃO
  if (subAba === 'editar' && veiculoSelecionado) {
    return (
      <div className="sub-tela-frota-container">
        <h3>✏️ Editar Veículo: {veiculoSelecionado.placa}</h3>
        <p>Formulário de alteração de dados do veículo aqui...</p>
        <button className="botao-voltar-moderno" onClick={() => setSubAba('lista')}>Confirmar / Voltar</button>
      </div>
    );
  }

  // TELA DE ATIVAÇÃO
  if (subAba === 'ativacao' && veiculoSelecionado) {
    return (
      <div className="sub-tela-frota-container">
        <h3>⚙️ Gerenciar Ativação: {veiculoSelecionado.placa}</h3>
        <p>Status Atual: <strong>{veiculoSelecionado.status}</strong></p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button className="btn-fatura primario" onClick={() => alert('Veículo Ativado!')}>Ativar Veículo</button>
          <button className="btn-fatura secundario" onClick={() => alert('Veículo Inativado!')}>Inativar Veículo</button>
        </div>
        <button className="botao-voltar-moderno" style={{ marginTop: '20px' }} onClick={() => setSubAba('lista')}>Voltar</button>
      </div>
    );
  }

  // TELA DE DETALHES
  if (subAba === 'detalhes' && veiculoSelecionado) {
    return (
      <div className="sub-tela-frota-container">
        <h3>📊 Detalhes Completos: {veiculoSelecionado.placa}</h3>
        <p><strong>Número da Tag:</strong> {veiculoSelecionado.tag}</p>
        <p><strong>Data de Entrada no Sistema:</strong> {veiculoSelecionado.dataAtivacao}</p>
        <button className="botao-voltar-moderno" onClick={() => setSubAba('lista')}>Voltar para a Lista</button>
      </div>
    );
  }

  return null;
};
