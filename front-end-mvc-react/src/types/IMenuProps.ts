import type { PaginaTipo } from "../components/contrato";

export interface IMenuProps {
  setIdContratoSelecionado: (id: number) => void;
  setPayloadGlobal: (payload: any) => void;
  setPaginaAtiva: (pagina: PaginaTipo) => void; // <-- Modifique para 'any' aqui
  usuario:() =>void;
  onLogoff:() =>void;
  idContratoSelecionado: number | null
  
}