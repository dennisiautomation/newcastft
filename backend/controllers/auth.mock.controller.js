/**
 * Controlador de autenticação para modo offline (sem MongoDB)
 */

const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, comparePassword } = require('../mock-data/users');
const logger = require('../utils/logger');

// Gerar token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'super-secret-key-for-development',
    { expiresIn: process.env.JWT_EXPIRATION || '1d' }
  );
};

// Gerar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super-secret-key-for-development',
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

// Login de usuário (modo offline)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Encontrar usuário pelo email
    const user = findUserByEmail(email);
    
    // Verificar se o usuário existe e a senha está correta
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha inválidos'
      });
    }
    
    // Verificar se a conta está ativa
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        status: 'error',
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }
    
    // Gerar tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Responder com dados do usuário e tokens
    res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyInfo: user.companyInfo,
          accountInfo: user.accountInfo
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Erro no login: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Erro durante o login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar token JWT (para autenticação)
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token não fornecido'
    });
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super-secret-key-for-development'
    );
    
    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário não encontrado'
      });
    }
    
    req.user = {
      id: user._id,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido ou expirado'
    });
  }
};

// Implementações mock das outras funções do controlador
exports.register = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Registro simulado com sucesso no modo offline'
  });
};

exports.refreshToken = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Refresh token simulado com sucesso'
  });
};

exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout realizado com sucesso'
  });
};

exports.forgotPassword = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Email de recuperação enviado com sucesso (simulado)'
  });
};

exports.resetPassword = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Senha redefinida com sucesso (simulado)'
  });
};

exports.changePassword = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Senha alterada com sucesso (simulado)'
  });
};

exports.verifyTwoFactor = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Verificação de dois fatores simulada com sucesso'
  });
};

exports.generateTwoFactorSecret = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Segredo de dois fatores gerado com sucesso (simulado)',
    data: {
      secret: 'MOCK_SECRET_KEY',
      qrCodeUrl: 'https://mock-qrcode-url.com'
    }
  });
};

exports.enableTwoFactor = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Autenticação de dois fatores habilitada com sucesso (simulado)'
  });
};

exports.disableTwoFactor = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Autenticação de dois fatores desabilitada com sucesso (simulado)'
  });
};
