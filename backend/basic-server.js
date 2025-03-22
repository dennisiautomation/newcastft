const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servidor básico funcionando!',
    timestamp: new Date()
  });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Credenciais para teste
  const users = [
    {
      id: '1',
      email: 'admin@newcash.com',
      password: 'Admin@123',
      name: 'Administrador',
      role: 'admin',
      token: 'admin-token-123456'
    },
    {
      id: '2',
      email: 'shigemi.matsumoto@newcashbank.com.br',
      password: 'Eriyasu2023!',
      name: 'Cliente Teste',
      designation: '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka',
      company: 'ERIYASU.CO.LTD',
      address: '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka',
      tel: '+81642563266',
      passport: 'TR8340146',
      nationality: 'Japan',
      role: 'client',
      token: 'client-token-123456'
    }
  ];

  // Verificar credenciais
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Credenciais inválidas' 
    });
  }
  
  // Gerar token JWT (simulado)
  const token = user.token;
  
  // Responder com token e dados do usuário
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.role === 'client' && {
          designation: user.designation,
          company: user.company,
          address: user.address,
          tel: user.tel,
          passport: user.passport,
          nationality: user.nationality
        })
      }
    }
  });
});

// Rota para obter perfil do usuário
app.get('/api/users/profile', (req, res) => {
  // Simular dados do perfil
  res.json({
    status: 'success',
    data: {
      _id: 'user123',
      name: 'Usuário Teste',
      email: 'shigemi.matsumoto@newcashbank.com.br',
      role: 'client',
      lastLogin: new Date(),
      twoFactorEnabled: false,
      accounts: [
        {
          _id: 'acc-usd-001',
          type: 'USD',
          accountNumber: '60428',
          balance: 10000.00,
          currency: 'USD',
          status: 'active'
        },
        {
          _id: 'acc-eur-001',
          type: 'EUR',
          accountNumber: '60429',
          balance: 8500.00,
          currency: 'EUR',
          status: 'active'
        }
      ]
    }
  });
});

// Rota para buscar contas do usuário
app.get('/api/accounts/my-accounts', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        _id: 'acc-usd-001',
        type: 'USD',
        accountNumber: '60428',
        balance: 10000.00,
        currency: 'USD',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'acc-eur-001',
        type: 'EUR',
        accountNumber: '60429',
        balance: 8500.00,
        currency: 'EUR',
        status: 'active',
        createdAt: new Date()
      }
    ]
  });
});

// Rota para obter transações do usuário
app.get('/api/transactions', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        _id: 'trans-001',
        type: 'DEPOSIT',
        amount: 1500.00,
        description: 'Depósito inicial',
        status: 'COMPLETED',
        accountId: 'acc-usd-001',
        currency: 'USD',
        createdAt: new Date()
      },
      {
        _id: 'trans-002',
        type: 'TRANSFER',
        amount: -500.00,
        description: 'Transferência internacional',
        status: 'COMPLETED',
        accountId: 'acc-usd-001',
        currency: 'USD',
        createdAt: new Date(Date.now() - 86400000) // 1 dia atrás
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });
});

// Rota para o dashboard do cliente
app.get('/api/client/dashboard', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Responder com os dados do cliente
  res.json({
    status: 'success',
    data: {
      user: {
        name: 'Cliente Teste',
        designation: '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka',
        company: 'ERIYASU.CO.LTD',
        address: '6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka',
        tel: '+81642563266',
        passport: 'TR8340146',
        nationality: 'Japan'
      },
      accountSummary: {
        totalBalance: 0.00,
        pendingTransactions: 0,
        accounts: [
          {
            _id: 'acc-usd-client',
            type: 'USD',
            accountNumber: '60248-CLIENT',
            balance: 0.00,
            currency: 'USD',
            status: 'active'
          },
          {
            _id: 'acc-eur-client',
            type: 'EUR',
            accountNumber: '60429-CLIENT',
            balance: 0.00,
            currency: 'EUR',
            status: 'active'
          }
        ]
      },
      recentTransactions: [] // Sem transações para o cliente
    }
  });
});

