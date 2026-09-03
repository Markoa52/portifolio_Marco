// 1. Como a página busca os próprios dados, deixamos a prop 'dados' como opcional ou limpamos
import type { AbaInferior, PaginaTipo } from "../components/contrato";

export interface IVisaoGeralProps {
    payloadEnvio: any; 
    dados?: any[]; 
    setPaginaAtiva?: (pagina: PaginaTipo) => void;
    contractId: number;
    setAbaAtiva?: (aba: AbaInferior) => void;
    setIdContratoSelecionado: (id: number) => void;
    setPayloadGlobal: (payload: any) => void;
}