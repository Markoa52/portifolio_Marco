import axios from 'axios';
import React, { useEffect, useState } from 'react';
import type { IPropsFaturas } from '../types/IPropsFaturas';
import type { IVeiculo } from '../types/IVeiculo';

// Atualizamos as opções de sub-telas da frota com os novos cadastros
type SubAbaFrota = 'lista' | 'editar' | 'ativacao' | 'detalhes' | 'cadastro-unico' | 'cadastro-lote';


// const VEICULOS_MOCK: IVeiculo[] = [
//   { placa: 'ABC-1234', tag: 'TAG-99812', status: 'Ativo', dataAtivacao: '12/01/2025' },
//   { placa: 'XYZ-5678', tag: 'TAG-44321', status: 'Inativo', dataAtivacao: '20/03/2025' },
//   { placa: 'KGB-0077', tag: 'TAG-11223', status: 'Manutenção', dataAtivacao: '05/06/2025' },
// ];

export const ListarFrota: React.FC<IPropsFaturas> = ({contractId}) => {
  const [subAba, setSubAba] = useState<SubAbaFrota>('lista');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<IVeiculo | null>(null);
  const [veiculoCriado, setveiculoCriado] = useState<any[]>([]);

  // 💡 DEVE FICAR NO TOPO DO SEU COMPONENTE PAI (Junto com os outros useStates):
const [tagsEstoque] = useState<any[]>([
  // Dados simulados para você testar visualmente agora mesmo:
  { id: 1, numeroSerie: "TAG-9981", modeloFabricante: "ConectCar RFID Standard" },
  { id: 2, numeroSerie: "TAG-9982", modeloFabricante: "Sem Parar Slim" },
  { id: 3, numeroSerie: "TAG-9983", modeloFabricante: "Veloe Track Pro" }
]);
const [tagSelecionada, setTagSelecionada] = useState<any>(null);

  const navegarPara = (tela: SubAbaFrota, veiculo: IVeiculo | null) => {
    setVeiculoSelecionado(veiculo);
    setSubAba(tela);
  };

    const [listaMarcaVeiculo, setlistaMarcaVeiculo] = useState<any[]>([]);
    const [listaTipoVeiculo, setlistaTipoVeiculo] = useState<any[]>([]);
    const [listaEixoVeiculo, setlistaEixoVeiculo] = useState<any[]>([]);
  
    const [formData, setFormData] = useState({ placa: "", marca: "", modelo: "", tipoveiculo: "", eixo: "", rntc: "", documento: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: String(value) }));
    };

   async function enviarDadosCadastroVeiculo() {
   try {

    // Captura dados do formulário principal
    const { placa, marca, modelo, tipoveiculo, eixo, rntc, documento } = formData;

    // Montagem do payload idêntica ao que o seu Worker espera receber
    const payloadEnvio = {
      metadata: {
        protocoloId: `PROT-${Date.now()}`, 
        acao: 'inserir', 
        criadoEm: new Date(),
        contratoId: Number(contractId)
      },
      contextoVeiculo: {
        placa: String(placa),
        marca: String(marca),
        modelo: String(modelo),
        tipoveiculo: String(tipoveiculo),
        eixo: String(eixo),
        rntc: String(rntc),
        documento: String(documento)
      }
    };

    console.log(`[Configuração] Despachando nova informação para a fila:`, payloadEnvio);

    // Dispara para a API do Express que gerencia a fila
    const resposta = await axios.post('http://localhost:3000/api/veiculo/acoes', payloadEnvio);
    
    // Verifica se a API aceitou a mensagem
    if (resposta.status === 200 || resposta.status === 202 || resposta.data?.sucesso) {
      alert(`Sucesso! Parâmetros enviados para a fila.\nProtocolo: ${payloadEnvio.metadata.protocoloId}`);
    }

  } catch (error) {
    console.error("Erro ao enviar dados para a API/Fila:", error);
    alert("Falha ao processar o cadastro do contrato. Verifique o console.");
  }
}

