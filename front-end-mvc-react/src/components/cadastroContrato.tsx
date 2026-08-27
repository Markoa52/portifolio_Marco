import "../styles/CadastroContrato.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

// 1. Tipagem simples para o TypeScript entender o formato da categoria

  export const CadastroContrato: React.FC = () => {
    
  const [listaCorteFat, setListaCorteFat] = useState<any[]>([]);
  const [listaPlanoComer, setListaPlanoComer] = useState<any[]>([]);
  const [listaPlanoPag, setListaPlanoPag] = useState<any[]>([]);

  const [formData, setFormData] = useState({ cnpj: "", nomeEmpresa: "", telefone: "", email: "", numero: "", 
    complemento: "", dataInicio: "", planoComercializadoTipo: "", valorMensalidade: "", valorTag: "", planoPagamentoTipo: "", 
    corteFaturamentoTipo: "", diaFaturamento: "", prazoPagamento: "", resposavelLegalNome: "", diaSemanaCorte: "", limite: ""
  });

  const [formDataCep, setformDataCep] = useState({cepExt: "", ruaExt: "", bairroExt: "", cidadeExt: "", estadoExt: ""});

   // O SEGREDO: Adicionado "| HTMLSelectElement" dentro do ChangeEvent
     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData((prevState) => ({ ...prevState, [name]: String(value) }));
     };

     const handleChangeCep= (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setformDataCep((prevState) => ({ ...prevState, [name]: String(value) }));
     };

   // 1. Função que busca o CEP (Chame ela no blur do input de CEP ou em um botão)
   async function buscarCepAutomatico(cepDigitado: string) {

   if (cepDigitado.replace(/\D/g, '').length !== 8) return; // Só busca se tiver 8 números
  
   try {
    // Substitua pela sua rota real passando o CEP se necessário
    const respostaCep = await axios.get(`http://localhost:3000/api/externa/${cepDigitado}`);
    
    if (respostaCep.data) {
      const dados = respostaCep.data;
      console.log("Mapeando dados da API para o estado do React:", dados);

      // Atualiza o estado do CEP na tela para o usuário ver
        setformDataCep({
        cepExt: dados.cep ?? cepDigitado,
        ruaExt: dados.logradouro ?? "",
        bairroExt: dados.bairro ?? "",
        cidadeExt: dados.localidade ?? "",
        estadoExt: dados.uf ?? ""
      });
    }
   } catch (error) {
    console.error("Erro ao buscar CEP externo:", error);
   }
 }

