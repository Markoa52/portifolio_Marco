import axios from 'axios';
import React, { useEffect, useState } from 'react';
import type { IPropsFaturas } from '../types/IPropsFaturas';
import type { IVeiculo } from '../types/IVeiculo';
import { toast } from 'react-toastify';

// Atualizamos as opções de sub-telas da frota com os novos cadastros
type SubAbaFrota = 'lista' | 'editar' | 'ativacao' | 'detalhes' | 'cadastro-unico' | 'cadastro-lote';


// const VEICULOS_MOCK: IVeiculo[] = [
//   { placa: 'ABC-1234', tag: 'TAG-99812', status: 'Ativo', dataAtivacao: '12/01/2025' },
//   { placa: 'XYZ-5678', tag: 'TAG-44321', status: 'Inativo', dataAtivacao: '20/03/2025' },
//   { placa: 'KGB-0077', tag: 'TAG-11223', status: 'Manutenção', dataAtivacao: '05/06/2025' },
// ];

export const ListarFrota: React.FC<IPropsFaturas> = ({contractId}) => {
  const [resultadoLote, setResultadoLote] = useState<any>(null);

  const [subAba, setSubAba] = useState<SubAbaFrota>('lista');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<IVeiculo | null>(null);
  const [veiculoCriado, setveiculoCriado] = useState<any[]>([]);

  // DEVE FICAR NO TOPO DO SEU COMPONENTE PAI (Junto com os outros useStates):
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
    const [linhasPlanilha, setLinhasPlanilha] = useState<any[]>([]);
  
    const [formData, setFormData] = useState({ placa: "", marca: "", modelo: "", tipoveiculo: "", eixo: "", rntc: "", documento: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: String(value) }));
    };

   // ADICIONE o parâmetro opcional 'dadosLote' no final da assinatura
