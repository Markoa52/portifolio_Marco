export interface IVeiculo {
  modelo: string;
  placa: string;
  tag: string;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  dataAtivacao: string;
  contratoId: Number;
}