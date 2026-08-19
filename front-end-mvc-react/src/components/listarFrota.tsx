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
<<<<<<< HEAD
    return (
=======
     return (
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
  /* container limita a largura em 1200px e px-3 sincroniza as bordas com o seu Header */
  <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
    
    {/* CABEÇALHO DA TELA */}
    <div className="border-bottom pb-3 mb-4">
      <h2 className="fs-4 fw-bold text-dark m-0">Frota</h2>
    </div>

    {/* PAINEL OPERACIONAL (Card Branco Limpo) */}
    <div className="card p-3 p-md-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
      
      {/* BARRA DE AÇÕES DO TOPO RESPONSIVA */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-wrap align-items-md-center gap-2 mb-4">
        <button 
          className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
          onClick={() => alert('Gerando arquivo Excel/CSV... O download começará em instantes!')}
        >
          📥 Exportar Lista
        </button>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
            onClick={() => setSubAba('cadastro-lote')}
          >
            📦 Em Lote
          </button>
          
          <button 
            className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-3 flex-grow-1 flex-md-grow-0" 
            onClick={() => setSubAba('cadastro-unico')}
          >
            ➕ Adicionar Veículo
          </button>
        </div>
      </div>

      {/* ==========================================================================
          VISÃO 1: COMPUTAÇÃO E NOTEBOOKS (Tabela Tradicional Completa)
          Exibe apenas do tamanho médio (md) para cima
          ========================================================================== */}
      <div className="d-none d-md-block table-responsive border rounded-3 bg-white" >
        <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.875rem' }}>
          <thead className="table-light text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ width: '20%' }}>Placa</th>
              <th style={{ width: '25%' }}>Tag</th>
              <th style={{ width: '20%' }}>Status</th>
              <th style={{ width: '20%' }}>Data de Ativação</th>
              <th className="text-center" style={{ width: '15%' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {VEICULOS_MOCK.map((veiculo) => (
              <tr key={veiculo.placa}>
                <td>
                  <span className="text-primary fw-bold cp text-decoration-underline" onClick={() => navegarPara('editar', veiculo)} style={{ cursor: 'pointer' }}>
                    {veiculo.placa}
                  </span>
                </td>
                <td className="text-dark fw-bold">{veiculo.tag}</td>
                <td>
                  <span 
                    className={`badge px-2.5 py-1.5 fw-bold ${
                      veiculo.status.toLowerCase() === 'ativa' || veiculo.status.toLowerCase() === 'ativo' ? 'bg-success-subtle text-success border border-success-subtle' :
                      veiculo.status.toLowerCase() === 'bloqueada' || veiculo.status.toLowerCase() === 'bloqueado' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                      'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                    }`}
                    onClick={() => navegarPara('ativacao', veiculo)}
                    style={{ cursor: 'pointer' }}
                  >
                    {veiculo.status} ⚙
                  </span>
                </td>
                <td className="text-secondary">{veiculo.dataAtivacao}</td>
                <td className="text-center">
                  <button className="btn btn-light btn-sm border text-dark fw-semibold" style={{ fontSize: '0.75rem' }} onClick={() => navegarPara('detalhes', veiculo)}>
                    Ver Detalhes
                  </button>
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
      <div className="d-block d-md-none d-flex flex-column">
        {VEICULOS_MOCK.map((veiculo) => (
          /* CORREÇÃO CHAVE: Adicionado 'mb-3' para criar o espaço perfeito separando um veículo do outro! */
          <div key={veiculo.placa} className="p-3 bg-light border border-light-subtle rounded-3 text-start shadow-none mb-3">
            
            {/* Linha Superior: Placa Clicável e Badge de Status com Engrenagem */}
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span className="text-primary fw-bold fs-6 text-decoration-underline" onClick={() => navegarPara('editar', veiculo)} style={{ cursor: 'pointer' }}>
                {veiculo.placa}
              </span>
              <span 
                className={`badge px-2.5 py-1.5 fw-bold ${
                  veiculo.status.toLowerCase() === 'ativa' || veiculo.status.toLowerCase() === 'ativo' ? 'bg-success-subtle text-success border border-success-subtle' :
                  veiculo.status.toLowerCase() === 'bloqueada' || veiculo.status.toLowerCase() === 'bloqueado' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                  'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                }`}
                onClick={() => navegarPara('ativacao', veiculo)}
                style={{ cursor: 'pointer' }}
              >
                {veiculo.status} ⚙
              </span>
            </div>

            {/* Linha Central: Número da Tag e Data de Ativação */}
            <div className="row g-2 mb-3" style={{ fontSize: '0.8rem' }}>
              <div className="col-7">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>NÚMERO DA TAG</span>
                <strong className="text-dark fs-6">{veiculo.tag}</strong>
              </div>
              <div className="col-5 text-end">
                <span className="text-muted d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>ATIVAÇÃO</span>
                <span className="text-secondary fw-medium d-block mt-0.5">{veiculo.dataAtivacao}</span>
              </div>
            </div>

            {/* Botão de Ação: Ocupa a largura total do mini-card */}
            <button 
              className="btn btn-white border w-100 btn-sm text-dark fw-semibold py-1.5"
              style={{ fontSize: '0.75rem' }}
              onClick={() => navegarPara('detalhes', veiculo)}
            >
              🔎 Ver Detalhes do Veículo
            </button>

          </div>
        ))}
      </div>


    </div>

  </div>
);


  }


  // -------------------------------------------------------------
  // TELA NUEVA: CADASTRO ÚNICO DE VEÍCULO
  // -------------------------------------------------------------
    // -------------------------------------------------------------
  // SUB-TELA 1: CADASTRO ÚNICO DE VEÍCULO
  // -------------------------------------------------------------
  if (subAba === 'cadastro-unico') {
    return (
<<<<<<< HEAD
      <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
=======
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
        {/* CARD BRANCO PADRÃO */}
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">➕ Cadastrar Novo Veículo</h3>
          <p className="text-muted small mb-4">Preencha os campos abaixo para inserir um veículo individualmente no sistema.</p>
          
          {/* FORMULÁRIO RESPONSIVO COMPACTO */}
          <form style={{ maxWidth: '480px' }} onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Placa:</label>
                <input type="text" placeholder="Ex: ABC-1234" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Número da Tag:</label>
                <input type="text" placeholder="Digite a Tag" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>
            </div>

            {/* BOTÕES COMPACTOS: w-100 no celular e flex-grow-0 no PC */}
            <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
              <button type="submit" className="btn btn-dark btn-sm fw-semibold py-2 px-4 order-1 order-sm-2" onClick={() => { alert('Veículo cadastrado!'); setSubAba('lista'); }}>
                Salvar Veículo
              </button>
              <button type="button" className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => setSubAba('lista')}>
                Cancelar
              </button>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-TELA 2: CADASTRO EM LOTE (UPLOAD)
  // -------------------------------------------------------------
  if (subAba === 'cadastro-lote') {
<<<<<<< HEAD
    return (
      <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">📦 Importar Veículos em Lote</h3>
          <p className="text-muted small mb-4">Faça o upload de um arquivo de planilha (.csv ou .xlsx) contendo as colunas de Placas e Tags.</p>
          
          {/* ZONA DE UPLOAD DISCRETA E ESPAÇADA */}
          <div className="p-4 py-5 text-center bg-light border border-2 border-dashed border-secondary-subtle rounded-3 mb-4">
            <span className="fs-3 d-block mb-2">📥</span>
            <p className="text-secondary small fw-medium m-0">Arraste seu arquivo aqui ou clique para selecionar</p>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
            <button className="btn btn-dark btn-sm fw-semibold py-2 px-4 order-1 order-sm-2" onClick={() => { alert('Planilha processada com sucesso!'); setSubAba('lista'); }}>
              Processar Arquivo
            </button>
            <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => setSubAba('lista')}>
              Cancelar
            </button>
          </div>

=======

    // Diminui o tamanho lateral do
    // className="container my-3 my-md-4 px-3 text-start"
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">📦 Importar Veículos em Lote</h3>
          <p className="text-muted small mb-4">Faça o upload de um arquivo de planilha (.csv ou .xlsx) contendo as colunas de Placas e Tags.</p>
          
          {/* ZONA DE UPLOAD DISCRETA E ESPAÇADA */}
          <div className="p-4 py-5 text-center bg-light border border-2 border-dashed border-secondary-subtle rounded-3 mb-4">
            <span className="fs-3 d-block mb-2">📥</span>
            <p className="text-secondary small fw-medium m-0">Arraste seu arquivo aqui ou clique para selecionar</p>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
            <button className="btn btn-dark btn-sm fw-semibold py-2 px-4 order-1 order-sm-2" onClick={() => { alert('Planilha processada com sucesso!'); setSubAba('lista'); }}>
              Processar Arquivo
            </button>
            <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => setSubAba('lista')}>
              Cancelar
            </button>
          </div>

>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-TELA 3: TELA DE EDIÇÃO
  // -------------------------------------------------------------
  if (subAba === 'editar' && veiculoSelecionado) {
    return (
<<<<<<< HEAD
      <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
=======
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">✏️ Editar Veículo: <span className="text-primary">{veiculoSelecionado.placa}</span></h3>
          <p className="text-muted small mb-4">Utilize o painel abaixo para alterar os dados de identificação deste veículo.</p>
          
          <div className="alert alert-light border py-2 px-3 small text-muted mb-4" role="alert">
            ℹ️ Formulário de alteração de dados do veículo aqui...
          </div>

          <div className="border-top pt-3">
            <button className="btn btn-dark btn-sm fw-semibold py-2 px-4 w-100 w-sm-auto" onClick={() => setSubAba('lista')}>
              Confirmar e Voltar
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-TELA 4: TELA DE ATIVAÇÃO
  // -------------------------------------------------------------
  if (subAba === 'ativacao' && veiculoSelecionado) {
    return (
<<<<<<< HEAD
      <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
=======
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">⚙️ Gerenciar Ativação</h3>
          <p className="text-muted small mb-3">Alteração rápida de status para liberação ou bloqueio de passagem.</p>
          
          <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ maxWidth: '400px' }}>
            <span className="text-secondary fw-semibold small">Veículo: <strong className="text-dark fs-6">{veiculoSelecionado.placa}</strong></span>
            <span className="text-secondary fw-semibold small">Status Atual: <span className="badge bg-secondary px-2 py-1">{veiculoSelecionado.status}</span></span>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
            <button className="btn btn-success btn-sm fw-semibold py-2 px-4 order-1 order-sm-3" onClick={() => alert('Veículo Ativado!')}>Ativar Veículo</button>
            <button className="btn btn-danger btn-sm fw-semibold py-2 px-4 order-2 order-sm-2" onClick={() => alert('Veículo Inativado!')}>Inativar Veículo</button>
            <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-3 order-sm-1" onClick={() => setSubAba('lista')}>Voltar</button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-TELA 5: TELA DE DETALHES
  // -------------------------------------------------------------
    // -------------------------------------------------------------
  // SUB-TELA 5: TELA DE DETALHES COMPACTA COM ESPAÇAMENTO
  // -------------------------------------------------------------
  if (subAba === 'detalhes' && veiculoSelecionado) {
    return (
<<<<<<< HEAD
      <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
=======
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
>>>>>>> 0bfcbc0 (Novo layout, backend e filas)
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">📊 Detalhes Completos: <span className="text-primary">{veiculoSelecionado.placa}</span></h3>
          <p className="text-muted small mb-4">Histórico interno e dados de rastreabilidade da tag vinculada.</p>
          
          {/* LISTA CHAVE-VALOR RECALIBRADA COM ESPAÇAMENTO */}
          {/* MUDANÇA: Retirado o 'list-group' rígido que grudava tudo e usado blocos individuais espaçados com mb-2 */}
          <div className="w-100 mb-4" style={{ maxWidth: "500px" }}>
            
            {/* Bloco 1: Número da Tag */}
            <div className="d-flex justify-content-between align-items-center py-2.5 px-3 border border-light-subtle rounded-3 mb-2 shadow-2xs" style={{ fontSize: '0.85rem', backgroundColor: '#fafafa' }}>
              <strong className="text-secondary text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Número da Tag:</strong>
              <span className="text-dark fw-bold">{veiculoSelecionado.tag}</span>
            </div>

            {/* Bloco 2: Entrada no Sistema */}
            <div className="d-flex justify-content-between align-items-center py-2.5 px-3 border border-light-subtle rounded-3 mb-2 shadow-2xs" style={{ fontSize: '0.85rem', backgroundColor: '#fafafa' }}>
              <strong className="text-secondary text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Entrada no Sistema:</strong>
              <span className="text-dark fw-medium">{veiculoSelecionado.dataAtivacao}</span>
            </div>

          </div>

          <div className="border-top pt-3">
            <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 w-100 w-sm-auto" onClick={() => setSubAba('lista')}>
              Voltar para a Lista
            </button>
          </div>

        </div>
      </div>
    );
  }



  return null;
};
