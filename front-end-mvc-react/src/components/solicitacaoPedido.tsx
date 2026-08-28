import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

import type { ISolicitacaoProps } from '../types/ISolicitacaoProps';

export const SolicitacaoPedido: React.FC<ISolicitacaoProps> = ({ onVoltar, contractId }) => {
  // 1. Estado Inicial do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    quantidade: 1,
    valorUnitario: 150.00, 
    endereco: '',
    cidade: '', 
    estado: ''
  });

  const [carregando, setCarregando] = useState(false);
  const [sucessoId, setSucessoId] = useState(null);

  // 2. Manipulador de Mudança nos Inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantidade' ? Math.max(1, Number(value)) : value
    }));
  };

  // 3. Conta Matemática do Total
  const valorTotalCalculado = formData.quantidade * formData.valorUnitario;

  // 4. Envio do Formulário para a API Express
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setCarregando(true);
      
      const payload = {
         metadata: {
        protocoloId: `PROT-${Date.now()}`, 
        acao: 'inserir', 
        criadoEm: new Date().toISOString(),
        contratoId: Number(contractId)
      },
        contextoPedido: {
          nome: String(formData.nome),
          telefone: String(formData.telefone),
          email: String(formData.email),
          quantidade: Number(formData.quantidade),
          valorUnidade: Number(formData.valorUnitario),
          valorTotal: Number(valorTotalCalculado),
          enderecoCompleto: String( `${formData.endereco}, ${formData.cidade} - ${formData.estado}`)
        }
      };

      const resposta = await axios.post('http://localhost:3000/api/pedido/solicitar', payload);

      if (resposta.data?.pedidoId) {
        setSucessoId(resposta.data.pedidoId);
        setFormData({ nome: '', telefone: '', email: '', quantidade: 1, valorUnitario: 150.00, endereco: '', cidade: '', estado: '' });
      }
    } catch (error) {
      console.error('Erro ao solicitar pedido:', error);
      alert('Falha ao registrar o pedido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container my-4 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>

    {/* CABEÇALHO DA TELA COM BOTÃO VOLTAR INTEGRADO */}
    <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-4">
      <button 
        type="button"
        className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border me-1" 
        onClick={onVoltar} // 👈 Executa a função que veio do componente pai
        style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        title="Voltar para a Listagem de Pedidos"
      >
        <ArrowLeft size={16} className="text-dark" />
      </button>
      <h2 className="fs-4 fw-bold text-dark d-flex align-items-center gap-2">
        <ShoppingBag size={22} className="text-primary" /> Nova Solicitação de Pedido
      </h2>
      <small className="text-muted">Preencha os dados e acompanhe o resumo em tempo real.</small>
    </div>

      {sucessoId ? (
        /* TELA DE SUCESSO */
        <div className="card p-5 text-center border-0 shadow-sm bg-white rounded-3 my-5">
          <div className="text-success mb-3"><CheckCircle size={56} className="d-inline-block" /></div>
          <h3 className="fw-bold text-dark">Pedido Solicitado com Sucesso!</h3>
          <p className="text-muted mx-auto" style={{ maxWidth: '400px' }}>
            O pedido foi registrado sob o código <strong>PED-{sucessoId}</strong>.
          </p>
          <button className="btn btn-primary fw-semibold px-4 mt-3" onClick={() => setSucessoId(null)}>
            Criar Nova Solicitação
          </button>
        </div>
      ) : (
        /* LAYOUT DUAS COLUNAS */
        <div className="row g-4 m-0">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <div className="col-12 col-md-7 p-0 pe-md-3">
            <div className="card p-4 border shadow-sm bg-white rounded-3">
              <form onSubmit={handleSubmit}>
                
                <h5 className="fs-6 fw-bold text-dark mb-3 border-bottom pb-2">👤 Dados do Comprador</h5>
                <div className="mb-3">
                  <label className="text-muted small fw-semibold mb-1">Nome Completo</label>
                  <input type="text" name="nome" required value={formData.nome} onChange={handleChange} placeholder="Ex: Transportes Silva LTDA" className="form-control text-start" />
                </div>
                
                <div className="row g-2">
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-semibold mb-1">Telefone</label>
                    <input type="text" name="telefone" required value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" className="form-control text-start" />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-semibold mb-1">E-mail</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="financeiro@empresa.com" className="form-control text-start" />
                  </div>
                </div>

                <h5 className="fs-6 fw-bold text-dark mb-3 border-bottom pb-2 mt-2">📦 Detalhes do Pedido</h5>
                <div className="row g-2">
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-semibold mb-1">Quantidade</label>
                    <input type="number" name="quantidade" min="1" required value={formData.quantidade} onChange={handleChange} className="form-control text-start" />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="text-muted small fw-semibold mb-1">Preço Unitário</label>
                    <input type="text" disabled name="unidade" value="R$ 150,00" className="form-control bg-light text-start text-secondary fw-bold" />
                  </div>
                </div>

                <h5 className="fs-6 fw-bold text-dark mb-3 border-bottom pb-2 mt-2">📍 Local de Entrega</h5>
                <div className="mb-3">
                  <label className="text-muted small fw-semibold mb-1">Endereço Completo</label>
                  <input type="text" name="endereco" required value={formData.endereco} onChange={handleChange} placeholder="Av. Paulista, 1000 - Bela Vista" className="form-control text-start" />
                </div>

                <div className="row g-2">
                  <div className="col-8 mb-3">
                    <label className="text-muted small fw-semibold mb-1">Cidade</label>
                    <input type="text" name="cidade" required value={formData.cidade} onChange={handleChange} placeholder="São Paulo" className="form-control text-start" />
                  </div>
                  <div className="col-4 mb-4">
                    <label className="text-muted small fw-semibold mb-1">Estado</label>
                    <input type="text" name="estado" maxLength={2} required value={formData.estado} onChange={handleChange} placeholder="SP" className="form-control text-start text-uppercase" />
                  </div>
                </div>

                <button type="submit" disabled={carregando} className="btn btn-primary btn-lg w-100 fw-bold fs-6 py-2.5">
                  {carregando ? 'Gravando Pedido...' : 'Confirmar e Enviar Pedido'}
                </button>

              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO */}
          <div className="col-12 col-md-5 p-0 ps-md-2">
            <div className="card p-4 border-0 shadow-sm bg-dark text-white rounded-3 sticky-top" style={{ top: '24px' }}>
              <h5 className="fs-6 fw-bold text-white mb-3 border-bottom border-secondary pb-2">📋 Resumo do Pedido</h5>
              
              <div className="mb-3">
                <span className="text-secondary d-block fw-bold" style={{ fontSize: '0.65rem' }}>COMPRADOR</span>
                <span className="fs-6 fw-bold d-block mt-1 text-truncate">{formData.nome || "Aguardando digitação..."}</span>
                <small className="text-muted d-block text-truncate">
                  {formData.email} {formData.telefone ? `| ${formData.telefone}` : ''}
                </small>
              </div>

              <div className="mb-3 border-top border-secondary pt-3">
                <span className="text-secondary d-block fw-bold" style={{ fontSize: '0.65rem' }}>ENTREGA</span>
                <span className="small text-white-50 d-block mt-1 text-truncate">{formData.endereco || "Não informado"}</span>
                <small className="small text-white fw-bold d-block mt-0.5">
                  {formData.cidade} {formData.estado ? `- ${formData.estado.toUpperCase()}` : ''}
                </small>
              </div>

              <div className="mb-4 border-top border-secondary pt-3">
                <span className="text-secondary d-block fw-bold" style={{ fontSize: '0.65rem' }}>FINANCEIRO</span>
                <div className="d-flex justify-content-between small mt-2">
                  <span className="text-white-50">Quantidade:</span>
                  <span className="fw-bold">{formData.quantidade}x</span>
                </div>
                <div className="d-flex justify-content-between small mt-2">
                  <span className="text-white-50">Preço Unitário:</span>
                  <span>R$ 150,00</span>
                </div>
              </div>

              <div className="bg-secondary bg-opacity-25 p-3 rounded border border-secondary border-opacity-50 d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-secondary d-block fw-bold" style={{ fontSize: '0.65rem' }}>VALOR TOTAL</span>
                  <h2 className="fs-3 fw-bold text-white m-0 mt-1">R$ {valorTotalCalculado},00</h2>
                </div>
                <span className="badge bg-primary fw-bold text-uppercase">À Vista</span>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