// Rota para o dashboard do admin
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    status: 'success',
    data: {
      systemStatus: {
        usersCount: 25,
        activeAccounts: 42,
        pendingTransactions: 7,
        systemHealth: 'good'
      },
      recentActivity: [
        {
          _id: 'activity-001',
          type: 'USER_LOGIN',
          user: 'admin@newcash.com',
          details: 'Login administrativo',
          timestamp: new Date()
        },
        {
          _id: 'activity-002',
          type: 'ACCOUNT_CREATED',
          user: 'shigemi.matsumoto@newcashbank.com.br',
          details: 'Nova conta EUR criada',
          timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
        }
      ],
      alerts: [
        {
          _id: 'alert-001',
          severity: 'LOW',
          message: 'Atualização de sistema disponível',
          read: false,
          createdAt: new Date()
        }
      ]
    }
  });
});

// Rota para transações do cliente
app.get('/api/client/transactions', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Responder com uma lista vazia de transações
  res.json({
    status: 'success',
    data: {
      transactions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    }
  });
});

// Rota para testar conexões de API
app.get('/api/settings/test-connections', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Dados simulados de status de API
  const apiStatus = [
    {
      name: 'API de Reserva',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 150
    },
    {
      name: 'API de Confirmação',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 180
    },
    {
      name: 'API de Recebimento',
      status: 'degraded',
      lastCheck: new Date().toISOString(),
      responseTime: 450
    },
    {
      name: 'API de Envio',
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTime: 200
    }
  ];

  // Responder com os dados simulados
  res.json({
    success: true,
    data: apiStatus
  });
});

// Rota para buscar transações recentes
app.get('/api/transactions/recent', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Dados simulados de transações recentes
  const recentTransactions = [
    {
      _id: '60d21b4667d0d8992e610d01',
      type: 'transfer',
      amount: 1500.00,
      currency: 'USD',
      status: 'completed',
      description: 'Transferência para João Silva',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
      accountId: '60d21b4667d0d8992e610c90',
      accountNumber: '2001-001'
    },
    {
      _id: '60d21b4667d0d8992e610d02',
      type: 'deposit',
      amount: 3000.00,
      currency: 'USD',
      status: 'completed',
      description: 'Depósito via PIX',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
      accountId: '60d21b4667d0d8992e610c90',
      accountNumber: '2001-001'
    },
    {
      _id: '60d21b4667d0d8992e610d03',
      type: 'withdrawal',
      amount: 500.00,
      currency: 'USD',
      status: 'completed',
      description: 'Saque no caixa eletrônico',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
      accountId: '60d21b4667d0d8992e610c90',
      accountNumber: '2001-001'
    },
    {
      _id: '60d21b4667d0d8992e610d04',
      type: 'transfer',
      amount: 750.00,
      currency: 'EUR',
      status: 'completed',
      description: 'Transferência internacional',
      date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 dias atrás
      accountId: '60d21b4667d0d8992e610c91',
      accountNumber: '2001-002'
    },
    {
      _id: '60d21b4667d0d8992e610d05',
      type: 'payment',
      amount: 120.50,
      currency: 'USD',
      status: 'completed',
      description: 'Pagamento de conta de luz',
      date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 dias atrás
      accountId: '60d21b4667d0d8992e610c90',
      accountNumber: '2001-001'
    }
  ];

  // Responder com os dados simulados
  res.json({
    success: true,
    data: recentTransactions
  });
});

// Rotas para contas FT (simulando a conexão com a API da PT)
app.get('/api/ft-accounts/usd', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Verificar se o token é do admin (simulado)
  const token = authHeader.split(' ')[1];
  const isAdmin = token === 'admin-token-123456';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  // Dados reais da conta USD conectada à API da PT
  // Em produção, isso seria obtido através de uma chamada real à API
  res.json({
    status: 'success',
    data: {
      accountNumber: '60248', // Valor correto do arquivo .env
      accountType: 'USD',
      externalAccountId: '60248', // Valor correto do arquivo .env
      balance: 1250000.75, // Saldo real da conta USD
      status: 'active',
      lastActivity: new Date().toISOString(),
      apiSource: 'FT Asset Management',
      apiStatus: 'connected'
    }
  });
});

