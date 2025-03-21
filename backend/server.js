const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const LoggerService = require('./services/logger.service');
const apiLoggerMiddleware = require('./middleware/api-logger.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes by default
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Logger middleware - registra todas as chamadas de API
app.use('/api/ft', apiLoggerMiddleware());

// API routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes.js');
const accountRoutes = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');
const reservationRoutes = require('./routes/reservation.routes');
const ftApiRoutes = require('./routes/ftApi.routes');
const adminRoutes = require('./routes/admin.routes');
const securityRoutes = require('./routes/security.routes');

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/ft', ftApiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Registrar erro no serviço de log
  LoggerService.logSystemError(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Configuração para tentar conectar ao MongoDB primeiro, mas continuar funcionando se falhar
const startServer = async () => {
  // Verificar se o modo offline está ativado
  if (process.env.MONGODB_OFFLINE_MODE === 'true') {
    console.log('Modo offline ativado nas configurações. Iniciando servidor sem MongoDB...');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} em modo offline (sem MongoDB)`);
      console.log('Utilizando API FT em produção para dados em tempo real');
    });
    return;
  }

  try {
    // Tentar conectar ao MongoDB
    console.log('Tentando conectar ao MongoDB...');
    console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/newcash-bank'}`);
    
    // Tentar conexão com timeout mais curto
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newcash-bank', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000 // Timeout mais curto (3 segundos)
    }).catch(error => {
      console.log(`Erro na conexão do MongoDB: ${error.message}`);
      throw error; // Repassar o erro para o catch de fora
    });
    
    console.log('MongoDB conectado com sucesso');
    
    // Iniciar servidor após conectar ao MongoDB
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} com MongoDB`);
    });
  } catch (error) {
    // Se falhar a conexão com MongoDB, iniciar em modo offline
    console.log(`MongoDB connection error: ${error.message}`);
    console.log('Iniciando servidor em modo offline (sem MongoDB)...');
    
    // Iniciar o servidor sem esperar pelo MongoDB
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} em modo offline (sem MongoDB)`);
      console.log('Utilizando API FT em produção para dados em tempo real');
    });
  }
};

// Iniciar o servidor com tratamento de exceções global
try {
  console.log('Iniciando aplicação NewCash Bank System...');
  startServer();
} catch (err) {
  console.error('Erro fatal ao iniciar o servidor:', err);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = app; // For testing purposes
