import React, { useState, useEffect } from 'react';
// IMPORTAÇÃO DOS ÍCONES DA LUCIDE (Se quiser deixar o cabeçalho mais moderno)
import { BarChart3, AlertCircle, Clock, CheckCircle, Activity, Hourglass } from "lucide-react";
import type { IDashboardMetricas } from '../types/index.ts';
import '../styles/dashboard.css';

export const Dashboard: React.FC = () => {
  const [metricas, setMetricas] = useState<IDashboardMetricas>({
    naoAtendidos: 0,
    atendidos: 0,
    pendentes: 0,
    fechados: 0,
    tempoMedio: 0
  });

  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    async function puxarMetricasGLPI() {
      try {
        const resposta = await fetch('/api/dadosChamados');
        if (!resposta.ok) throw new Error("Falha ao ler API do Dashboard");
        
        const dados = await resposta.json();
        
        setMetricas({
          naoAtendidos: Number(dados.naoAtendidos || 0),
          atendidos: Number(dados.atendidos || 0),
          pendentes: Number(dados.pendentes || 0),
          fechados: Number(dados.fechados || 0),
          tempoMedio: Number(dados.tempoMedio || 0)
        });
      } catch (erro) {
        console.error("Erro ao atualizar o dashboard no React:", erro);
      } finally {
        setCarregando(false);
      }
    }

    puxarMetricasGLPI();
    const temporizador = setInterval(puxarMetricasGLPI, 30000);
    return () => clearInterval(temporizador);
  }, []);

  const totalChamados = metricas.naoAtendidos + metricas.atendidos + metricas.pendentes + metricas.fechados;
  
  const calcularPercentagem = (valor: number) => {
    if (totalChamados === 0) return 0; // Retorna número para o Bootstrap tratar no style
    return Number(((valor / totalChamados) * 100).toFixed(1));
  };

  return (
  /* MUDANÇA: Sincronizado o padding (px-3) para casar as bordas laterais com o Header no notebook e celular */
  <div className="container my-3 my-md-4 px-3 text-start" style={{ maxWidth: "1200px", margin: "0 auto" }}>
     
     {/* CABEÇALHO DO DASHBOARD RESPONSIVO */}
     {/* MUDANÇA: 'flex-column flex-sm-row gap-2' impede o título de esmagar o badge no mobile */}
     <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between border-bottom pb-3 mb-4 gap-2">
      <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
        <BarChart3 size={22} className="text-primary" />Dashboard
      </h2>
      {!carregando && (
        <span className="badge bg-light border text-muted fw-normal py-1.5 px-2 small">
          🔄 Auto-update: 30s
        </span>
      )}
     </div>

    {carregando ? (
      <div className="text-center py-5">
        <div className="spinner-border text-secondary mb-2" role="status"></div>
        <p className="text-muted small">⏳ Calculando contadores em tempo real do GLPI...</p>
      </div>
    ) : (
      <>
        {/* CARTÕES DE INDICADORES SUPERIORES RESPONSIVOS */}
        {/* MUDANÇA: 'g-3' gerencia o espaçamento de forma simétrica. 'col-12 col-md-4' empilha no celular e divide em 3 no PC */}
        <div className="row g-3 mb-4">
          
          {/* Card 1: Não Atendidos (Crítico/Alerta) */}
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm border border-light-subtle bg-white rounded-3 d-flex flex-row align-items-center justify-content-between" style={{ minHeight: '100px' }}>
              <div>
                <h6 className="text-muted fw-bold small mb-1">NÃO ATENDIDOS</h6>
                <p className="fs-2 fw-black text-danger m-0 lh-1">{metricas.naoAtendidos}</p>
              </div>
              <div className="bg-danger-subtle p-2 rounded-3 text-danger d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                <AlertCircle size={22} />
              </div>
            </div>
          </div>

          {/* Card 2: Em Atendimento */}
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm border border-light-subtle bg-white rounded-3 d-flex flex-row align-items-center justify-content-between" style={{ minHeight: '100px' }}>
              <div>
                <h6 className="text-muted fw-bold small mb-1">EM ATENDIMENTO</h6>
                <p className="fs-2 fw-black text-primary m-0 lh-1">{metricas.atendidos}</p>
              </div>
              <div className="bg-primary-subtle p-2 rounded-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                <Activity size={22} />
              </div>
            </div>
          </div>
          
          {/* Card 3: Média de Espera */}
          <div className="col-12 col-md-4">
            <div className="card p-3 shadow-sm border border-light-subtle bg-white rounded-3 d-flex flex-row align-items-center justify-content-between" style={{ minHeight: '100px' }}>
              <div>
                <h6 className="text-muted fw-bold small mb-1">MÉDIA ESPERA (MIN)</h6>
                <p className="fs-2 fw-black text-dark m-0 lh-1">{metricas.tempoMedio}</p>
              </div>
              <div className="bg-light border p-2 rounded-3 text-secondary d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

        </div>

        {/* GRÁFICOS DE BARRA NATIVOS E RESPONSIVOS (CARD UNIFICADO) */}
        {/* MUDANÇA: Removido o 'mx-0' que causava distorção e tremor lateral ao mover o mouse */}
        <div className="card p-4 shadow-sm border border-light-subtle bg-white rounded-3 w-100">
          <h3 className="fs-6 fw-bold text-dark border-bottom pb-2 mb-4">Divisão de Status dos Chamados</h3>
          
          {/* Barra 1: Não Atendido */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-secondary">
              <span>⚠️ Não Atendido</span>
              <span>{metricas.naoAtendidos} ({calcularPercentagem(metricas.naoAtendidos)}%)</span>
            </div>
            <div className="progress bg-light" style={{ height: '8px', border: '1px solid #f1f5f9' }}>
              <div 
                className="progress-bar bg-danger" 
                role="progressbar"
                style={{ width: `${calcularPercentagem(metricas.naoAtendidos)}%` }}
                aria-valuenow={calcularPercentagem(metricas.naoAtendidos)}
              ></div>
            </div>
          </div>
          
          {/* Barra 2: Em Atendimento */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-secondary">
              <span>⚡ Em Atendimento</span>
              <span>{metricas.atendidos} ({calcularPercentagem(metricas.atendidos)}%)</span>
            </div>
            <div className="progress bg-light" style={{ height: '8px', border: '1px solid #f1f5f9' }}>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar"
                style={{ width: `${calcularPercentagem(metricas.atendidos)}%` }}
                aria-valuenow={calcularPercentagem(metricas.atendidos)}
              ></div>
            </div>
          </div>
          
          {/* Barra 3: Pendente (Cliente) */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-secondary">
              <span>⏳ Pendente (Cliente)</span>
              <span>{metricas.pendentes} ({calcularPercentagem(metricas.pendentes)}%)</span>
            </div>
            <div className="progress bg-light" style={{ height: '8px', border: '1px solid #f1f5f9' }}>
              <div 
                className="progress-bar bg-warning" 
                role="progressbar"
                style={{ width: `${calcularPercentagem(metricas.pendentes)}%` }}
                aria-valuenow={calcularPercentagem(metricas.pendentes)}
              ></div>
            </div>
          </div>
          
          {/* Barra 4: Resolvido / Fechado */}
          <div className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-secondary">
              <span>✅ Resolvido / Fechado</span>
              <span>{metricas.fechados} ({calcularPercentagem(metricas.fechados)}%)</span>
            </div>
            <div className="progress bg-light" style={{ height: '8px', border: '1px solid #f1f5f9' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar"
                style={{ width: `${calcularPercentagem(metricas.fechados)}%` }}
                aria-valuenow={calcularPercentagem(metricas.fechados)}
              ></div>
            </div>
          </div>

        </div>
      </>
    )}
  </div>
);
};
