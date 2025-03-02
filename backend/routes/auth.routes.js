const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verifyTwoFactor);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);

// Two-factor authentication setup
router.post('/enable-2fa', verifyToken, authController.enableTwoFactor);
router.post('/disable-2fa', verifyToken, authController.disableTwoFactor);
router.get('/generate-2fa-secret', verifyToken, authController.generateTwoFactorSecret);

module.exports = router;
