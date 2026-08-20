import "../styles/CadastroContrato.css";
import React, { useState, useEffect } from "react";
import axios from "axios";

// 1. Tipagem simples para o TypeScript entender o formato da categoria

  export const CadastroContrato: React.FC = () => {

  const [listaCorteFat, setListaCorteFat] = useState<any[]>([]);
  const [listaPlanoComer, setListaPlanoComer] = useState<any[]>([]);
  const [listaPlanoPag, setListaPlanoPag] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    cnpj: "", nomeEmpresa: "", telefone: "", email: "",
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
    dataInicio: "", planoComercializado: "", valorMensalidade: "", valorTag: "", planoPagamento: "", dataCorteFaturamento: "", diaFaturamento: "",
  });

   // O SEGREDO: Adicionado "| HTMLSelectElement" dentro do ChangeEvent
   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData((prevState) => ({ ...prevState, [name]: value }));
   };

   useEffect(() => {
   let ativo = true;

   async function carregarTodosOsCombos() {
    try {
      const resposta = await axios.get("http://localhost:3000/api/configuracao/lookups");
      
      if (ativo && resposta.data) {
        const dados = resposta.data;
        console.log("Mapeando dados da API para o estado do React:", dados);

        // 🔥 CORREÇÃO INTEGRAL COM BASE NO SEU PRINT:
        // Lemos as chaves exatas (letras minúsculas e maiúsculas idênticas ao backend)
        setListaCorteFat(Array.isArray(dados.corteFaturamento) ? dados.corteFaturamento : []);
        setListaPlanoComer(Array.isArray(dados.planoComercializacao) ? dados.planoComercializacao : []);
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
                  <input type="text" name="nomeEmpresa" placeholder="Nome da Empresa" value={formData.nomeEmpresa} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-5">
                  <input type="text" name="telefone" placeholder="Telefone" value={formData.telefone} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-7">
                  <input type="email" name="email" placeholder="E-mail corporativo" value={formData.email} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-7">
                  <input type="text" name="reposavelLegal" placeholder="Nome do responsavel legal da empresa" value={formData.email} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
              </div>
            </div>

            {/* Bloco 2: Endereço */}
            <div>
              <h4 className="text-primary fw-bold text-start mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em', display: 'block', width: '100%' }}>ENDEREÇO DA EMPRESA</h4>
              <div className="row g-2">
                <div className="col-md-3">
                  <input type="text" name="cep" placeholder="CEP" value={formData.cep} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-6">
                  <input type="text" name="rua" placeholder="Rua" value={formData.rua} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-3">
                  <input type="text" name="numero" placeholder="Nº" value={formData.numero} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-4">
                  <input type="text" name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-5">
                  <input type="text" name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-3">
                  <input type="text" name="estado" placeholder="UF" value={formData.estado} onChange={handleChange} className="form-control form-input-atendimento" />
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
            name="dataCorteFaturamento" 
            value={formData.dataCorteFaturamento} 
            onChange={handleChange} 
            className="form-select form-input-atendimento"
            >
            <option value="">--- Selecione o Corte ---</option>
            {listaCorteFat?.map((corte: any) => (
             <option key={corte.id || corte.Id || corte.vehicleCategoryId} value={corte.id || corte.Id || corte.vehicleCategoryId}>
               {corte.descricao || corte.Descricao || corte.description || `Opção ${corte.id || corte.Id}`}
             </option>
             ))}
            </select>
          </div>

          {/* Campo 3: ADAPTADO COMBOBOX - Plano Comercializado */}
          <div className="col-md-12 mt-2 text-start">
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Plano Comercializado</label>
            <select 
             name="planoComercializado" 
             value={formData.planoComercializado} 
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
            name="planoPagamento" 
            value={formData.planoPagamento} 
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
            <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Dia Fat.</label>
            <input type="number" name="diaFaturamento" placeholder="Dia Fat." value={formData.diaFaturamento} onChange={handleChange} className="form-control form-input-atendimento" />
          </div>

          </div>

          </div>

          {/* BOTÃO DE SALVAR COMPACTO NO RODAPÉ DA DIREITA */}
          <div className="pt-3 border-top text-end mt-4">
            <button type="button" className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.9rem' }}>
              ➕ Incluir Registro de Contrato
            </button>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};
