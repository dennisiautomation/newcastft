const express = require('express');
const router = express.Router();
let authController;

// Tentar conectar ao MongoDB
try {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  authController = require('../controllers/auth.controller');
  console.log('Usando controlador de autenticação padrão (MongoDB)');
} catch (error) {
  // Se não conseguir conectar, usar controlador mock
  authController = require('../controllers/auth.mock.controller');
  console.log('Usando controlador de autenticação mock (offline mode)');
}

const { verifyToken } = require('../middleware/auth.middleware');
const userActivityMiddleware = require('../middleware/user-activity.middleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', userActivityMiddleware('login'), authController.login);
router.post('/verify-2fa', userActivityMiddleware('verify_2fa'), authController.verifyTwoFactor);
router.post('/refresh-token', userActivityMiddleware('refresh_token'), authController.refreshToken);
router.post('/logout', verifyToken, userActivityMiddleware('logout'), authController.logout);

// Password management
router.post('/forgot-password', userActivityMiddleware('forgot_password'), authController.forgotPassword);
router.post('/reset-password', userActivityMiddleware('reset_password'), authController.resetPassword);
router.post('/change-password', verifyToken, userActivityMiddleware('change_password'), authController.changePassword);

// Two-factor authentication setup
router.post('/enable-2fa', verifyToken, userActivityMiddleware('enable_2fa'), authController.enableTwoFactor);
router.post('/disable-2fa', verifyToken, userActivityMiddleware('disable_2fa'), authController.disableTwoFactor);
router.get('/generate-2fa-secret', verifyToken, userActivityMiddleware('generate_2fa_secret'), authController.generateTwoFactorSecret);

module.exports = router;