app.get('/api/ft-accounts/eur', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Verificar se o token é do admin (simulado)
  const token = authHeader.split(' ')[1];
  const isAdmin = token === 'admin-token-123456';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  // Dados reais da conta EUR conectada à API da PT
  // Em produção, isso seria obtido através de uma chamada real à API
  res.json({
    status: 'success',
    data: {
      accountNumber: '60429',
      accountType: 'EUR',
      externalAccountId: '60429',
      balance: 875000.25, // Saldo real da conta EUR
      status: 'active',
      lastActivity: new Date().toISOString(),
      apiSource: 'FT Asset Management',
      apiStatus: 'connected'
    }
  });
});

app.get('/api/ft-accounts/usd/transactions', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Verificar se o token é do admin (simulado)
  const token = authHeader.split(' ')[1];
  const isAdmin = token === 'admin-token-123456';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  // Dados reais de transações da conta USD
  // Em produção, isso seria obtido através de uma chamada real à API
  const transactions = [
    {
      id: 'ft-usd-1',
      type: 'DEPOSIT',
      amount: 500000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 dias atrás
      description: 'Initial Investment - FT Asset Management',
      status: 'completed',
      currency: 'USD',
      reference: 'REF-PT-60428-001'
    },
    {
      id: 'ft-usd-2',
      type: 'DEPOSIT',
      amount: 750000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 dias atrás
      description: 'Additional Investment - FT Asset Management',
      status: 'completed',
      currency: 'USD',
      reference: 'REF-PT-60428-002'
    },
    {
      id: 'ft-usd-3',
      type: 'WITHDRAWAL',
      amount: 25000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 dias atrás
      description: 'Client Withdrawal - SHIGEMI MATSUMOTO',
      status: 'completed',
      currency: 'USD',
      reference: 'REF-PT-60428-003'
    },
    {
      id: 'ft-usd-4',
      type: 'INTEREST',
      amount: 25000.75,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 dia atrás
      description: 'Interest Payment - FT Asset Management',
      status: 'completed',
      currency: 'USD',
      reference: 'REF-PT-60428-004'
    }
  ];

  res.json({
    status: 'success',
    data: transactions
  });
});

app.get('/api/ft-accounts/eur/transactions', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Verificar se o token é do admin (simulado)
  const token = authHeader.split(' ')[1];
  const isAdmin = token === 'admin-token-123456';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso não autorizado'
    });
  }

  // Dados reais de transações da conta EUR
  // Em produção, isso seria obtido através de uma chamada real à API
  const transactions = [
    {
      id: 'ft-eur-1',
      type: 'DEPOSIT',
      amount: 300000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), // 45 dias atrás
      description: 'Initial Investment - FT Asset Management',
      status: 'completed',
      currency: 'EUR',
      reference: 'REF-PT-60429-001'
    },
    {
      id: 'ft-eur-2',
      type: 'DEPOSIT',
      amount: 575000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 dias atrás
      description: 'Additional Investment - FT Asset Management',
      status: 'completed',
      currency: 'EUR',
      reference: 'REF-PT-60429-002'
    },
    {
      id: 'ft-eur-3',
      type: 'WITHDRAWAL',
      amount: 15000.00,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 dias atrás
      description: 'Client Withdrawal - SHIGEMI MATSUMOTO',
      status: 'completed',
      currency: 'EUR',
      reference: 'REF-PT-60429-003'
    },
    {
      id: 'ft-eur-4',
      type: 'INTEREST',
      amount: 15000.25,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 dias atrás
      description: 'Interest Payment - FT Asset Management',
      status: 'completed',
      currency: 'EUR',
      reference: 'REF-PT-60429-004'
    }
  ];

  res.json({
    status: 'success',
    data: transactions
  });
});

// Rota para alterar senha
app.post('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }
  
  // Simulação de verificação de senha atual
  // Em um ambiente real, você verificaria a senha no banco de dados
  if (currentPassword !== 'Eriyasu2023!' && currentPassword !== 'Admin@123') {
    return res.status(400).json({
      success: false,
      message: 'Senha atual incorreta'
    });
  }
  
  // Em um ambiente real, você salvaria a nova senha no banco de dados
  // Aqui apenas simulamos uma resposta de sucesso
  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});

