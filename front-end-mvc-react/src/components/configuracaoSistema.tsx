import React, { useState } from "react";
import axios from "axios";
import "../styles/CadastroContrato.css"; // Reaproveita as suas classes de input

export const ConfiguracaoSistema: React.FC = () => {
  // 1. CONTROLADORES DE EXPANSÃO (Guarda qual bloco está aberto na tela)
  const [blocoAtivo, setBlocoAtivo] = useState<string | null>(null);

  // 2. ESTADOS DOS FORMULÁRIOS (Totalmente limpos e em branco)
  const [veiculo, setVeiculo] = useState({ vehicleTypeId: "", vehicleBrandTypeId: "", model: "", axleWheelType: "" });
  const [categoria, setCategoria] = useState({ vehicleCategoryId: "", description: "" });
  const [regraTag, setRegraTag] = useState({ contractVehicleTagServiceTypeId: "", contractVehicleTagStatusType: "" });

  // Alternador de sanfona (Accordion)
  const alternarBloco = (nomeBloco: string) => {
    setBlocoAtivo(blocoAtivo === nomeBloco ? null : nomeBloco);
  };

  // Handler inteligente para aceitar apenas números nos campos de ID
  const aplicarSomenteNumeros = (value: string) => value.replace(/\D/g, "");

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVeiculo((prev) => ({ ...prev, [name]: aplicarSomenteNumeros(value) }));
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valorTratado = name === "description" ? value : aplicarSomenteNumeros(value);
    setCategoria((prev) => ({ ...prev, [name]: valorTratado }));
  };

  const handleRegraTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegraTag((prev) => ({ ...prev, [name]: aplicarSomenteNumeros(value) }));
  };

  // 3. FUNÇÃO CENTRAL DE ENVIO PARA A FILA
  const dispararEnvioFila = async (taskName: string, dadosBloco: any) => {
    const possuiCampoVazio = Object.values(dadosBloco).some(valor => String(valor).trim() === "");
    if (possuiCampoVazio) {
      alert("Por favor, preencha todos os campos do bloco antes de salvar.");
      return;
    }

    try {
      const dadosTratados: Record<string, number | string> = {};
      Object.keys(dadosBloco).forEach((key) => {
        const valorOriginal = dadosBloco[key];
        dadosTratados[key] = isNaN(Number(valorOriginal)) || valorOriginal === "" 
          ? valorOriginal 
          : parseInt(valorOriginal, 10);
      });

      const payloadEnvio = {
        protocoloId: `CONF-${taskName.toUpperCase()}-${Date.now()}`,
        acao: 'inserir', 
        task: taskName, 
        dadosLimpos: dadosTratados
      };

      console.log(`[Configuração] Despachando nova informação para a fila:`, payloadEnvio);

      const resposta = await axios.post('http://localhost:3000/api/configuracao', payloadEnvio);

      if (resposta.status === 200 || resposta.data?.sucesso) {
        alert(`Sucesso! Parâmetros enviados para a fila.\nProtocolo: ${payloadEnvio.protocoloId}`);
        
        // Limpa o bloco específico após o sucesso
        if (taskName === 'cadastrar_veiculo') setVeiculo({ vehicleTypeId: "", vehicleBrandTypeId: "", model: "", axleWheelType: "" });
        if (taskName === 'cadastrar_categoria_pedagio') setCategoria({ vehicleCategoryId: "", description: "" });
        if (taskName === 'cadastrar_regra_tag') setRegraTag({ contractVehicleTagServiceTypeId: "", contractVehicleTagStatusType: "" });
        setBlocoAtivo(null); 
      }
    } catch (error: any) {
      console.error(`Erro ao gravar bloco ${taskName}:`, error);
      alert(`Falha ao salvar: ${error.response?.data?.erro || error.message}`);
    }
  };

    return (
    <div className="w-100 p-2 text-start">
      {/* Card principal sem bordas visíveis fortes (border-0) */}
      <div className="card p-3 shadow-sm border-0 bg-white rounded-3">
        
        {/* Cabeçalho do Módulo */}
        <div className="border-bottom pb-2 mb-4">
          <h2 className="fs-5 fw-bold text-dark m-0">⚙️ Configurações Gerais do Sistema</h2>
        </div>

        {/* LISTAGEM DE CARDS INTERNOS EXPANSÍVEIS (Estilo Clean sem bordas separadoras) */}
        <div className="d-flex flex-column gap-3">
          
          {/* ====================================================================
              CARD 1: CLASSIFICAÇÃO E MODELO DO VEÍCULO
              ==================================================================== */}
          <div>
            <div 
              className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" 
              onClick={() => alternarBloco('veiculo')}
              style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'veiculo' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s' }}
            >
              <div>
                <h4 className="fs-6 fw-bold text-dark m-0">🚗 1. Tipo e Modelo de Veículo</h4>
                <small className="text-muted">Cadastre novos códigos identificadores para tipos, marcas, anos e eixos de frotas.</small>
              </div>
            </div>

            {/* Painel expansível do Bloco 1 */}
            {blocoAtivo === 'veiculo' && (
              <div className="p-3 border-0 bg-white">
                <div className="row g-2 align-items-end text-start m-0">
                  <div className="col-md-3">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Novo Cód. Tipo (VehicleTypeId)</label>
                    <input type="text" inputMode="numeric" name="vehicleTypeId" placeholder="Ex: 5" value={veiculo.vehicleTypeId} onChange={handleVeiculoChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-3">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Novo Cód. Marca (VehicleBrandTypeId)</label>
                    <input type="text" inputMode="numeric" name="vehicleBrandTypeId" placeholder="Ex: 7" value={veiculo.vehicleBrandTypeId} onChange={handleVeiculoChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-2">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Ano Modelo (Model)</label>
                    <input type="text" inputMode="numeric" name="model" placeholder="Ex: 2026" value={veiculo.model} onChange={handleVeiculoChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-2">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Qtd. Eixos (AxleWheelType)</label>
                    <input type="text" inputMode="numeric" name="axleWheelType" placeholder="Ex: 3" value={veiculo.axleWheelType} onChange={handleVeiculoChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-2">
                    <button type="button" onClick={() => dispararEnvioFila('cadastrar_veiculo', veiculo)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>
                      💾 Salvar Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ====================================================================
              CARD 2: CATEGORIA TARIFÁRIA DE PEDÁGIO
              ==================================================================== */}
          <div>
            <div 
              className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" 
              onClick={() => alternarBloco('categoria')}
              style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'categoria' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s' }}
            >
              <div>
                <h4 className="fs-6 fw-bold text-dark m-0">🎫 2. Categoria Tarifária de Pedágio</h4>
                <small className="text-muted">Registre novas categorias operacionais homologadas e suas respectivas descrições.</small>
              </div>
            </div>

            {/* Painel expansível do Bloco 2 */}
            {blocoAtivo === 'categoria' && (
              <div className="p-3 border-top bg-white">
                <div className="row g-2 align-items-end text-start m-0">
                  <div className="col-md-3">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Novo Cód. Categoria (VehicleCategoryId)</label>
                    <input type="text" inputMode="numeric" name="vehicleCategoryId" placeholder="Ex: 5" value={categoria.vehicleCategoryId} onChange={handleCategoriaChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Descrição Completa da Categoria</label>
                    <input type="text" name="description" placeholder="Ex: Categoria 5: Caminhão com reboque (5 eixos)" value={categoria.description} onChange={handleCategoriaChange} className="form-control form-input-atendimento text-start" />
                  </div>
                  <div className="col-md-3">
                    <button type="button" onClick={() => dispararEnvioFila('cadastrar_categoria_pedagio', categoria)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>
                      💾 Salvar Categoria
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ====================================================================
              CARD 3: REGRAS E PARAMETRIZAÇÃO DA TAG
              ==================================================================== */}
          <div>
            <div 
              className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" 
              onClick={() => alternarBloco('regraTag')}
              style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'regraTag' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s' }}
            >
              <div>
                <h4 className="fs-6 fw-bold text-dark m-0">🔧 3. Regras e Parametrização Comercial da Tag</h4>
                <small className="text-muted">Gere novos status e tipos de faturamento para o provisionamento eletrônico de tags.</small>
              </div>
            </div>

            {/* Painel expansível do Bloco 3 */}
            {blocoAtivo === 'regraTag' && (
              <div className="p-3 border-top bg-white">
                <div className="row g-2 align-items-end text-start m-0">
                  
                  <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Novo Cód. Serviço (ServiceTypeId)</label>
                    <input type="text" inputMode="numeric" name="contractVehicleTagServiceTypeId" placeholder="Digite o código do serviço" value={regraTag.contractVehicleTagServiceTypeId} onChange={handleRegraTagChange} className="form-control form-input-atendimento text-start" />
                  </div>

                  <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Novo Cód. Status (StatusType)</label>
                    <input type="text" inputMode="numeric" name="contractVehicleTagStatusType" placeholder="Digite o código do status" value={regraTag.contractVehicleTagStatusType} onChange={handleRegraTagChange} className="form-control form-input-atendimento text-start" />
                  </div>

                  <div className="col-md-3 text-start" style={{ width: '25%' }}>
                    <button 
                      type="button" 
                      onClick={() => dispararEnvioFila('cadastrar_regra_tag', regraTag)} 
                      className="btn btn-primary fw-semibold w-100 py-2" 
                      style={{ fontSize: '0.82rem' }}
                    >
                      💾 Criar Status
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div> {/* Fecha d-flex flex-column gap-3 */}
      </div> {/* Fecha card principal mestre */}
    </div> 
  );
};
