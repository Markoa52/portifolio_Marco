import type { PaginaTipo } from "../components/contrato";
export interface IMenuMobileProps {
    setIdContratoSelecionado: (id: number) => void;
    setAbaAtiva: (aba: any) => void;
    setPayloadGlobal: (payload: any) => void;
    setPaginaAtiva: (pagina: PaginaTipo) => void; // <-- Modifique para 'any' aqui
    usuario: any;
    onLogoff:() =>void;
    usuarioLogado: any
}
