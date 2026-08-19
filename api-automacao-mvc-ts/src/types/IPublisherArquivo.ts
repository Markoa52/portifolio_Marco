export interface jobPayload{
    protocoloId: string;
    task: string;
    tipoArquivo: 'pdf' | 'excel';
    solicitadoEm: string;
    js: any[]; // Aceita o array de objetos vindo do seu Excel
}