import type { PaginaTipo } from "../components/contrato";


export interface IPerquisarContratoProps {
  setPaginaAtiva: (pagina: PaginaTipo) => void;
  setIdContratoSelecionado: (id: any) => void;
  // 👇 ADICIONE ESTA LINHA EXATA AQUI:
  setPayloadGlobal: (payload: any) => void; 
}