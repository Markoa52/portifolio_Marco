// Interface para mapear a resposta que o ViaCEP devolve
export interface RespostaViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // Opcional, pois o ViaCEP envia quando o CEP não existe
}