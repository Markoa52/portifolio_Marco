// Contrato estrito de como um registro de e-mail deve ser no nosso front-end
// Conteúdo completo do arquivo: src/types/index.ts
export interface IEmailRegistro {
  data: string;
  assunto: string;
  email: string;
  acoes: string;
}

// ADICIONADO: Contrato estrito para as métricas do GLPI
export interface IDashboardMetricas {
  naoAtendidos: number;
  atendidos: number;
  pendentes: number;
  fechados: number;
  tempoMedio: number;
}

// Contrato para acesso API externa Brasil API
export interface IConsumoApiBrasil{
  nome: string;
  valor: number;
}

export interface IConsumoApiCep{
  cep: number,
  logradouro: string,
  complemento: string,
  unidade: string,
  bairro: string,
  localidade: string,
  uf: string,
  estado: string,
  regiao: string,
  ibge: number,
  gia: number,
  ddd: number,
  siafi: number
}