// Rota para buscar contas (admin)
app.get('/api/accounts', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Dados simulados de contas
  const mockAccounts = [
    {
      _id: '60d21b4667d0d8992e610c85',
      accountNumber: '1001-001',
      userId: '60d21b4667d0d8992e610c01',
      userName: 'João Silva',
      type: 'Corrente',
      currency: 'USD',
      balance: 25000.75,
      status: 'active',
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-03-20T14:15:00Z'
    },
    {
      _id: '60d21b4667d0d8992e610c86',
      accountNumber: '1001-002',
      userId: '60d21b4667d0d8992e610c02',
      userName: 'Maria Oliveira',
      type: 'Poupança',
      currency: 'EUR',
      balance: 15750.50,
      status: 'active',
      createdAt: '2023-01-20T11:45:00Z',
      updatedAt: '2023-03-18T09:30:00Z'
    },
    {
      _id: '60d21b4667d0d8992e610c87',
      accountNumber: '1001-003',
      userId: '60d21b4667d0d8992e610c03',
      userName: 'Carlos Mendes',
      type: 'Investimento',
      currency: 'BRL',
      balance: 50000.00,
      status: 'active',
      createdAt: '2023-02-05T14:20:00Z',
      updatedAt: '2023-03-15T16:45:00Z'
    },
    {
      _id: '60d21b4667d0d8992e610c88',
      accountNumber: '1001-004',
      userId: '60d21b4667d0d8992e610c04',
      userName: 'Ana Pereira',
      type: 'Corrente',
      currency: 'USD',
      balance: 8200.25,
      status: 'active',
      createdAt: '2023-02-10T09:15:00Z',
      updatedAt: '2023-03-19T10:30:00Z'
    },
    {
      _id: '60d21b4667d0d8992e610c89',
      accountNumber: '1001-005',
      userId: '60d21b4667d0d8992e610c05',
      userName: 'Roberto Santos',
      type: 'Poupança',
      currency: 'EUR',
      balance: 12500.75,
      status: 'inactive',
      createdAt: '2023-02-15T13:40:00Z',
      updatedAt: '2023-03-10T11:20:00Z'
    }
  ];

  // Responder com os dados simulados
  res.json({
    success: true,
    data: {
      accounts: mockAccounts,
      total: mockAccounts.length,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });
});

// Rota para buscar contas do usuário (cliente)
app.get('/api/accounts/user', (req, res) => {
  // Verificar token de autenticação
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de autenticação não fornecido' 
    });
  }

  // Dados simulados de contas do usuário
  const userAccounts = [
    {
      _id: '60d21b4667d0d8992e610c90',
      accountNumber: '2001-001',
      accountType: 'Corrente',
      balance: 0.00,
      currency: 'USD',
      status: 'active',
      owner: {
        _id: '2',
        name: 'Cliente Teste',
        email: 'shigemi.matsumoto@newcashbank.com.br'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 dias atrás
      lastActivity: new Date().toISOString()
    },
    {
      _id: '60d21b4667d0d8992e610c91',
      accountNumber: '2001-002',
      accountType: 'Poupança',
      balance: 0.00,
      currency: 'EUR',
      status: 'active',
      owner: {
        _id: '2',
        name: 'Cliente Teste',
        email: 'shigemi.matsumoto@newcashbank.com.br'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 dias atrás
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 dias atrás
    }
  ];

  // Responder com os dados simulados
  res.json({
    success: true,
    data: userAccounts
  });
});

// Rota para servir o frontend React (para qualquer outra rota)
app.get('*', (req, res) => {
  res.json({
    status: 'redirect',
    message: 'Esta rota não existe na API, mas seria redirecionada para o frontend React em produção'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor básico rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/api/health`);
  console.log('\nCredenciais para teste:');
  console.log('Cliente: shigemi.matsumoto@newcashbank.com.br/Eriyasu2023!');
  console.log('Admin: admin@newcash.com/Admin@123');
});
