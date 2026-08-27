export interface IVeiculo {
  placa: string;
  tag: string;
  status: 'Ativo' | 'Inativo' | 'Manutenção';
  dataAtivacao: string;
}