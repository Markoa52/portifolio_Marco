// 1. Como a página busca os próprios dados, deixamos a prop 'dados' como opcional ou limpamos
import type { PaginaTipo } from "../components/contrato";

export interface IVisaoGeralProps {
    dados?: any[]; 
    setPaginaAtiva?: (pagina: PaginaTipo) => void;
}