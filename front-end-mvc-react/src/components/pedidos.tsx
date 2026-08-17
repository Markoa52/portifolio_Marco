import React from "react";

export const Pedidos: React.FC = () => {
  return (
    /* container limita a largura máxima da página nas laterais automaticamente */
    /* py-4 adiciona um espaçamento amigável em cima e embaixo */
    <div className="container py-4" style={{ maxWidth: "1366px" }}>
      
      {/* O SEU MENU SUPERIOR PRETO E SEUS SALDOS CONTINUAM AQUI EM CIMA... */}

      {/* row cria a linha e g-4 aplica o espaçamento (gap) perfeito entre os cards */}
      <div className="row g-4 mt-2">
        
        {/* CARD 1: Fatura */}
        {/* col-md-6 divide a tela em 2 colunas no computador e 1 coluna no celular */}
        <div className="col-md-6">
          {/* card, p-4 (espaço interno), shadow-sm (sombra leve) e border (borda sutil) */}
          <div className="card p-4 shadow-sm border h-100" style={{ minHeight: "180px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0 fw-bold">Fatura</h3>
              {/* btn-dark deixa o botão preto idêntico ao seu menu superior */}
              <a href="/faturas" className="btn btn-dark btn-sm fw-semibold">
                Consultar faturas →
              </a>
            </div>
            {/* O conteúdo interno da sua fatura (A Pagar, datas, etc.) entra aqui */}
          </div>
        </div>

        {/* CARD 2: Últimos Pedidos */}
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border h-100" style={{ minHeight: "180px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0 fw-bold">Últimos pedidos</h3>
              <a href="/pedidos" className="btn btn-dark btn-sm fw-semibold">
                Consultar pedidos →
              </a>
            </div>
            {/* O seu gráfico de linha de entrega entra aqui */}
          </div>
        </div>

        {/* CARD 3: Veículos */}
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border h-100" style={{ minHeight: "180px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0 fw-bold">Veículos</h3>
              <a href="/veiculos" className="btn btn-dark btn-sm fw-semibold">
                Consultar veículos →
              </a>
            </div>
            {/* Seus números e contagem de tags entram aqui */}
          </div>
        </div>

        {/* CARD 4: Tag */}
        <div className="col-md-6">
          <div className="card p-4 shadow-sm border h-100" style={{ minHeight: "180px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0 fw-bold">Tag</h3>
              <a href="/tags" className="btn btn-dark btn-sm fw-semibold">
                Ativar tags →
              </a>
            </div>
            {/* Seu texto de conteúdo em construção entra aqui */}
          </div>
        </div>

      </div>
    </div>
  );
};