async function enviarDadosCadastroVeiculo(acao: string, tipoAcao: string, dadosLote?: any) {
  try {
    let payloadEnvio: any;

    // CENÁRIO A: Importação em lote (Veio da planilha)
    if (dadosLote && Array.isArray(dadosLote)) {
      payloadEnvio = dadosLote.map((linha: any, index: number) => {
        const placaBruta = linha.Placa || linha.placa || '';
        return {
          metadata: {
            protocoloId: `PROT-IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}-${index}`,
            acao: acao,
            criadoEm: new Date(),
            contratoId: Number(contractId)
          },
          contextoVeiculo: {
            placa: String(placaBruta).toUpperCase().trim(),
            marca: String(linha.Marca || linha.marca || 'Não informado').trim(),
            modelo: String(linha.Modelo || linha.modelo || 'Não informado').trim(),
            tipoveiculo: String(linha.Tipo || linha.tipo || 'Não informado').trim(),
            eixo: String(linha.Eixo || linha.eixo || '0'),
            rntc: String(linha.RNTC || linha.rntc || ''),
            documento: String(linha.Documento || linha.documento || '')
          }
        };
      }).filter(p => p.contextoVeiculo.placa !== '');
    } 
    // CENÁRIO B: Cadastro unitário tradicional (Formulário manual)
    else {
      const { placa, marca, modelo, tipoveiculo, eixo, rntc, documento } = formData;
      
      payloadEnvio = {
        metadata: {
          protocoloId: `PROT-${Date.now()}`,
          acao: acao,
          criadoEm: new Date(),
          contratoId: Number(contractId)
        },
        contextoVeiculo: {
          placa: String(placa).toUpperCase().trim(), // Força maiúsculas antes do envio
          marca: String(marca),
          modelo: String(modelo),
          tipoveiculo: String(tipoveiculo),
          eixo: String(eixo),
          rntc: String(rntc),
          documento: String(documento)
        }
      };
    }

    // Faz a requisição unificada para o mesmo endpoint
    const resposta = await axios.post('http://localhost:3000/api/veiculo/acoes', payloadEnvio);

    if (resposta.status === 200 || resposta.data?.sucesso) {
      if (Array.isArray(payloadEnvio)) {
        // GUARDA O RELATÓRIO DO BACKEND NA MEMÓRIA DO REACT
        setResultadoLote(resposta.data.resumo);
        toast.success("Planilha processada! Veja o resumo abaixo.");
      } else {
        toast.success(`Veículo integrado à fila!\nProtocolo: ${payloadEnvio.metadata.protocoloId}`);
        setSubAba('lista');
      }
    }

  } catch (error: any) {
    // INTERCEÇÃO DO ERRO 400 (Placa existente)
    // O Axios guarda a resposta do servidor em error.response.data
    const mensagemErroServidor = error.response?.data?.erro;

    if (error.response?.status === 400 && mensagemErroServidor) {
      // Exibe a mensagem exata de duplicidade enviada pelo banco de dados SQLite
      toast.error(`${mensagemErroServidor}`);
    } else {
      // Fallback genérico para erros de rede, queda de servidor ou erro 500
      console.error("Erro na comunicação com a API de veículos:", error);
      toast.error("Falha na comunicação com o servidor. Tente novamente mais tarde.");
    }
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

   // Função interna para ler o arquivo Excel/CSV e carregar no estado 'linhasPlanilha'
  const handleSelecionarArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const arquivo = e.target.files[0];

  try {
    const xlsx = await import('xlsx');
    const reader = new FileReader();

    reader.onload = (evt) => {
      const dadosBinarios = evt.target?.result;
      
      // ADICIONADO: 'raw: false' ajuda a processar datas e textos do Excel de forma mais amigável
      const workbook = xlsx.read(dadosBinarios, { type: 'binary', raw: false });
      const primeiraAba = workbook.SheetNames[0]; 
      
      // EVITA CRASH: Se o Excel veio com ponto e vírgula (comum em CSVs de Excel), o leitor adapta-se
      const linhasJson = xlsx.utils.sheet_to_json(workbook.Sheets[primeiraAba], {
        defval: "" // Preenche células vazias com "" em vez de deletar a propriedade
      });

      console.log("[Debug Leitor] Array gerado pelo leitor do arquivo:", linhasJson);
      
      setLinhasPlanilha(linhasJson);
    };

    reader.readAsBinaryString(arquivo);
  } catch (error) {
    console.error("Erro ao ler o arquivo de planilha:", error);
    alert("Não foi possível ler o arquivo. Verifique se o formato está correto.");
  }
};

const exportarParaCSV = (nomeArquivo: string, cabecalhos: string[], dados: any[]) => {
  // 1. Monta a primeira linha com os cabeçalhos separados por ponto e vírgula
  const linhasDoArquivo = [cabecalhos.join(";")];

  // 2. Transforma cada objeto de dados numa linha separada por ponto e vírgula
  dados.forEach((item) => {
    // MAPEAMENTO DINÂMICO: Garante que lê as chaves exatas passadas no cabeçalho
    const linha = cabecalhos.map(chave => {
      const valor = item[chave] !== undefined && item[chave] !== null ? item[chave] : '';
      // Se o valor contiver ponto e vírgula ou quebra de linha, envolve em aspas para não quebrar o CSV
      return String(valor).includes(";") ? `"${valor}"` : String(valor);
    });
    linhasDoArquivo.push(linha.join(";"));
  });

  // 3. Junta todas as linhas com a quebra de página (\n)
  const conteudoCSV = linhasDoArquivo.join("\n");

  // MOTOR DE DOWNLOAD ORIGINAL (Exatamente o que você já fez)
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), conteudoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${nomeArquivo}.csv`);
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


const handleBaixarModeloCSV = () => {
  const cabecalhos = ["placa", "marca", "modelo", "tipo", "eixo", "rntc", "documento"];
  const exemplo = [{
    placa: "ABC1234", marca: "Fiat", modelo: "Fiorino 2.0", 
    tipo: "Furgão", eixo: "2 eixos", rntc: "123456", documento: "999999999"
  }];

  // Chama a função global
  exportarParaCSV("modelo_importacao_veiculos", cabecalhos, exemplo);
};

const handleExportarTodosVeiculos = async () => {
  const cabecalhos = ["placa", "marca", "modelo", "tipoveiculo", "eixo"];

  const respostaVeiculos = await axios.get(`http://localhost:3000/api/veiculo/${contractId}`)
  setveiculoCriado(Array.isArray(respostaVeiculos.data) ? respostaVeiculos.data : [respostaVeiculos.data]);
  
  // dadosLocais ou usuarios é a sua lista que popula a tabela principal
  exportarParaCSV("relatorio_geral_veiculos", cabecalhos, respostaVeiculos.data);
};

 const handleExportarErrosLote = () => {
   if (!resultadoLote || !resultadoLote.erros || resultadoLote.erros.length === 0) return;
   
   // Define os cabeçalhos das colunas do relatório de falhas
   const cabecalhos = ["placa", "modelo", "motivo"];
   
   // Dispara o motor genérico que criámos
   exportarParaCSV("veiculos_rejeitados_duplicidade", cabecalhos, resultadoLote.erros);
 };

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
          onClick={handleExportarTodosVeiculos}
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
              <button type="submit" className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => {enviarDadosCadastroVeiculo('inserir','cadastroUnico'); setSubAba('lista'); }}>
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
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }} className="text-start">
      
      {/* ➡️ SE JÁ HOUVER UM RESULTADO NA MEMÓRIA, MOSTRA O PAINEL DE RESUMO */}
      {resultadoLote ? (
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          <h3 className="fs-5 fw-bold text-dark mb-1">📊 Relatório de Importação em Lote</h3>
          <p className="text-muted small mb-4">O processamento da sua planilha terminou. Abaixo estão os detalhes consolidado das integrações:</p>

          {/* INDICADORES EM CAIXAS */}
          <div className="row g-3 mb-4 text-center">
            <div className="col-md-4">
              <div className="p-3 bg-light rounded-3 border border-light-subtle">
                <span className="text-muted small d-block mb-1 fw-semibold text-uppercase">Lidos na Planilha</span>
                <span className="fw-bold text-dark fs-4">{resultadoLote.totalGeral}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle">
                <span className="text-success small d-block mb-1 fw-semibold text-uppercase">Enviados para Fila</span>
                <span className="fw-bold text-success fs-4">✅ {resultadoLote.totalSucesso}</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-danger-subtle rounded-3 border border-danger-subtle">
                <span className="text-danger small d-block mb-1 fw-semibold text-uppercase">Rejeitados (Duplicados)</span>
                <span className="fw-bold text-danger fs-4">⚠️ {resultadoLote.totalErro}</span>
              </div>
            </div>
          </div>

          {/* TABELA DE ERROS (SÓ APARECE SE HOUVER ALGUM ERRO) */}
          {resultadoLote.erros.length > 0 && (
           <div className="mb-4">
             
             {/* 💡 CABEÇALHO DA TABELA COM O BOTÃO DE EXPORTAÇÃO ALINHADO LADO A LADO */}
             <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2 text-start">
               <h4 className="fs-6 fw-bold text-danger m-0">
                 ❌ Itens Não Importados (Placas Repetidas)
               </h4>
               
               {/* 🚀 BOTÃO DE EXPORTAÇÃO DO CENÁRIO B ADICIONADO AQUI */}
               <button
                 type="button"
                 className="btn btn-outline-danger btn-sm fw-semibold d-inline-flex align-items-center gap-1 py-1.5 px-3"
                 style={{ fontSize: '0.8rem' }}
                 onClick={handleExportarErrosLote}
               >
                 📥 Exportar Erros (.csv)
               </button>
             </div>
         
             {/* Estrutura da tabela existente (Mantém igual) */}
             <div className="table-responsive rounded-3 border" style={{ maxHeight: "200px" }}>
               <table className="table table-sm table-hover align-middle m-0 small">
                 <thead className="table-danger sticky-top">
                   <tr>
                     <th className="px-3 py-2">Placa</th>
                     <th className="py-2">Modelo</th>
                     <th className="py-2 px-3 text-end">Motivo da Rejeição</th>
                   </tr>
                 </thead>
                 <tbody>
                   {resultadoLote.erros.map((item: any, idx: number) => (
                     <tr key={idx}>
                       <td className="px-3 py-2 fw-bold text-dark">{item.placa}</td>
                       <td className="text-secondary">{item.modelo}</td>
                       <td className="text-danger px-3 text-end fw-medium">{item.motivo}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
         
           </div>
         )}

          {/* TABELA DE SUCESSOS */}
          {resultadoLote.sucesses?.length > 0 && (
            <div className="mb-4">
              <h4 className="fs-6 fw-bold text-success mb-2">✅ Itens Enviados com Sucesso</h4>
              <div className="table-responsive rounded-3 border" style={{ maxHeight: "200px" }}>
                <table className="table table-sm table-hover align-middle m-0 small">
                  <thead className="table-success sticky-top">
                    <tr>
                      <th className="px-3 py-2">Placa</th>
                      <th className="py-2">Modelo</th>
                      <th className="py-2 px-3 text-end">Protocolo da Fila</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultadoLote.sucessos.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 fw-bold text-dark">{item.placa}</td>
                        <td className="text-secondary">{item.modelo}</td>
                        <td className="text-muted px-3 text-end font-monospace" style={{ fontSize: "0.75rem" }}>{item.protocolo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOTÃO PARA VOLTAR OU FAZER NOVA IMPORTAÇÃO */}
          <div className="d-flex justify-content-md-end border-top pt-3">
            <button 
              type="button" 
              className="btn btn-dark fw-semibold px-4" 
              onClick={() => {
                setResultadoLote(null); // Reseta a memória do relatório
                setLinhasPlanilha([]);  // Limpa os dados lidos
                setSubAba('lista');     // Volta para a tabela geral de veículos
              }}
            >
              Concluir e Voltar para Lista
            </button>
          </div>
        </div>

      ) : (

        // ➡️ CASO CONTRÁRIO, EXIBE A TELA DE UPLOAD TRADICIONAL QUE JÁ MONTÁMOS
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          <h3 className="fs-5 fw-bold text-dark mb-1">📦 Importar Veículos em Lote</h3>
          <p className="text-muted small mb-1">Faça o upload de um arquivo de planilha (.csv) contendo as colunas de Placas e Tags.</p>
          
          <p className="mb-4">
            <button type="button" className="btn btn-link p-0 small fw-semibold text-primary text-decoration-none d-inline-flex align-items-center gap-1" onClick={handleBaixarModeloCSV}>
              📋 Clique aqui para descarregar o modelo de planilha padrão (.csv)
            </button>
          </p>
          
          <input type="file" id="input-arquivo-excel" accept=".xlsx, .xls, .csv" className="d-none" onChange={handleSelecionarArquivo} />

          <label htmlFor="input-arquivo-excel" className="p-4 py-5 text-center bg-light border border-2 border-dashed border-secondary-subtle rounded-3 mb-4 d-block" style={{ cursor: 'pointer' }}>
            <span className="fs-3 d-block mb-2">📥</span>
            <p className="text-secondary small fw-medium m-0">
              {linhasPlanilha && linhasPlanilha.length > 0 
                ? `✅ Planilha carregada! ${linhasPlanilha.length} linhas encontradas.` 
                : 'Clique aqui para selecionar o arquivo de planilha'}
            </p>
          </label>

          <div className="d-flex flex-column flex-sm-row gap-2 border-top pt-3">
            <button 
              type="submit" 
              className="btn btn-dark btn-sm fw-semibold py-2 px-4 order-1" 
              disabled={!linhasPlanilha || linhasPlanilha.length === 0} 
              onClick={() => enviarDadosCadastroVeiculo('inserir', 'cadastroLote', linhasPlanilha)} 
            > 
              Processar Arquivo 
            </button>
            <button className="btn btn-light border btn-sm text-secondary fw-semibold py-2 px-4 order-2 order-sm-1" onClick={() => setSubAba('lista')}>
              Cancelar
            </button>
          </div>
        </div>
      )}

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
