const LoggerService = require('../services/logger.service');
const jwt = require('jsonwebtoken');

/**
 * Middleware para registrar atividades de usuários
 * Captura informações do usuário autenticado e registra suas ações
 */
const userActivityMiddleware = (action) => {
  return async (req, res, next) => {
    try {
      // Em ambiente de desenvolvimento, ignorar o registro de atividades
      if (process.env.NODE_ENV === 'development') {
        console.log(`Ambiente de desenvolvimento: Ignorando registro de atividade "${action}"`);
        return next();
      }
      
      // Extrai o token de autenticação do cabeçalho
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        let userId = 'unknown';
        
        // Verifica se é um token simulado
        if (token.startsWith('user_')) {
          userId = token.includes('admin') ? 'admin-user' : 'client-user';
        } else {
          try {
            // Decodifica o token para obter o ID do usuário
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'newcash-bank-system-secret');
            userId = decoded.id;
          } catch (jwtError) {
            console.warn('Erro ao decodificar token JWT:', jwtError.message);
            // Continua com userId = 'unknown'
          }
        }
        
        // Prepara os detalhes da atividade
        const details = {
          method: req.method,
          path: req.originalUrl || req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          params: req.params,
          query: req.query,
          // Não incluímos o body completo para evitar dados sensíveis
          // Apenas incluímos campos específicos se necessário
          bodyFields: Object.keys(req.body || {})
        };
        
        // Registra a atividade do usuário
        await LoggerService.logUserActivity(action, userId, details, req);
      }
      
      // Continua com a requisição
      next();
    } catch (error) {
      // Em caso de erro, apenas registra o erro e continua
      // Não queremos que falhas no log bloqueiem a aplicação
      console.error('Erro ao registrar atividade do usuário:', error);
      next();
    }
  };
};

module.exports = userActivityMiddleware;
