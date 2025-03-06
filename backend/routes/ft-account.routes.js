const express = require('express');
const router = express.Router();
const ftAccountController = require('../controllers/ft-account.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const userActivityMiddleware = require('../middleware/user-activity.middleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Rota para obter dados da conta USD (apenas admin)
router.get(
  '/usd',
  isAdmin,
  userActivityMiddleware('view_ft_usd_account'),
  ftAccountController.getUSDAccount
);

// Rota para obter dados da conta EUR (apenas admin)
router.get(
  '/eur',
  isAdmin,
  userActivityMiddleware('view_ft_eur_account'),
  ftAccountController.getEURAccount
);

// Rota para obter transações da conta USD (apenas admin)
router.get(
  '/usd/transactions',
  isAdmin,
  userActivityMiddleware('view_ft_usd_transactions'),
  ftAccountController.getUSDAccountTransactions
);

// Rota para obter transações da conta EUR (apenas admin)
router.get(
  '/eur/transactions',
  isAdmin,
  userActivityMiddleware('view_ft_eur_transactions'),
  ftAccountController.getEURAccountTransactions
);

// Rota para obter dados de uma conta específica por número
router.get(
  '/:accountNumber',
  userActivityMiddleware('view_ft_account'),
  ftAccountController.getAccountByNumber
);

// Rota para obter transações de uma conta específica
router.get(
  '/:accountNumber/transactions',
  userActivityMiddleware('view_ft_account_transactions'),
  ftAccountController.getAccountTransactions
);

module.exports = router;
