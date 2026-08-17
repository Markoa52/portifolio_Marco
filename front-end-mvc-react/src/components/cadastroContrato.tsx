import React, { useState } from "react";
import "../styles/CadastroContrato.css";

export const CadastroContrato: React.FC = () => {
  const [formData, setFormData] = useState({
    cnpj: "", nomeEmpresa: "", telefone: "", email: "",
    cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
    dataInicio: "", planoComercializado: "", valorMensalidade: "", valorTag: "", planoPagamento: "", dataCorteFaturamento: "", diaFaturamento: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

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
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>DADOS DA EMPRESA</h4>
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
              </div>
            </div>

            {/* Bloco 2: Endereço */}
            <div>
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>ENDEREÇO DA EMPRESA</h4>
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
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>CONDIÇÕES COMERCIAIS</h4>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Data de Início</label>
                  <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-6">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Corte Faturamento</label>
                  <input type="date" name="dataCorteFaturamento" value={formData.dataCorteFaturamento} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-12 mt-2">
                  <input type="text" name="planoComercializado" placeholder="Plano Comercializado" value={formData.planoComercializado} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-6">
                  <input type="number" name="valorMensalidade" placeholder="Valor Mensalidade (R$)" value={formData.valorMensalidade} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-6">
                  <input type="number" name="valorTag" placeholder="Valor da Tag (R$)" value={formData.valorTag} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-8">
                  <input type="text" name="planoPagamento" placeholder="Plano de Pagamento" value={formData.planoPagamento} onChange={handleChange} className="form-control form-input-atendimento" />
                </div>
                <div className="col-md-4">
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
