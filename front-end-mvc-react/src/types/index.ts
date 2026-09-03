// Contrato estrito de como um registro de e-mail deve ser no nosso front-end
// Conteúdo completo do arquivo: src/types/index.ts
export interface IEmailRegistro {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  status: string;
  data: string;
  perfil: string;
}

export interface IEmailRegistro2 {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  status: string;
  data: string;
  perfil: string;
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