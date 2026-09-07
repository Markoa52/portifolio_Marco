// Defina a interface do seu modelo de dados
interface contrato {
  id: number,
  dataInicio: string,
  CorteFaturamentoTipo: string,
  planoComercializadoTipo: string,
  valorMensalidade: number,
  valorTag: number,
  planoPagamentoTipo:string,
  diaFaturamento: number,
  cnjp: string 
}

interface person {
  id: number,
  documentNumber: string,
  nomeEmpresa: string,
  contractId: number
}

interface endereco {
  id: number,
  cep: string,
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string,
  complemento: string,
  personId: number,
  documentNumber: string
}

interface contato {
  id: number,
  telefone : string,
  email: string,
  personId : number
}

interface responsavelLegal {
  id: number,
  nome: string,
  personId: number
}

interface corteFaturamentoTipo {
  id: number;
  descricao: string
}

interface planoComercializadoTipo {
  id: number;
  descricao: string
}

interface planoPagamentoTipo {
  id: number;
  descricao: string
}

interface NovoContratoInput {
  id: number,
  cep: string,
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string,
  complemento: string,
  personId: number,
  documentNumber: string,
  tmContractId: number
}