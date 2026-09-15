import { Database } from '../config/sqlLiteConfig'; // Garanta que aponta para o seu arquivo central com path.join

export class usuarioRepository {

  async buscarUsuariosDownload(): Promise<any> {
    try {
      const db = await Database.getConnection();
      
      // db.get() busca apenas UM registro e retorna um objeto literal direto (ou undefined)
      // Tabela ajustada para 'contrato' conforme seu script de criação

    const resultado = await db.all(`
    SELECT 
      id,
      nome,
      usuario,
      email,
      ativo,
      dataCriacao,
      perfil
    FROM usuario
    ORDER BY id
  `, []);

  return resultado || [];
  
    } catch (erro) {
      console.error("Erro na consulta buscaDadosDoContrato do repositório:", erro);
      throw erro;
    }
  }
}