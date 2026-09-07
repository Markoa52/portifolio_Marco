// src/types/contrato.types.ts

export interface DadosContratoWorker {
  cnpj: string;
  nomeEmpresa: string;
  telefone: string;
  email: string;
  responsavelLegal: string;
  
  cep: string;
  rua: string;
  numero: number;
  bairro: string;
  cidade: string;
  uf: string;
  complemento: string;

  dataInicio: string;
  corteFaturamento: number;
  planoComercializado: number; 
  valorMensalidade: number;
  valorTag: number;
  planoPagamento: number;
  diaFaturamento: number;
}

export interface PayloadFilaWorker {
  metadata: {
    protocoloId: string;
    acao: 'inserir';
    criadoEm: string;
  };
  dadosLimpos: DadosContratoWorker;
}
