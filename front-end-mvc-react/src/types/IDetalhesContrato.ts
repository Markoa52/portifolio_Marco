// Interface para estruturar os dados do contrato que virão do banco
export interface IDetalhesContrato {
  Id: number;
  StartDate: string;           // 👈 Mude de Date para string
  EndDate: string | null;             // 👈 Mude de Date para string
  ContractModalityTypeId: number;
  BillingCode: number;
  PaymentTerm: number;
  TagMonthlyFeeUnitValue: number;
  ContractBillingCuttingId: number;
  RegistrationDate: string;    // 👈 Mude de Date para string
}