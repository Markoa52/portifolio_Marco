//import type { IEmailRegistro } from ".";


// 1. Defina a interface com as propriedades que o componente vai receber do App.tsx
export interface IContratoProps {
  payloadEnvio: any; // 👈 Adicione esta linha exata!
  setPaginaAtiva: (pagina: any) => void;
  paginaAtiva: string;
  setIdContratoSelecionado: (id: number) => void;
  setPayloadGlobal: (payload: any) => void;
  usuarioLogado: any;
}