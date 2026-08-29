// Interface para estruturar as colunas pedidas
export interface IExtrato {
  id: string;
  placa: string;
  data: string;
  tipo: string;         /* Ex: Pedágio, Recarga, Taxa, Estorno */
  statusViagem: string; /* Ex: Confirmada, Contestada, Processando */
  valor: string;
}