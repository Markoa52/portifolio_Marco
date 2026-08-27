import type { IEmailRegistro } from ".";
import type { AbaInferior, PaginaTipo } from "../components/contrato";

export interface IGerenciadorProps {
  dadosIniciais?: IEmailRegistro[];
  setPaginaAtiva?: (pagina: PaginaTipo) => void;
  setAbaAtiva?: (aba: AbaInferior) => void;
}