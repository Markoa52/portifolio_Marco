import type { PaginaTipo } from "../components/contrato";

export interface IMenuHumProps {
    setAbaAtiva: (aba: any) => void;
    setPaginaAtiva: (pagina: PaginaTipo) => void; // <-- Modifique para 'any' aqui
}