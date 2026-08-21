export interface jobPayloadContrato{
    protocoloId: string;
    task: string;
    tipoArquivo: 'inserir' | 'consultar' | 'atualizar' | 'excluir';
    solicitadoEm: string;
    js: any[]; // Aceita o array de objetos vindo do seu Excel
}