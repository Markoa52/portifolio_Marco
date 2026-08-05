// Interface para definir a estrutura esperada dentro do array do body
export interface ItemPayloadArquivo {
  TipoArquivo: string | number;
  [key: string]: any; // Permite outras propriedades dinâmicas da planilha
}