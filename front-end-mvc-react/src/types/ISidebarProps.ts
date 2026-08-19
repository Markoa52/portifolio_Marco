export interface ISidebarProps {
  // 👇 ADICIONADO O "| "atendimento"" NO FINAL DE AMBAS AS LINHAS:
  paginaAtiva: "visao-geral" | "gerenciador" | "dashboard" | "consumoAPI" | "contrato" | "atendimento";
  setPaginaAtiva: (pagina: "visao-geral" | "gerenciador" | "dashboard" | "consumoAPI" | "contrato" | "atendimento") => void;
}
