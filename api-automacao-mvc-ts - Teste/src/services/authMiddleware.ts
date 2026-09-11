import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estenda a tipagem do Express se quiser que o TypeScript reconheça o req.user sem avisos
export interface CustomRequest extends Request {
  user?: any;
}

export class AuthMiddleware {
  // Guardamos a chave secreta de forma encapsulada na classe
  private readonly JWT_SECRET = 'SuaChaveSecretaSuperProtegida123';

  /**
   * Método de verificação JWT estruturado em formato Arrow Function 
   * para não perder o escopo do "this" quando o Express acionar o gatilho.
   */
  public verificarJWT = (req: any, res: any, next: any) => {
    // A MÁGICA DA LISTA BRANCA: Se a rota for de login ou primeiro acesso, ignora o token!
    const urlAtual = req.originalUrl || req.url;
    
    if (urlAtual.includes('/auth/login') || urlAtual.includes('/auth/primeiro-acesso') || urlAtual.includes('/auth/validarUsuario') || urlAtual.includes('auth/confimarMFA') ){
      console.log(`[Middleware] Rota pública liberada sem token: ${urlAtual}`);
      return next(); // Libera a esteira sem checar cabeçalhos
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrai o hash após o 'Bearer'

    if (!token) {
      // STATUS 401: Avisa o frontend que não há sessão ativa
      return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, this.JWT_SECRET, (err: any, usuarioDecodificado: any) => {
      if (err) {
        // Diferenciação inteligente: se o erro for de expiração, avisa no log
        if (err.name === 'TokenExpiredError') {
          console.warn(`[Middleware] Sessão expirada para o token enviado em: ${urlAtual}`);
          // RETORNA 401: Este número vai disparar o "localStorage.clear()" no seu Frontend!
          return res.status(401).json({ erro: 'Sessão expirada. Por favor, faça login novamente.' });
        }

        // Se for outro erro (token modificado, assinatura errada), também manda 401 para deslogar por segurança
        return res.status(401).json({ erro: 'Token inválido ou corrompido.' });
      }

      req.user = usuarioDecodificado; 
      next(); 
    });
  };
}

// Exportamos uma instância única (Singleton) pronta para uso nas rotas
export const authMiddlewareInstance = new AuthMiddleware();