// 2. Sua função de envio de formulário limpa e focada apenas em despachar
async function enviarDadosCadastroContrato() {
  try {

    // Captura dados do formulário principal
    const { cnpj, nomeEmpresa, telefone, email, resposavelLegalNome, numero, complemento, dataInicio, corteFaturamentoTipo, 
            planoComercializadoTipo, valorMensalidade, valorTag, planoPagamentoTipo, diaFaturamento, diaSemanaCorte, prazoPagamento, limite } = formData;

    // Captura dados do CEP já preenchidos no estado
    const { cepExt, ruaExt, bairroExt, cidadeExt, estadoExt } = formDataCep;

    // Montagem do payload idêntica ao que o seu Worker espera receber
    const payloadEnvio = {
      metadata: {
        protocoloId: `PROT-${Date.now()}`, 
        acao: 'inserir', 
        criadoEm: new Date().toISOString()
      },
      contextoPerson: {
        cnpj: String(cnpj),
        nomeEmpresa: String(nomeEmpresa)
      },
      contextoContato: {
        telefone: String(telefone),
        email: String(email)
      },
      contextoContrato: {
        cnpj: String(cnpj),
        dataInicio: String(dataInicio),
        corteFaturamento: Number(corteFaturamentoTipo),
        planoComercializado: Number(planoComercializadoTipo), 
        valorMensalidade: Number(valorMensalidade),
        valorTag: Number(valorTag),
        planoPagamento: Number(planoPagamentoTipo),
        diaFaturamento: Number(diaFaturamento),
        diaSemana: Number(diaSemanaCorte),
        prazoPagamento: Number(prazoPagamento)
      },
      contextoEndereco: {
        cep: String(cepExt),
        rua: String(ruaExt),
        numero: String(numero),
        bairro: String(bairroExt),
        cidade: String(cidadeExt),
        estado: String(estadoExt),
        complemento: String(complemento),
        documentNumber: String(cnpj)
      },
      contextoResposnsavelLegal: {
        responsavelLegal: String(resposavelLegalNome),
        documentNumber: String(cnpj)
      },
      contextoContaContrato:{
        cnpj: String(cnpj),
        limiteContrato: String(limite)
      }
    };

    console.log(`[Configuração] Despachando nova informação para a fila:`, payloadEnvio);

    // Dispara para a API do Express que gerencia a fila
    const resposta = await axios.post('http://localhost:3000/api/contrato/acoes', payloadEnvio);
    
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
   let ativo = true;

   async function carregarTodosOsCombos() {
    try {
      const resposta = await axios.get("http://localhost:3000/api/configuracao/lookups");
      
      if (ativo && resposta.data) {
        const dados = resposta.data;
        console.log("Mapeando dados da API para o estado do React:", dados);

        // CORREÇÃO INTEGRAL COM BASE NO SEU PRINT:
        // Lemos as chaves exatas (letras minúsculas e maiúsculas idênticas ao backend)
        setListaCorteFat(Array.isArray(dados.corteFaturamento) ? dados.corteFaturamento : []);
        setListaPlanoComer(Array.isArray(dados.planoComercializado) ? dados.planoComercializado : []);
        setListaPlanoPag(Array.isArray(dados.planoPagamento) ? dados.planoPagamento : []);
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

   return (
    // Removido o container gigante de 1200px. Agora ele se adapta ao tamanho do bloco de Atendimento (w-100)
    <div className="w-100 p-2 text-start">
      
      {/* Card principal com bordas mais suaves (rounded-3) e sombra discreta */}
      <div className="card p-3 shadow-sm border border-light-subtle bg-white">
        
        {/* Título mais discreto e alinhado à esquerda para fazer sentido dentro do Atendimento */}
        <div className="border-bottom pb-2 mb-3">
          <h2 className="fs-5 fw-bold text-dark m-0">📄 Incluir Novo Contrato</h2>
        </div>

        {/* GRADE PRINCIPAL DE DUAS COLUNAS */}
        <div className="row g-4">
          
          {/* COLUNA DA ESQUERDA: Dados Cadastrais e Endereço (Ocupa 7 de 12) */}
          <div className="col-md-7 border-end pe-3">
            
            {/* Bloco 1: Dados da Empresa */}
            <div className="mb-4">
             <h4 className="text-primary fw-bold text-start mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em', display: 'block', width: '100%' }}>DADOS DA EMPRESA</h4>
              <div className="row g-2">
                <div className="col-md-4">
                  <input type="text" name="cnpj" placeholder="CNPJ" value={formData.cnpj} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-8">
                  <input type="text" name="nomeEmpresa" placeholder="Nome da Empresa" value={formData.nomeEmpresa}  onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-5">
                  <input type="text" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-7">
                  <input type="email" name="email" placeholder="E-mail corporativo" value={formData.email} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-7">
                  <input type="text" name="resposavelLegalNome" placeholder="Nome do responsavel legal da empresa" value={formData.resposavelLegalNome} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
              </div>
            </div>

            {/* Bloco 2: Endereço */}
            <div>
              <h4 className="text-primary fw-bold text-start mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em', display: 'block', width: '100%' }}>ENDEREÇO DA EMPRESA</h4>
              <div className="row g-2">
                <div className="col-md-3">
                  <input type="text" name="cepExt" placeholder="CEP" value={formDataCep.cepExt} onChange={handleChangeCep}  onBlur={(e) => buscarCepAutomatico(e.target.value)} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-6">
                  <input type="text" name="ruaExt" placeholder="Rua" value={formDataCep.ruaExt} onChange={handleChangeCep} onBlur={(e) => buscarCepAutomatico(e.target.value)} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-3">
                  <input type="text" name="numero" placeholder="Nº" value={formData.numero} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-4">
                  <input type="text" name="bairroExt" placeholder="Bairro" value={formDataCep.bairroExt} onChange={handleChangeCep} onBlur={(e) => buscarCepAutomatico(e.target.value)} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-5">
                  <input type="text" name="cidadeExt" placeholder="Cidade" value={formDataCep.cidadeExt} onChange={handleChangeCep} onBlur={(e) => buscarCepAutomatico(e.target.value)} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-3">
                  <input type="text" name="estadoExt" placeholder="UF" value={formDataCep.estadoExt} onChange={handleChangeCep} onBlur={(e) => buscarCepAutomatico(e.target.value)} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-12">
                  <input type="text" name="complemento" placeholder="Complemento / Referência" value={formData.complemento} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DA DIREITA: Condições Comerciais (Ocupa 5 de 12) */}
          <div className="col-md-5 ps-3 d-flex flex-column justify-content-between">
            
           <div>
           <h4 className="text-primary fw-bold text-start mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em', display: 'block', width: '100%' }}>
             CONDIÇÕES COMERCIAIS
           </h4>
           <div className="row g-2">
    
          {/* Campo 1: Data de Início (Mantido Original) */}
          <div className="col-md-6 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Data de Início</label>
            <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>

          {/* Campo 2: ADAPTADO COMBOBOX - CorteFaturamento (Mapeado da sua rota de lookups) */}
          <div className="col-md-6 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Corte Faturamento</label>
            <select 
            name="corteFaturamentoTipo" 
            value={formData.corteFaturamentoTipo} 
            onChange={handleChange} 
            className="form-select form-input-atendimento"
            >
            <option value="">--- Selecione o Corte ---</option>
            {listaCorteFat?.map((corte: any) => (
             <option key={corte.id || corte.Id} value={corte.id || corte.Id}>
               {corte.descricao || corte.Descricao || corte.description || `Opção ${corte.id || corte.Id}`}
             </option>
             ))}
            </select>
          </div>
          
          {/* RENDERIZAÇÃO CONDICIONAL: O Select abaixo só aparece se o usuário escolheu a opção 'Semanal' (1) */}
          {Number(formData.corteFaturamentoTipo) === 1 && (
            <div className="col-md-6 text-start">
              <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Escolha o dia da semana para o fechamento:</label>
              <select 
                name="diaSemanaCorte" 
                value={formData.diaSemanaCorte} 
                onChange={handleChange}
                className="form-select form-input-atendimento"
              >
                <option value="">--- Selecione o Dia da Semana ---</option>
                <option value="1">Toda Segunda-feira</option>
                <option value="2">Toda Terça-feira</option>
                <option value="3">Toda Quarta-feira</option>
                <option value="4">Toda Quinta-feira</option>
                <option value="5">Toda Sexta-feira</option>
              </select>
            </div>
          )}

          {/* Campo 3: ADAPTADO COMBOBOX - Plano Comercializado */}
          <div className="col-md-6 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Plano Comercializado</label>
            <select 
             name="planoComercializadoTipo" 
             value={formData.planoComercializadoTipo} 
             onChange={handleChange} 
             className="form-select form-input-atendimento"
             >
             <option value="">--- Selecione o Plano ---</option>
             {listaPlanoComer?.map((plano: any) => (
               <option key={plano.id || plano.Id} value={plano.id || plano.Id}>
                 {plano.nome || plano.Nome || plano.descricao || plano.Descricao}
               </option>
             ))}
            </select>
          </div>

          {/* Campo 4: Valor Mensalidade (Mantido Original) */}
          <div className="col-md-6 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Valor Mensalidade (R$)</label>
            <input type="number" name="valorMensalidade" placeholder="Valor Mensalidade (R$)" value={formData.valorMensalidade} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>
      
          {/* Campo 5: Valor da Tag (Mantido Original) */}
          <div className="col-md-6 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Valor da Tag (R$)</label>
            <input type="number" name="valorTag" placeholder="Valor da Tag (R$)" value={formData.valorTag} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>
      
          {/* Campo 6: ADAPTADO COMBOBOX - Plano de Pagamento */}
          <div className="col-md-8 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Plano de Pagamento</label>
            <select 
            name="planoPagamentoTipo" 
            value={formData.planoPagamentoTipo} 
            onChange={handleChange} 
            className="form-select form-input-atendimento"
            >
            <option value="">--- Selecione o Pagamento ---</option>
            {listaPlanoPag?.map((prazo: any) => (
              <option key={prazo.id || prazo.Id} value={prazo.id || prazo.Id}>
                {prazo.descricao || prazo.Descricao || `${prazo.id || prazo.Id} dias`}
              </option>
            ))}
            </select>
          </div>

          {/* Campo 7: Dia de Faturamento (Mantido Original) */}
          <div className="col-md-4 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Dia Faturamento</label>
            <input type="number" name="diaFaturamento" placeholder="Dia Fat." value={formData.diaFaturamento} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>

            <div className="col-md-4 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Praso para  Pagamento</label>
            <input type="number" name="prazoPagamento" placeholder="Prazo Fat." value={formData.prazoPagamento} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>

          <div className="col-md-4 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Limite de utilização</label>
            <input type="number" name="limite" placeholder="Limite Fat." value={formData.limite} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>

          </div>

          </div>

          {/* BOTÃO DE SALVAR COMPACTO NO RODAPÉ DA DIREITA */}
          <div className="pt-3 border-top text-end mt-4">
            <button type="button" onClick={() =>enviarDadosCadastroContrato()}  className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.9rem' }}>
              ➕ Incluir Registro de Contrato
            </button>
          </div>

          </div>
        </div>
      </div>
    </div>
  ); 
};
