import { DatabaseConnection } from '../config/sqlLiteConfig.js'; 
import { TagRepository } from '../repositories/tagRepository.js';

const tagRepository = new TagRepository(); 

export class tagServices {

  async processarCadastroRelacional(dadosDoPedido: any) {
    const payload = dadosDoPedido.payload || dadosDoPedido;
    const { js } = payload;
    //const {metadata, contextoTransferencia} = js;
    //const contratoIdReal = Number(contextoTransferencia.idContratoOrigem);
    
    const db = await DatabaseConnection.getConnection();

    try {
      // 1. Inicia a transação centralizada global (Controla todas as tabelas juntas)
      await db.exec('BEGIN TRANSACTION');

      let tagId=0;

      if (js.contextoTransferencia?.tipoAcao === 'transferirTag') {
        console.log('⏳ 1/1 Processando transferência de tag no banco...');
      
        // 1. Extraímos as variáveis do contexto correto que a fila enviou
        const { contratoDestinoId, tagId } = js.contextoTransferencia;
      
        // 2. Executa o UPDATE passando (Contrato Destino, ID da Tag)
        // O retorno será o número de linhas afetadas (1 para sucesso, 0 para falha)
        const linhasAfetadas = await tagRepository.atualizaTagTransferencia(
          Number(contratoDestinoId), 
          tagId
        );
      
        // 3. CORREÇÃO CRÍTICA: Validamos se a linha foi de fato atualizada (linhasAfetadas precisa ser > 0)
        if (!linhasAfetadas || linhasAfetadas === 0) {
          throw new Error(`Falha Crítica: A tag ID ${tagId} não foi encontrada ou não pôde ser transferida no SQLite. Abortando.`);
        }
      
        console.log(`1/1 Tag ID ${tagId} transferida com sucesso para o Contrato Destino ${contratoDestinoId}!`);
      }

      // console.log('⏳ 2/2 Vinculando Rastreamento do pedido...');
      // // 3. Injeta o ID do contrato dentro dos dados da empresa antes de criar
      // const datRegistro = metadata?.criadoEm || new Date().toISOString();
      // await tagRepository.criarPedidoRastreamento(datRegistro, Number(pedidoId));

      // 4. Se nenhuma query falhou em nenhuma tabela, confirma tudo no disco de vez!
      await db.exec('COMMIT');
      console.log(`\n🚀 [Sucesso Total] Todo o ecossistema foi salvo para a Person ID: ${tagId}`);
      return { sucesso: true, tagId };

    } catch (erro) {
      // 5. Se qualquer tabela falhar (ex: erro de tipo ou campo nulo), limpa e cancela TUDO
      await db.exec('ROLLBACK');
      console.error("↩️ [Rollback Executado] Transação cancelada por completo no SQLite.", erro);
      throw erro; 
    }
  }
}

export const cadastroPedidoService = new tagServices();
