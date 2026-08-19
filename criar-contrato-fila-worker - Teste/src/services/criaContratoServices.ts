import { Database } from '../config/sqlLiteConfig.js'; // Importa a sua nova classe de conexão
import { ContratoRepository } from '../repositories/cadastroContratoRepository.js' //ContratoRepository'; // Certifique-se de que o repositório exporta assim

const contratoRepository = new ContratoRepository(); 

class CriarContratoService {

  async processarCadastroRelacional(payload: any) {
    const { person, endereco, contrato, contatos } = payload;
    
    // Pega a conexão única do SQLite
    const db = await Database.getConnection();

    try {
      // 1. Inicia a transação centralizada aqui no Service
      await db.exec('BEGIN TRANSACTION');

      // 2. Cria as Condições Comerciais (Removemos o 'transaction' dos argumentos)
      await contratoRepository.criarContrato(contrato);

      // 3. Cria a Person e captura o ID gerado (lastID do SQLite)
      const personId = await contratoRepository.criarPerson(person);

      // 4. Cria o Endereço 
      await contratoRepository.criarEndereco(endereco);

      // 5. Cria os contatos se existirem, passando o personId capturado acima
      if (contatos && contatos.telefone) {
        await contratoRepository.criarContato('Telefone', contatos.telefone, personId);
      }
      if (contatos && contatos.email) {
        await contratoRepository.criarContato('Email', contatos.email, personId);
      }

      // 6. Se tudo deu certo, commita a transação salvando todas as tabelas juntas
      await db.exec('COMMIT');
      console.log(`[Service] Transação concluída com sucesso para a Person ID: ${personId}`);
      return { sucesso: true, personId };

    } catch (erro) {
      // 7. Se falhar em qualquer repositório, desfaz tudo o que foi feito acima
      await db.exec('ROLLBACK');
      console.error("[Service] Erro no processamento. Transação cancelada no SQLite.", erro);
      throw erro; 
    }
  }
}

export const cadastroContratoService = new CriarContratoService();
