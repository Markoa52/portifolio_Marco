import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, Tag, Search, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import type { IVeiculoProps } from '../types/IVeiculoProps';

export const AtivacaoTagVeiculo: React.FC<IVeiculoProps> = ({ onVoltar, contractId }) => {
  const [veiculosInativos, setVeiculosInativos] = useState<any[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any>(null);
  
  // 🔥 NOVOS ESTADOS: Gerenciamento do estoque de TAGs do cliente
  const [tagsEstoque, setTagsEstoque] = useState<any[]>([]);
  const [tagSelecionada, setTagSelecionada] = useState<any>(null);
  const [carregandoTags, setCarregandoTags] = useState<boolean>(false);

  const [carregando, setCarregando] = useState(false);
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // 1. Busca os veículos vinculados a este contrato
 const buscarVeiculosInativos = async () => {
  try {
    setCarregando(true);
    const resposta = await axios.get(`http://localhost:3000/api/veiculo/${contractId}`);
    const dados = Array.isArray(resposta.data) ? resposta.data : [];

    console.log("📥 [Debug Ativação] O que chegou do SQLite:", dados);

    // 💡 A MÁGICA: Ajustado o filtro para bater idêntico ao status real gravado no banco ("aguardando ativação")
    const inativosGarantidos = dados.filter((v: any) => {
      const statusTexto = String(v.status || '').toLowerCase().trim();
      return statusTexto === 'aguardando ativação' || statusTexto === 'inativo' || statusTexto === 'inativa';
    });

    setVeiculosInativos(inativosGarantidos);
  } catch (error) {
    console.error('Erro ao buscar veículos inativos:', error);
    setVeiculosInativos([]);
  } finally {
    setCarregando(false);
  }
};



  // 2. 🔥 NOVO EFFECT: Busca as TAGs em estoque disponíveis para o contrato
  const buscarTagsDisponiveis = async () => {
    try {
      setCarregandoTags(true);
      const resposta = await axios.get(`http://localhost:3000/api/tag/estoque/${contractId}`);
      setTagsEstoque(Array.isArray(resposta.data) ? resposta.data : []);
    } catch (error) {
      console.error('Erro ao carregar estoque de tags:', error);
      setTagsEstoque([]);
    } finally {
      setCarregandoTags(false);
    }
  };

  // Dispara as consultas iniciais ao montar a tela
  useEffect(() => {
    if (contractId) {
      buscarVeiculosInativos();
      buscarTagsDisponiveis();
    }
  }, [contractId]);

  // Manipulador do clique de vínculo e ativação
  const handleVincularEAtivar = async (e: any) => {
    e.preventDefault();
    if (!veiculoSelecionado || !tagSelecionada) return;

    try {
      setCarregando(true);
      const payload = {
        veiculoId: Number(veiculoSelecionado.id),
        contratoId: contractId,
        epcTag: tagSelecionada.numeroSerie || tagSelecionada.epc // Envia a TAG clicada na grade
      };

      console.log('🚀 Disparando ativação atômica:', payload);
      const resposta = await axios.post('http://localhost:3000/api/veiculos/acoes', payload);

      if (resposta.data?.sucesso) {
        setSucesso(true);
        setTagSelecionada(null);
        setVeiculoSelecionado(null);
        // Sincroniza as duas listas em tempo real para remover o que já foi ativado
        await buscarVeiculosInativos(); 
        await buscarTagsDisponiveis();
      }
    } catch (error) {
      console.error('❌ Erro no fluxo de ativação:', error);
      alert('Falha ao vincular e ativar a tag. Verifique as chaves restritivas no terminal.');
    } finally {
      setCarregando(false);
    }
  };

  // Filtra os veículos localmente pela placa digitada
  const veiculosFiltrados = veiculosInativos.filter(v => 
    v.placa?.toLowerCase().includes(filtroPlaca.toLowerCase())
  );

  return (
    <div className="container my-4 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>

      <div className="d-flex align-items-center gap-2 mb-2">
        <button 
          type="button"
          className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border" 
          onClick={onVoltar} 
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          title="Voltar para a Listagem"
        >
          <ArrowLeft size={16} className="text-dark" />
        </button>
        <span className="text-muted small fw-semibold">Voltar ao painel geral</span>
      </div>
      
      {/* CABEÇALHO */}
      <div className="border-bottom pb-2 mb-4">
        <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2">
          <Layers size={22} className="text-primary" /> Homologação e Ativação de Dispositivos (TAGs)
        </h2>
        <small className="text-muted">Vincule um dispositivo físico disponível no estoque do Contrato nº {contractId} para ativar as frotas.</small>
      </div>

      <div className="row g-4 m-0">
        
        {/* ====================================================================
            LADO ESQUERDO: LISTAGEM DE VEÍCULOS AGUARDANDO ATIVAÇÃO
            ==================================================================== */}
        <div className="col-12 col-lg-7 p-0 pe-lg-3">
          <div className="card p-2 border shadow-sm bg-white rounded-3">
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fs-6 fw-bold text-dark m-0">🚗 Frotas Inativas ({veiculosFiltrados.length})</h3>
              
              <div className="input-group input-group-sm" style={{ maxWidth: '200px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted"><Search size={14} /></span>
                <input 
                  type="text" 
                  placeholder="Filtrar placa..." 
                  value={filtroPlaca} 
                  onChange={(e) => setFiltroPlaca(e.target.value)} 
                  className="form-control border-start-0 text-start" 
                />
              </div>
            </div>

            {carregando && veiculosInativos.length === 0 ? (
              <div className="text-center py-5 text-muted small fw-bold">🔄 Sincronizando banco SQLite...</div>
            ) : veiculosFiltrados.length > 0 ? (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {veiculosFiltrados.map((veiculo) => (
                  <div 
                    key={veiculo.id}
                    onClick={() => { setVeiculoSelecionado(veiculo); setSucesso(false); }}
                    className="p-3 rounded-3 border text-start d-flex justify-content-between align-items-center transition-all"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: veiculoSelecionado?.id === veiculo.id ? '#f3f4f6' : '#ffffff',
                      borderLeft: veiculoSelecionado?.id === veiculo.id ? '4px solid #4f46e5' : '1px solid #dee2e6'
                    }}
                  >
                   {/* DENTRO DO SEU .map((veiculo) => ( ... )) */}
                   <div>
                     <span className="font-monospace fw-bold bg-dark text-white px-2 py-0.5 rounded border border-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                       {veiculo.placa}
                     </span>

                   </div>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {veiculo.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted small border rounded-3 bg-light">
                📭 Nenhum veículo inativo localizado para homologação neste contrato.
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            LADO DIREITO: GRID DE SELEÇÃO DE TAGS EM ESTOQUE
            ==================================================================== */}
        <div className="col-12 col-lg-5 p-0 ps-lg-2">
          {veiculoSelecionado ? (
            <div className="card p-2 border border-light-subtle shadow-sm bg-white rounded-3 d-flex flex-column gap-3">
              <h4 className="fs-6 fw-bold text-dark border-bottom pb-2 m-0 d-flex align-items-center gap-2">
                <Tag size={16} className="text-primary" /> Painel de Vínculo Rápido
              </h4>

              {/* Box Informativo do Carro Selecionado na Esquerda */}
              <div className="bg-light p-0 rounded-3 text-start border">
                <span className="text-muted small d-block" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>VEÍCULO ALVO</span>
                <strong className="text-dark fs-7 font-monospace d-block mt-0.5">{veiculoSelecionado.placa}</strong>
              </div>

              {/* Listagem Interna de TAGs disponíveis na gaveta do cliente */}
              <div>
                <label className="text-muted small fw-semibold mb-2 d-block">Escolha uma TAG disponível no Estoque:</label>
                
                {/* 💡 LISTAGEM INTERNA DE TAGS: Sincronizada milimetricamente com o seu JSON do banco */}
               {carregandoTags ? (
                 <div className="text-center py-3 text-muted small">Buscando RFID...</div>
               ) : tagsEstoque && tagsEstoque.length > 0 ? (
                 <div className="d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
                   
                   {tagsEstoque.map((tag: any) => (
                     <div
                       key={tag.id} // 💡 Puxa o 'id' numérico real (1, 2, 3...) do seu JSON
                       onClick={() => setTagSelecionada(tag)}
                       className="p-2.5 rounded-3 border text-start d-flex justify-content-between align-items-center transition-all"
                       style={{
                         cursor: 'pointer',
                         backgroundColor: tagSelecionada?.id === tag.id ? '#eef2ff' : '#ffffff',
                         borderLeft: tagSelecionada?.id === tag.id ? '4px solid #4f46e5' : '1px solid #dee2e6'
                       }}
                     >
                       <div className="d-flex align-items-center gap-2">
                         <span style={{ fontSize: '1rem' }}>🏷️</span>
                         <div>
                           {/* 💡 CORREÇÃO CRÍTICA: Mudado de tag.numeroSerie para tag.serial conforme o seu JSON */}
                           <strong className="text-dark font-monospace" style={{ fontSize: '0.82rem' }}>
                             {tag.serial || "---"}
                           </strong>
                           <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
                             Estoque físico disponível
                           </small>
                         </div>
                       </div>
                       <span className="badge bg-success-subtle text-success border border-success-subtle fw-bold" style={{ fontSize: '0.6rem' }}>
                         {/* Mostra se está disponível baseado no número 1 do banco */}
                         {Number(tag.disponivel) === 1 ? "DISPONÍVEL" : "EM USO"}
                       </span>
                     </div>
                   ))}
               
                 </div>
               ) : (
                 /* Estado Vazio de Estoque */
                 <div className="text-center py-4 border border-dashed rounded-3 bg-light">
                   <p className="fw-bold mb-0 small">Estoque Zerado</p>
                   <small className="text-muted d-block px-3" style={{ fontSize: '0.68rem' }}>
                     Este cliente não possui dispositivos avulsos em sua posse.
                   </small>
                 </div>
               )}

              </div>
              {/* Botão de Confirmação Acoplado com Validação de Escolha */}
              <form onSubmit={handleVincularEAtivar} className="mt-3">
               <button 
                 type="submit" 
                 disabled={carregando || !tagSelecionada} 
                 className={`btn btn-lg w-100 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2 py-2.5 ${
                   tagSelecionada ? 'btn-primary' : 'btn-light border text-muted'
                 }`}
               >
                 {carregando ? 'Validando Dispositivo...' : (
                   tagSelecionada 
                     // 💡 CORREÇÃO: Lemos .serial aqui também para estampar o número certo no clique!
                     ? <>Vincular {tagSelecionada.serial} e Ativar <ArrowRight size={18} /></>
                     : "Selecione uma TAG para liberar"
                 )}
               </button>
             </form>


              </div>
            ) : sucesso ? (
              /* Card de Confirmação Pós-Gravação */
              <div className="card p-4 border-0 text-center shadow-sm bg-success bg-opacity-10 rounded-3 text-success border border-success border-opacity-25">
                <CheckCircle2 size={36} className="d-inline-block mb-2" />
                <h5 className="fw-bold m-0" style={{ fontSize: '0.9rem' }}>Vínculo Executado com Sucesso!</h5>
                <p className="small text-success-emphasis mb-0 mt-1" style={{ fontSize: '0.78rem' }}>
                  O veículo foi migrado para o status ativo e o código RFID foi carimbado em disco.
                </p>
              </div>
            ) : (
              /* Card de Instrução de Tela Inicial */
              <div className="card p-4 border-0 text-center shadow-sm bg-light rounded-3 text-muted border">
                <AlertCircle size={32} className="d-inline-block mb-2 text-secondary" />
                <h5 className="fw-bold m-0" style={{ fontSize: '0.85rem' }}>Aguardando Seleção</h5>
                <p className="small text-muted mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                  Clique em qualquer card de frota inativa na esquerda para abrir a gaveta de dispositivos disponíveis.
                </p>
              </div>
            )}
          </div> {/* Fecha col-md-5 da direita */}

        </div> {/* Fecha row geral */}
      </div> /* Fecha container mestre */
  );
};
