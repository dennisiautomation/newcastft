const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const userActivityMiddleware = require('../middleware/user-activity.middleware');

// Temporary controller for testing
const transactionController = {
  getTransactions: (req, res) => {
    // Mock data para transações
    const transactions = [
      {
        _id: 'trans-001',
        type: 'DEPOSIT',
        amount: 1500.00,
        description: 'Depósito inicial',
        status: 'COMPLETED',
        accountId: {
          _id: 'acc-001',
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date()
      },
      {
        _id: 'trans-002',
        type: 'TRANSFER',
        amount: -500.00,
        description: 'Transferência para Maria',
        status: 'COMPLETED',
        accountId: {
          _id: 'acc-001',
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date(Date.now() - 86400000) // 1 dia atrás
      },
      {
        _id: 'trans-003',
        type: 'PAYMENT',
        amount: -120.50,
        description: 'Pagamento de conta',
        status: 'COMPLETED',
        accountId: {
          _id: 'acc-001',
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date(Date.now() - 172800000) // 2 dias atrás
      }
    ];

    // Aplicar filtros se fornecidos na query
    let filteredTransactions = [...transactions];
    
    if (req.query.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === req.query.type);
    }
    
    if (req.query.status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === req.query.status);
    }
    
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= startDate);
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) <= endDate);
    }

    res.json({
      status: 'success',
      data: filteredTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: Math.ceil(filteredTransactions.length / (parseInt(req.query.limit) || 10))
      }
    });
  },
  
  getAccountTransactions: (req, res) => {
    const accountId = req.params.accountId;
    
    // Mock data para transações de uma conta específica
    const transactions = [
      {
        _id: 'trans-001',
        type: 'DEPOSIT',
        amount: 1500.00,
        description: 'Depósito inicial',
        status: 'COMPLETED',
        accountId: {
          _id: accountId,
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date()
      },
      {
        _id: 'trans-002',
        type: 'TRANSFER',
        amount: -500.00,
        description: 'Transferência para Maria',
        status: 'COMPLETED',
        accountId: {
          _id: accountId,
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date(Date.now() - 86400000) // 1 dia atrás
      },
      {
        _id: 'trans-003',
        type: 'PAYMENT',
        amount: -120.50,
        description: 'Pagamento de conta',
        status: 'COMPLETED',
        accountId: {
          _id: accountId,
          accountNumber: '10001'
        },
        userId: {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva'
        },
        createdAt: new Date(Date.now() - 172800000) // 2 dias atrás
      }
    ];

    // Aplicar filtros se fornecidos na query
    let filteredTransactions = [...transactions];
    
    if (req.query.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === req.query.type);
    }
    
    if (req.query.status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === req.query.status);
    }
    
    if (req.query.startDate) {
      const startDate = new Date(req.query.startDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= startDate);
    }
    
    if (req.query.endDate) {
      const endDate = new Date(req.query.endDate);
      filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) <= endDate);
    }

    res.json({
      status: 'success',
      data: filteredTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        totalPages: Math.ceil(filteredTransactions.length / (parseInt(req.query.limit) || 10))
      }
    });
  },
  
  createTransaction: (req, res) => {
    const transactionId = 'tx-' + Math.floor(Math.random() * 1000);
    const transaction = {
      id: transactionId,
      ...req.body,
      status: 'pending',
      createdAt: new Date()
    };
    
    // Registrar a transação no log de atividades
    const LoggerService = require('../services/logger.service');
    LoggerService.logTransactionActivity(
      'create_transaction', 
      transactionId, 
      req.user?.id, 
      {
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        accountId: transaction.accountId
      }
    );
    
    res.json({
      status: 'success',
      message: 'Transaction created successfully',
      data: transaction
    });
  }
};

// Routes
router.get('/', verifyToken, userActivityMiddleware('view_transactions'), transactionController.getTransactions);
router.get('/account/:accountId', verifyToken, userActivityMiddleware('view_account_transactions'), transactionController.getAccountTransactions);
router.post('/', verifyToken, userActivityMiddleware('create_transaction'), transactionController.createTransaction);

module.exports = router;
