import React, { useState } from "react";
import axios from "axios";
import "../styles/CadastroContrato.css"; // Reaproveita as suas classes de input

export const ConfiguracaoSistema: React.FC = () => {
  // 1. CONTROLADORES DE EXPANSÃO (Guarda qual bloco está aberto na tela)
  const [blocoAtivo, setBlocoAtivo] = useState<string | null>(null);  
 
  // Em vez de usar apenas uma string, use um objeto para mapear cada campo
  const [valoresComerciais, setValoresComerciais] = useState({
  corteFaturamento: '',
  planoComercializado: '',
  planoPagamento: '',
  contratoStatus: '',
  faturaStatus: '',
  veiculoTipo: '',
  veiculoMarca: '',
  eixoVeiculo: '',
  transacaoVeiculo: ''
});

const gerenciarMudancaInput = (e: any) => {
  const { name, value } = e.target;
  setValoresComerciais((valoresAnteriores) => ({
    ...valoresAnteriores,
    [name]: value // Atualiza dinamicamente apenas o campo que mudou
  }));
};

  // Alternador de sanfona (Accordion)
  const alternarBloco = (nomeBloco: string) => {
    setBlocoAtivo(blocoAtivo === nomeBloco ? null : nomeBloco);
  };

  const handleEnviarComercializadoTipo = async (formato: string, condComerciaisTipo: string) => {
  
      try {
        const payloadEnvio = {
        protocoloId: `PROT-${Date.now()}`, 
        acao: 'inserir', 
        tipo: formato ,
        dadosLimpos: condComerciaisTipo
      };

      console.log(`[Configuração] Despachando nova informação para a fila:`, payloadEnvio);

      const resposta = await axios.post('http://localhost:3000/api/parametrizacao', payloadEnvio);

      if (resposta.status === 200 || resposta.data?.sucesso) {
        alert(`Sucesso! Parâmetros enviados para a fila.\nProtocolo: ${payloadEnvio.protocoloId}`);
      }
    } catch (error: any) {
      console.error(`Erro ao gravar bloco`, error);
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
            CARD 1: REGRAS E PARAMETRIZAÇÃO DA CONDIÇÃO COMERCIAL
            ==================================================================== */}
        <div>
          <div className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" onClick={() => alternarBloco('regraComercial')} style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'regraComercial' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s' }}>
          <div>
            <h4 className="fs-6 fw-bold text-dark m-0">🔧 3. Regras e Parametrização Comercial do contrato</h4>
             <small className="text-muted">Gere novos status e tipos para o provisionamento do contrato.</small>
          </div>
          </div>

        {/* Painel expansível do Bloco 3 */}
          {blocoAtivo === 'regraComercial' && (
          <div className="p-3 border-top bg-white">
          <div className="row g-2 align-items-end text-start m-0">
                
            <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
            <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Corte para faturamento (ServiceTypeId)</label>
            <input type="text" inputMode="numeric" name="corteFaturamento" placeholder="Digite um tipo de corte" value={valoresComerciais.corteFaturamento} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
            <div>
              <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoCorte', valoresComerciais.corteFaturamento)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar condição</button>
            </div>
            </div>

            <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
            <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Plano comercializado (StatusType)</label>
            <input type="text" inputMode="numeric" name="planoComercializado" placeholder="Digite um plano Comercializado" value={valoresComerciais.planoComercializado}onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
            <div>
              <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoComercializado', valoresComerciais.planoComercializado)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar condição</button>
            </div>
            </div>

            <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
              <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Plano de pagamento (StatusType)</label>
              <input type="text" inputMode="numeric" name="planoPagamento" placeholder="Digite um plano de pagamento" value={valoresComerciais.planoPagamento} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
              <div>
                <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoPagamento', valoresComerciais.planoPagamento)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar condição</button>
              </div>
            </div>

            <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
            <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Status do Contrato (StatusType)</label>
            <input type="text" inputMode="numeric" name="contratoStatus" placeholder="Digite um staus do contrato" value={valoresComerciais.contratoStatus} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
            <div>
              <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoContratoStatus', valoresComerciais.contratoStatus)}className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar condição</button>
            </div>
            </div>

            <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
            <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Status da fatura (StatusType)</label>
            <input type="text" inputMode="numeric" name="faturaStatus" placeholder="Digite um staus da fatura" value={valoresComerciais.faturaStatus} onChange={gerenciarMudancaInput}  className="form-control form-input-atendimento text-start" />
             <div>
              <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoFaturaStatus', valoresComerciais.faturaStatus)} className="btn btn-primary fw-semibold w-100 py-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar condição</button>
             </div>
            </div>

            </div>
            </div>
           )}
        </div>

        {/* ====================================================================
            NOVO CARD 2: PARAMETRIZAÇÃO ADICIONAL DO SISTEMA
            ==================================================================== */}
          <div>
           <div className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" onClick={() => alternarBloco('regraVeiculos')} // 👈 Nova string de estado
           style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'outraConfiguracao' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s'}}>
           <div><h4 className="fs-6 fw-bold text-dark m-0">🛠️ 4. Parâmetros e Configurações de veículo</h4><small className="text-muted">Configure taxas administrativas e valores padrões do ecossistema.</small></div>
          </div>

          {/* Painel expansível do Novo Bloco */}
          {blocoAtivo === 'regraVeiculos' && (
            <div className="p-3 border-top bg-white">
              <div className="row g-2 align-items-end text-start m-0">
                
                {/* Exemplo de Input do Novo Card */}
                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Tipo do veículo</label>
                <input type="text" name="veiculoTipo" placeholder="Digite o valor padrão" value={valoresComerciais.veiculoTipo} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" onClick={() => handleEnviarComercializadoTipo('tipoVeiculo', valoresComerciais.veiculoTipo)} onChange={gerenciarMudancaInput} className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Marca do veículo</label>
                <input type="text"  name="veiculoMarca" placeholder="Digite o valor padrão" value={valoresComerciais.veiculoMarca} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" onClick={() => handleEnviarComercializadoTipo('marcaVeiculo', valoresComerciais.veiculoMarca)} onChange={gerenciarMudancaInput} className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Eixo do veículo</label>
                <input type="text" name="eixoVeiculo" placeholder="Digite o valor padrão" value={valoresComerciais.eixoVeiculo} onChange={gerenciarMudancaInput} className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" onClick={() => handleEnviarComercializadoTipo('eixoVeiculo', valoresComerciais.eixoVeiculo)} className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Transação do veículo</label>
                <input type="text" name="transacaoVeiculo" value={valoresComerciais.transacaoVeiculo} onChange={gerenciarMudancaInput} placeholder="Digite o valor padrão" className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" onClick={() => handleEnviarComercializadoTipo('transacaoVeiculo', valoresComerciais.transacaoVeiculo)} className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            NOVO CARD 3: PARAMETRIZAÇÃO ADICIONAL DO SISTEMA
            ==================================================================== */}
          <div>
           <div className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" onClick={() => alternarBloco('regraGerais')} // 👈 Nova string de estado
           style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'outraConfiguracao' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s'}}>
           <div><h4 className="fs-6 fw-bold text-dark m-0">🛠️ 5. Parâmetros e Configurações de gerais</h4><small className="text-muted">Configure taxas administrativas e valores padrões do ecossistema.</small></div>
          </div>

          {/* Painel expansível do Novo Bloco */}
          {blocoAtivo === 'regraGerais' && (
            <div className="p-3 border-top bg-white">
              <div className="row g-2 align-items-end text-start m-0">
                
                {/* Exemplo de Input do Novo Card */}
                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Tipo do veículo</label>
                <input type="text" name="valorTagPadrao" placeholder="Digite o valor padrão" className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Marca do veículo</label>
                <input type="text" name="valorTagPadrao" placeholder="Digite o valor padrão" className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Eixo do veículo</label>
                <input type="text" name="valorTagPadrao" placeholder="Digite o valor padrão" className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
                </div>

                <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Transação do veículo</label>
                <input type="text" name="valorTagPadrao" placeholder="Digite o valor padrão" className="form-control form-input-atendimento text-start" />
                 <div>
                 <button type="button" className="btn btn-primary fw-semibold w-100 py-2 mt-2" style={{ fontSize: '0.82rem' }}>💾 Cadastrar</button>
                 </div>
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
