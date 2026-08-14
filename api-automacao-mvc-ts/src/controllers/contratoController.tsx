// // contratoController.js
// export class ContratoController {
//   constructor(contratoService) {
//     this.contratoService = contratoService;
//   }

//   // O método que a sua rota do Express vai chamar
//   async buscarPorId(req, res) {
//     try {
//       const { id } = req.params;
      
//       // Executa a lógica chamando o serviço
//       const resultado = await this.contratoService.obterDetalhesDoContrato(id);
      
//       return res.status(200).json(resultado);
//     } catch (erro) {
//       return res.status(400).json({ erro: erro.message });
//     }
//   }
// }
