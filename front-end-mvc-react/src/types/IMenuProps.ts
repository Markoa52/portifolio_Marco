import type { PaginaTipo } from "../components/contrato";

export interface IMenuProps {
  setIdContratoSelecionado: (id: string) => void;
  setPayloadGlobal: (payload: any) => void;

    setAbaAtiva: (aba: any) => void;
    setPaginaAtiva: (pagina: PaginaTipo) => void; // <-- Modifique para 'any' aqui
}