useEffect(() => {

  if (!contractId) return;

   let ativo = true;

   async function carregarTodosOsCombos() {
    try {
      const resposta = await axios.get("http://localhost:3000/api/veiculo/lookups");
      
      if (ativo && resposta.data) {
        const dados = resposta.data;
        console.log("Mapeando dados da API para o estado do React:", dados);

        // CORREÇÃO INTEGRAL COM BASE NO SEU PRINT:
        // Lemos as chaves exatas (letras minúsculas e maiúsculas idênticas ao backend)
        setlistaMarcaVeiculo(Array.isArray(dados.marca) ? dados.marca : []);
        setlistaTipoVeiculo(Array.isArray(dados.veiculoTipo) ? dados.veiculoTipo : []);
        setlistaEixoVeiculo(Array.isArray(dados.eixo) ? dados.eixo : []);

        const respostaVeiculos = await axios.get(`http://localhost:3000/api/veiculo/${contractId}`)

        setveiculoCriado(Array.isArray(respostaVeiculos.data) ? respostaVeiculos.data : [respostaVeiculos.data]);
        } else {
          setveiculoCriado([]);
        }
        
      } catch (error) {
      console.error("Erro ao carregar dicionários:", error);
      }
    }
  
    carregarTodosOsCombos();

    return () => {
    ativo = false;
    };
   }, []);

    // -------------------------------------------------------------
  // TELA 1: LISTAGEM DA FROTA (TABELA COM O BOTÃO EXPORTAR INCLUÍDO)
  // -------------------------------------------------------------
  if (subAba === 'lista') {
     return (
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
            {veiculoCriado.map((veiculo) => (
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
                      veiculo?.status?.toLowerCase() === 'ativa' || veiculo?.status?.toLowerCase() === 'ativo' ? 'bg-success-subtle text-success border border-success-subtle' :
                      veiculo?.status?.toLowerCase() === 'bloqueada' || veiculo?.status?.toLowerCase() === 'bloqueado' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                      'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                    }`}
                    onClick={() => navegarPara('ativacao', veiculo)}
                    style={{ cursor: 'pointer' }}
                  >
                    {veiculo?.status || 'Inativo'} ⚙
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
        {veiculoCriado.map((veiculo) => (
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
);}


  // -------------------------------------------------------------
  // TELA NUEVA: CADASTRO ÚNICO DE VEÍCULO
  // -------------------------------------------------------------
    // -------------------------------------------------------------
  // SUB-TELA 1: CADASTRO ÚNICO DE VEÍCULO
  // -------------------------------------------------------------
  if (subAba === 'cadastro-unico') {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* CARD BRANCO PADRÃO */}
        <div className="card p-3 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          
          <h3 className="fs-5 fw-bold text-dark mb-1">➕ Cadastrar Novo Veículo</h3>
          <p className="text-muted small mb-4">Preencha os campos abaixo para inserir um veículo individualmente no sistema.</p>
          
          {/* FORMULÁRIO RESPONSIVO COMPACTO */}
          <form style={{ maxWidth: '480px' }} onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Placa</label>
                <input value={formData.placa} onChange={handleChange} name="placa" type="text" placeholder="Ex: ABC-1234" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>

              {/* Campo 2: ADAPTADO COMBOBOX - CorteFaturamento (Mapeado da sua rota de lookups) */}
              <div className="col-md-6 text-start">
                <label className="form-label small fw-bold text-secondary mb-1">Marca</label>
                <select name="marca"
                value={formData.marca} 
                onChange={handleChange} 
                className="form-select form-input-atendimento"
                >
                <option value="">--- Selecione a marca ---</option>
                {listaMarcaVeiculo?.map((marca: any) => (
                 <option key={marca.id || marca.Id} value={marca.id || marca.Id}>
                   {marca.descricao || marca.Descricao || marca.description || `Opção ${marca.id || marca.Id}`}
                 </option>
                 ))}
                </select>
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Modelo</label>
                <input value={formData.modelo} onChange={handleChange} name="modelo" type="text" placeholder="Digite a Tag" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>

              {/* Campo 2: ADAPTADO COMBOBOX - CorteFaturamento (Mapeado da sua rota de lookups) */}
              <div className="col-md-6 text-start">
                <label className="form-label small fw-bold text-secondary mb-1">Tipo do veículo</label>
                <select name="tipoveiculo"
                value={formData.tipoveiculo} 
                onChange={handleChange} 
                className="form-select form-input-atendimento"
                >
                <option value="">--- Selecione o tipo do veiculo ---</option>
                {listaTipoVeiculo?.map((tipoveiculo: any) => (
                 <option key={tipoveiculo.id || tipoveiculo.Id} value={tipoveiculo.id || tipoveiculo.Id}>
                   {tipoveiculo.descricao || tipoveiculo.Descricao || tipoveiculo.description || `Opção ${tipoveiculo.id || tipoveiculo.Id}`}
                 </option>
                 ))}
                </select>
              </div>

              {/* Campo 2: ADAPTADO COMBOBOX - CorteFaturamento (Mapeado da sua rota de lookups) */}
              <div className="col-md-6 text-start">
                <label className="form-label small fw-bold text-secondary mb-1">Eixo</label>
                <select name="eixo"
                value={formData.eixo} 
                onChange={handleChange} 
                className="form-select form-input-atendimento"
                >
                <option value="">--- Selecione a eixo ---</option>
                {listaEixoVeiculo?.map((eixo: any) => (
                 <option key={eixo.id || eixo.Id} value={eixo.id || eixo.Id}>
                   {eixo.descricao || eixo.Descricao || eixo.description || `Opção ${eixo.id || eixo.Id}`}
                 </option>
                 ))}
                </select>
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Rntc</label>
                <input value={formData.rntc} onChange={handleChange} name="rntc" type="text" placeholder="Digite a Tag" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>

              <div className="col-12 col-sm-6">
                <label className="form-label small fw-bold text-secondary mb-1">Documento</label>
                <input value={formData.documento} onChange={handleChange} name="documento" type="text" placeholder="Digite a Tag" className="form-control" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} />
              </div>

            </div> 

            {/* BOTÕES COMPACTOS: w-100 no celular e flex-grow-0 no PC */}
            <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
              <button type="submit" className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => {enviarDadosCadastroVeiculo(); setSubAba('lista'); }}>
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

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-TELA 3: TELA DE EDIÇÃO
  // -------------------------------------------------------------
  if (subAba === 'editar' && veiculoSelecionado) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
    // -------------------------------------------------------------
  // SUB-TELA 4: TELA DE ATIVAÇÃO COM ESTOQUE DE TAGS INTEGRADO
  // -------------------------------------------------------------
  if (subAba === 'ativacao' && veiculoSelecionado?.contratoId) {

    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="text-start">
        <div className="row g-4 m-0">
          
          {/* COLUNA ESQUERDA: INFORMAÇÕES DO VEÍCULO E BOTÕES DE AÇÃO */}
          <div className="col-12 col-md-6 p-0 pe-md-3">
            <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 h-100 d-flex flex-column justify-content-between">
              <div>
                <h3 className="fs-5 fw-bold text-dark mb-1">⚙️ Gerenciar Ativação</h3>
                <p className="text-muted small mb-1">Vincule um dispositivo físico disponível em seu estoque para ativar a frota.</p>
                
                {/* Detalhes do Carro */}
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <span className="text-muted small d-block uppercase fw-bold" style={{ fontSize: '0.65rem' }}>VEÍCULO SELECIONADO</span>
                  <div className="d-flex justify-content-between align-items-center mt-1.5">
                    <span className="font-monospace fw-bold bg-dark text-white px-2 py-0.5 rounded border border-secondary" style={{ fontSize: '0.8rem' }}>
                      {veiculoSelecionado.placa}
                    </span>
                    <span className={`badge px-2.5 py-1.5 fw-bold ${
                      veiculoSelecionado.status === 'Ativo' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'
                    }`}>
                      {veiculoSelecionado.status?.toUpperCase()}
                    </span>
                  </div>
                  <strong className="text-dark d-block mt-2 small">{veiculoSelecionado.modelo || "Modelo não informado"}</strong>
                </div>

                {/* TAG que o operador escolheu da lista ao lado */}
                <div className="p-3 rounded-3 border mb-3 text-start bg-white">
                  <span className="text-muted small d-block uppercase fw-bold" style={{ fontSize: '0.65rem' }}>DISPOSITIVO A VINCULAR</span>
                  {tagSelecionada ? (
                    <div className="d-flex align-items-center gap-2 mt-2 text-primary fw-bold font-monospace fs-6">
                      🏷️ {tagSelecionada.numeroSerie || tagSelecionada.epc}
                    </div>
                  ) : (
                    <div className="text-muted small mt-2 italic text-secondary">
                      ⚠️ Selecione uma TAG disponível na grade ao lado...
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Escape e Ação */}
              <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3 mt-4">
                <button 
                  className="btn btn-success btn-sm fw-semibold py-2 px-4 order-1 order-sm-3" 
                  disabled={!tagSelecionada || veiculoSelecionado.status === 'Ativo'}
                  onClick={() => alert(`Tag ${tagSelecionada.numeroSerie} vinculada ao veículo ${veiculoSelecionado.placa}!`)}
                >
                  Confirmar Vínculo e Ativar
                </button>
                <button 
                  className="btn btn-danger btn-sm fw-semibold py-2 px-4 order-2 order-sm-2"
                  disabled={veiculoSelecionado.status !== 'Ativo'}
                  onClick={() => alert('Veículo Inativado!')}
                >
                  Bloquear/Inativar
                </button>
                <button 
                  className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-3 order-sm-1" 
                  onClick={() => { setSubAba('lista'); setTagSelecionada(null); }}
                >
                  Voltar
                </button>
              </div>

            </div>
          </div>

          {/* COLUNA DIREITA: LISTAGEM DE TAGS DISPONÍVEIS NO ESTOQUE */}
          <div className="col-12 col-md-6 p-0 ps-md-2">
            <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 h-100">
              <h4 className="fs-6 fw-bold text-dark mb-1">🏷️ TAGs Disponíveis em Estoque</h4>
              <p className="text-muted small mb-1">Dispositivos RFID em posse do cliente prontos para homologação.</p>

              {tagsEstoque && tagsEstoque.length > 0 ? (
                /* Lista Rolável Inteligente */
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {tagsEstoque.map((tag: any) => (
                    <div
                      key={tag.id}
                      onClick={() => setTagSelecionada(tag)}
                      className="p-2.5 rounded-3 border text-start d-flex justify-content-between align-items-center transition-all"
                      style={{
                        cursor: 'pointer',
                        backgroundColor: tagSelecionada?.id === tag.id ? '#eef2ff' : '#ffffff',
                        borderLeft: tagSelecionada?.id === tag.id ? '4px solid #4f46e5' : '1px solid #dee2e6'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-secondary" style={{ fontSize: '1rem' }}>🏷️</span>
                        <div>
                          <strong className="text-dark font-monospace" style={{ fontSize: '0.85rem' }}>{tag.numeroSerie}</strong>
                          <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>Fabricante: {tag.modeloFabricante || "RFID Standard"}</small>
                        </div>
                      </div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: '0.65rem' }}>
                        EM ESTOQUE
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Estado Vazio de Estoque */
                <div className="text-center py-5 text-muted border border-dashed rounded-3 bg-light my-auto">
                  <span className="d-block fs-4 mb-1">📦</span>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>Estoque Zerado</h6>
                  <p className="text-muted mb-0 mx-auto small" style={{ maxWidth: '280px' }}>Este cliente não possui dispositivos avulsos. Solicite novas TAGs no painel comercial.</p>
                </div>
              )}
            </div>
          </div>

        </div> {/* Fecha row */}
      </div> /* Fecha container */
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
