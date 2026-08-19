import type { PaginaTipo } from "../components/contrato";


export interface IPerquisarContratoProps {
  setPaginaAtiva: (pagina: PaginaTipo) => void;
  setIdContratoSelecionado: (id: string) => void;
  // 👇 ADICIONE ESTA LINHA EXATA AQUI:
  setPayloadGlobal: (payload: any) => void; 
}