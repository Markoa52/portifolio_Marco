export interface InputsFormularioCadastroContrato {
cnpj: string;
nomeEmpresa: string;
telefone: string;
email: string;
responsavelLegal: string;

cep: string;
rua: string;
numero: string;
bairro: string;
cidade: string;
estado: string;
complemento: string;

dataInicio: string;
corteFaturamentoTipo: number;
planoComercializado: number;
valorMensalidade: number;
valorTag: number;
planoPagamentoTipo: number;
diaFaturamentoTipo: number;
diaSemana: number,
prazoPagamento: number;
}