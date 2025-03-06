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
  windowMs: eval(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
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
const adminRoutes = require('./routes/admin.routes');
const ftApiRoutes = require('./routes/ftApi.routes');
const ftAccountRoutes = require('./routes/ft-account.routes');
const ftAccountTestRoutes = require('./routes/ft-account-test.routes'); 
const activityLogRoutes = require('./routes/activity-log.routes');
const statementRoutes = require('./routes/statement.routes');
const adminReportRoutes = require('./routes/admin-report.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ft', ftApiRoutes);
app.use('/api/ft-accounts', ftAccountRoutes);
app.use('/api/ft-test', ftAccountTestRoutes); 
app.use('/api/logs', activityLogRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/admin-reports', adminReportRoutes);

// Rota de teste direta para depuração
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Rota de teste direta funcionando!',
    data: {
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Registrar erro no sistema de logs
  LoggerService.logSystemError(err, { 
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB at:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Atualizar status de conexão no LoggerService
    LoggerService.setDbConnectionStatus(true);
    
    // Registrar conexão bem-sucedida no log
    // LoggerService.logSystemError('MongoDB connected successfully', {
    //   connectionString: process.env.MONGODB_URI?.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://*****:*****@')
    // });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    
    // Atualizar status de conexão no LoggerService
    LoggerService.setDbConnectionStatus(false);
    
    // Registrar erro de conexão no log
    // LoggerService.logSystemError(err, { 
    //   context: 'MongoDB Connection',
    //   connectionString: process.env.MONGODB_URI?.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://*****:*****@')
    // });
    
    // Não vamos encerrar o processo, permitindo que o servidor continue rodando
    console.log('Server will continue running without database logging');
  }
};

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Registrar inicialização do servidor no log
    // LoggerService.logSystemError(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`, {
    //   timestamp: new Date().toISOString()
    // });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  
  // Registrar rejeição não tratada no log
  // LoggerService.logSystemError(err, { 
  //   context: 'Unhandled Promise Rejection'
  // });
  
  // Close server & exit process
  // server.close(() => process.exit(1));
});

module.exports = app; // For testing purposes
