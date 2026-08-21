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
  planoPagamento: ''
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
  if (!condComerciaisTipo.trim()) {
    alert('Por favor, digite o ID do contrato.');
    return;
  }
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
              CARD 4: REGRAS E PARAMETRIZAÇÃO DA CONDIÇÃO COMERCIAL
              ==================================================================== */}
          <div>
            <div 
              className="p-3 bg-light text-start cp d-flex justify-content-between align-items-center" 
              onClick={() => alternarBloco('regraComercial')}
              style={{ cursor: 'pointer', borderLeft: blocoAtivo === 'regraComercial' ? '4px solid #4f46e5' : '4px solid transparent', transition: 'all 0.2s' }}
            >
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
                    <input 
                    type="text" 
                    inputMode="numeric" 
                    name="corteFaturamento" 
                    placeholder="Digite um tipo de corte" 
                    value={valoresComerciais.corteFaturamento}
                    onChange={gerenciarMudancaInput}    
                    className="form-control form-input-atendimento text-start" />

                    <div>
                    <button 
                      type="button" 
                       onClick={() => handleEnviarComercializadoTipo('tipoCorte', valoresComerciais.corteFaturamento)} 
                      className="btn btn-primary fw-semibold w-100 py-2" 
                      style={{ fontSize: '0.82rem' }}
                    >
                      💾 Castrar consdição
                    </button>
                  </div>
                  </div>

                  <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Plano comercializado (StatusType)</label>
                    <input 
                    type="text" 
                    inputMode="numeric" 
                    name="planoComercializado" 
                    placeholder="Digite um plano Comercializado" 
                    value={valoresComerciais.planoComercializado}
                    onChange={gerenciarMudancaInput}  
                    className="form-control form-input-atendimento text-start" />

                     <div>
                    <button 
                      type="button" 
                      onClick={() => handleEnviarComercializadoTipo('tipoComercializado', valoresComerciais.planoComercializado)} 
                      className="btn btn-primary fw-semibold w-100 py-2" 
                      style={{ fontSize: '0.82rem' }}
                    >
                      💾 Castrar consdição
                    </button>
                  </div>
                  </div>

                    <div className="col-md-4.5 text-start" style={{ width: '37.5%' }}>
                    <label className="text-muted mb-1 d-block" style={{ fontSize: '0.7rem' }}>Plano de pagamento (StatusType)</label>
                    <input 
                    type="text" 
                    inputMode="numeric" 
                    name="planoPagamento"
                    placeholder="Digite um plano de pagamento" 
                    value={valoresComerciais.planoPagamento}
                    onChange={gerenciarMudancaInput}  
                    className="form-control form-input-atendimento text-start" />

                    <div >
                    <button 
                      type="button" 
                      onClick={() => handleEnviarComercializadoTipo('tipoPagamento', valoresComerciais.planoPagamento)}
                      className="btn btn-primary fw-semibold w-100 py-2" 
                      style={{ fontSize: '0.82rem' }}
                    >
                      💾 Castrar consdição
                    </button>
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
