export interface ITransacaoViagemInput {
  id: number;
  contratoId: number;
  valorTransacao: number;
  valorCobradoPedagio: number;
  valorCobradoValePedagio: number;
  valorReembolso: number;
  pracaPedagio: string;
  documentoEmbarcador: string;
  recargaValePedagioId: number;
  statusViagemTipo: string;
}
