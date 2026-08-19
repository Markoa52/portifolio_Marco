import React, { useState } from "react";
import "../styles/CadastroContrato.css"; // Reaproveita as classes de foco e estilos dos inputs

export const ConfiguracaoSistema: React.FC = () => {
  // 1. DECLARAÇÃO DOS ESTADOS (Garante o funcionamento do 'value={configData...}')
  const [configData, setConfigData] = useState({
    vehicleTypeId: 1,
    vehicleBrandTypeId: 1,
    model: 2026,
    axleWheelType: 2,
    vehicleCategoryId: 1,
    contractVehicleTagServiceTypeId: 1,
    contractVehicleTagStatusType: 1,
  });

  // 2. FUNÇÃO PARA OS SELECTS (Garante o funcionamento do 'onChange={handleSelectChange}')
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfigData((prevState) => ({ 
      ...prevState, 
      [name]: parseInt(value, 10) 
    }));
  };

  // 3. FUNÇÃO PARA O INPUT DE NÚMERO (Garante o funcionamento do 'onChange={handleNumberChange}')
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigData((prevState) => ({ 
      ...prevState, 
      [name]: value === "" ? 0 : parseInt(value, 10) 
    }));
  };

  // 4. FUNÇÃO PARA O CLIQUE DO BOTÃO
  const handleSalvarConfiguracao = () => {
    console.log("Payload para o banco/fila:", configData);
    alert("Parâmetros estruturados com sucesso!");
  };

  /* ====================================================================
     O SEU RETURN EXCELENTE E TOTALMENTE CORRIGIDO CONTRA ERROS DE ESCOPO
     ==================================================================== */
  return (
    <div className="w-100 p-2 text-start">
      
      {/* Card principal simétrico e plano idêntico ao do cadastro */}
      <div className="card p-3 shadow-sm border border-light-subtle bg-white rounded-3">
        
        {/* Cabeçalho do Módulo */}
        <div className="border-bottom pb-2 mb-3">
          <h2 className="fs-5 fw-bold text-dark m-0">⚙️ Configurações Gerais do Sistema</h2>
        </div>

        {/* GRADE PRINCIPAL DE DUAS COLUNAS */}
        <div className="row g-4">
          
          {/* COLUNA DA ESQUERDA: Parametrização do Veículo (Ocupa 7 de 12) */}
          <div className="col-md-7 border-end pe-3">
            
            {/* Bloco 1: Tipos e Categorias */}
            <div className="mb-4">
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>CLASSIFICAÇÃO DO VEÍCULO</h4>
              <div className="row g-2">
                
                <div className="col-md-6">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Tipo de Veículo (VehicleTypeId)</label>
                  <select name="vehicleTypeId" value={configData.vehicleTypeId} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={1}>Passeio / Automóvel</option>
                    <option value={2}>Caminhão / Comercial</option>
                    <option value={3}>Motocicleta</option>
                    <option value={4}>Ônibus / Van</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Marca do Veículo (VehicleBrandTypeId)</label>
                  <select name="vehicleBrandTypeId" value={configData.vehicleBrandTypeId} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={1}>Volkswagen</option>
                    <option value={2}>Chevrolet</option>
                    <option value={3}>Fiat</option>
                    <option value={4}>Ford</option>
                    <option value={5}>Mercedes-Benz</option>
                    <option value={6}>Volvo (Pesados)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Ano Modelo (Model)</label>
                  <input type="number" name="model" min={1900} max={2100} value={configData.model} onChange={handleNumberChange} className="form-control form-input-atendimento" />
                </div>

                <div className="col-md-8">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Configuração de Eixos (AxleWheelType)</label>
                  <select name="axleWheelType" value={configData.axleWheelType} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={2}>2 Eixos - Rodado Simples</option>
                    <option value={3}>2 Eixos - Rodado Duplo</option>
                    <option value={4}>3 Eixos - Rodado Duplo</option>
                    <option value={6}>4 Eixos - Rodado Duplo</option>
                    <option value={9}>6 Eixos - Rodado Duplo</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Bloco 2: Categoria Operacional de Pedágio */}
            <div>
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>CATEGORIAS OPERACIONAIS</h4>
              <div className="row g-2">
                <div className="col-md-12">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Categoria Tarifária Artesp/Antt (VehicleCategoryId)</label>
                  <select name="vehicleCategoryId" value={configData.vehicleCategoryId} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={1}>Categoria 1: Automóvel, caminhonete e furgão (2 eixos simples)</option>
                    <option value={2}>Categoria 2: Caminhão leve, ônibus (2 eixos duplos)</option>
                    <option value={3}>Categoria 3: Automóvel com semirreboque (3 eixos simples)</option>
                    <option value={4}>Categoria 4: Caminhão com reboque, ônibus (3 eixos duplos)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* COLUNA DA DIREITA: Regras de Negócio e Tags (Ocupa 5 de 12) */}
          <div className="col-md-5 ps-3 d-flex flex-column justify-content-between">
            
            <div>
              <h4 className="text-primary fw-bold mb-2" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>REGRAS DE CONTRATO E TAG</h4>
              <div className="row g-2">
                
                <div className="col-md-12">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Tipo de Serviço Associado (ServiceTypeId)</label>
                  <select name="contractVehicleTagServiceTypeId" value={configData.contractVehicleTagServiceTypeId} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={1}>Pós-Pago (Faturamento Mensal)</option>
                    <option value={2}>Pré-Pago (Saldo Recarregável)</option>
                    <option value={3}>Isento / Operação Interna</option>
                  </select>
                </div>

                <div className="col-md-12 mt-2">
                  <label className="text-muted mb-1" style={{ fontSize: '0.7rem' }}>Status Inicial do Dispositivo (StatusType)</label>
                  <select name="contractVehicleTagStatusType" value={configData.contractVehicleTagStatusType} onChange={handleSelectChange} className="form-select form-input-atendimento">
                    <option value={1}>Ativo / Liberado para Passagens</option>
                    <option value={2}>Bloqueado / Inadimplência</option>
                    <option value={3}>Suspenso Temporariamente</option>
                    <option value={4}>Cancelado / Extraviado</option>
                  </select>
                </div>

              </div>
            </div>

            {/* BOTÃO DE CONFIRMAÇÃO NO RODAPÉ DA DIREITA */}
            <div className="pt-3 border-top text-end mt-4">
              <button type="button" onClick={handleSalvarConfiguracao} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.9rem' }}>
                ⚙️ Gravar Parâmetros de Configuração
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
