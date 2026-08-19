import { RespostaViaCep } from '../models/apiExternaModel'; // Importando do arquivo separadoS

export class ApiExternaServices {
    // 1. Tipagem do parâmetro 'cep' como string e retorno definido como uma Promise com a interface
    async obterDadosApi(cep: any): Promise<RespostaViaCep> {
        try {
            const url = `https://viacep.com.br/ws/${cep}/json/`;

            // Utiliza o Fetch nativo (Disponível a partir do Node 18+)
            const retornoAPI = await fetch(url);

            if (!retornoAPI.ok) {
                throw new Error(`Erro na Brasil API: Status ${retornoAPI.status}`);
            }

            // O método .json() agora assume o formato da nossa interface estruturada
            const dados = await retornoAPI.json() as RespostaViaCep;

            return dados;

        } catch (erro: any) {
            console.error("Erro ao conectar na Brasil API dentro da Model:", erro.message);
            throw erro;
        }
    }
}
