import type { IEmailRegistro } from ".";
import type { AbaInferior, PaginaTipo } from "../components/contrato";

export interface IGerenciadorProps {
  contractId: number;
  payloadEnvio: any;
  dadosIniciais?: IEmailRegistro[];
  setPaginaAtiva?: (pagina: PaginaTipo) => void;
  setAbaAtiva?: (aba: AbaInferior) => void;
  setIdContratoSelecionado: (id: number) => void;
  setPayloadGlobal: (payload: any) => void;
}