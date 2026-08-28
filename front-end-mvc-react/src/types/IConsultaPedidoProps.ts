export interface IConsultaPedidosProps {
  onNovoPedido: () => void; // 👈 Callback para avisar o pai que o botão foi clicado
  contractId: number;
}