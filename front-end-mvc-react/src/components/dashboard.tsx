import React, { useState, useEffect } from 'react';
import type { IDashboardMetricas } from '../types/index.ts';
import '../styles/dashboard.css'

export const Dashboard: React.FC = () => {
  // Estado inicial zerado seguindo a interface do TypeScript
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
        //Nesse ponto faz a ligação do front-end com a rota da API(back-end)
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

    // Primeira execução imediata ao entrar na página
    puxarMetricasGLPI();

    // Loop de atualização contínua de 30 em 30 segundos (30000ms)
    const temporizador = setInterval(puxarMetricasGLPI, 30000);

    // 🌟 REGRA DE OURO DO REACT: Limpa o loop da memória se o técnico sair da página do Dashboard
    return () => clearInterval(temporizador);
  }, []);

  // Cálculo matemático para a percentagem elástica das barras
  const totalChamados = metricas.naoAtendidos + metricas.atendidos + metricas.pendentes + metricas.fechados;
  
  const calcularPercentagem = (valor: number) => {
    if (totalChamados === 0) return '0%';
    return `${((valor / totalChamados) * 100).toFixed(1)}%`;
  };

  return (
    <div className="main-content-wrapper">
       <div className="header-container-sistema">
        <h2 className="titulo-com-linha">📈 Dashboard de Indicadores GLPI</h2>
       </div>
  
      {carregando ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>⏳ A calcular contadores do GLPI...</p>
      ) : (
        <>
          {/* Cartões de Indicadores Superiores */}
          <div className="grid">
            <div className="card critico">
              <h2>Não Atendidos</h2>
              <p>{metricas.naoAtendidos}</p>
            </div>

            <div className="card">
              <h2>Em Atendimento</h2>
              <p>{metricas.atendidos}</p>
            </div>
            
            <div className="card">
              <h2>Média Espera (Min)</h2>
              <p>{metricas.tempoMedio}</p>
            </div>
          </div>

          {/* Gráficos de Barra Nativos e Responsivos */}
          <div className="chart-container">
            <h3>Divisão de Status dos Chamados</h3>
            
            <div className="bar-group">
              <div className="bar-label"><span>Não Atendido</span><span>{metricas.naoAtendidos}</span></div>
              <div className="bar-bg">
                <div id="bar-nao-atendidos" className="bar-fill" style={{ width: calcularPercentagem(metricas.naoAtendidos) }}></div>
              </div>
            </div>
            
            <div className="bar-group">
              <div className="bar-label"><span>Em Atendimento</span><span>{metricas.atendidos}</span></div>
              <div className="bar-bg">
                <div id="bar-atendidos" className="bar-fill" style={{ width: calcularPercentagem(metricas.atendidos) }}></div>
              </div>
            </div>
            
            <div className="bar-group">
              <div className="bar-label"><span>Pendente (Cliente)</span><span>{metricas.pendentes}</span></div>
              <div className="bar-bg">
                <div id="bar-pendentes" className="bar-fill" style={{ width: calcularPercentagem(metricas.pendentes) }}></div>
              </div>
            </div>
            
            <div className="bar-group">
              <div className="bar-label"><span>Resolvido / Fechado</span><span>{metricas.fechados}</span></div>
              <div className="bar-bg">
                <div id="bar-fechados" className="bar-fill" style={{ width: calcularPercentagem(metricas.fechados) }}></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
