const express = require('express');
const router = express.Router();

// Temporary controller for testing
const accountController = {
  getAccounts: (req, res) => {
    res.json({
      status: 'success',
      data: [
        {
          id: 'acc-usd-001',
          type: 'USD',
          accountNumber: '60428',
          balance: 10000.00,
          currency: 'USD',
          status: 'active',
          createdAt: new Date()
        },
        {
          id: 'acc-eur-001',
          type: 'EUR',
          accountNumber: '60429',
          balance: 8500.00,
          currency: 'EUR',
          status: 'active',
          createdAt: new Date()
        }
      ]
    });
  },
  getAccountById: (req, res) => {
    const accountId = req.params.id;
    res.json({
      status: 'success',
      data: {
        id: accountId,
        type: accountId.includes('usd') ? 'USD' : 'EUR',
        accountNumber: accountId.includes('usd') ? '60428' : '60429',
        balance: accountId.includes('usd') ? 10000.00 : 8500.00,
        currency: accountId.includes('usd') ? 'USD' : 'EUR',
        status: 'active',
        createdAt: new Date()
      }
    });
  },
  getMyAccounts: (req, res) => {
    // Mock data para a conta do administrador
    res.json({
      status: 'success',
      data: [
        {
          _id: 'admin-account-001',
          userId: {
            _id: 'admin-user-001',
            firstName: 'Admin',
            lastName: 'User'
          },
          type: 'CHECKING',
          accountNumber: '10001',
          balance: 50000.00,
          status: 'ACTIVE',
          createdAt: new Date()
        }
      ]
    });
  }
};

// Routes
router.get('/', accountController.getAccounts);
router.get('/my-accounts', accountController.getMyAccounts);
router.get('/:id', accountController.getAccountById);

module.exports = router;
