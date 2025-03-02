# Newcash Bank System

A complete banking system for Newcash Bank with API integration to FT Asset Management.

## Project Overview

This system provides a comprehensive banking platform with two main interfaces:
1. **Administrative Dashboard** - For account management, transaction monitoring, and administrative operations
2. **Client Portal** - For end users to manage their accounts and perform transactions

The system integrates with the FT Asset Management APIs for balance inquiries, transaction processing, and reservation management.

## Technology Stack

### Frontend
- React.js
- Material UI
- Redux for state management
- Axios for API communication

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
newcash-bank-system/
├── frontend/             # React frontend application
│   ├── public/           # Static files
│   └── src/              # Source files
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── services/     # API services
│       ├── utils/        # Utility functions
│       ├── assets/       # Images, fonts, etc.
│       └── context/      # Context providers
├── backend/              # Node.js backend application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   └── utils/            # Utility functions
└── docs/                 # Documentation files
```

## API Integration

The system integrates with the following FT Asset Management APIs:
- Reservation API
- Confirmation API
- Receiving API
- Send API

## Features

### Authentication System
- Secure login with two-factor authentication
- Different access levels (admin and client)
- Password recovery
- Account locking after unsuccessful attempts
- Session timeout due to inactivity

### Admin Dashboard
- System metrics overview
- Transaction graphs
- Security alerts
- API integration status
- Account management
- Transaction monitoring
- System configuration

### Client Portal
- Balance summary
- Recent transactions
- Personalized alerts
- Available limits
- Transfer functionality
- Reservation management
- Receipt confirmation
- Transaction history
- Profile management

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run start
```

## Security Features
- End-to-end encryption
- Protection against SQL Injection and XSS
- Access auditing
- HTTPS implementation for all communications

## License
[Specify License]

## Contact
[Contact Information]

## FTNEWCASHDE

Sistema bancário para transferências internacionais em USD e EUR.

## Funcionalidades

- Transferências em USD e EUR
- Reservas de transferência
- Confirmação de transferências
- Recebimento de transferências
- Segurança e isolamento de contas

## Estrutura do Projeto

```
/frontend           # Frontend React
  /src             
    /services      # Serviços e APIs
    /store         # Redux store
    /tests         # Testes
  /public          # Arquivos estáticos
/docs              # Documentação
  API.md           # Documentação das APIs
  FRONTEND.md      # Documentação do frontend
```

## Contas do Sistema

- USD: `42226` - Para transferências em dólar
- EUR: `42227` - Para transferências em euro

## APIs

- `/Reservation.asp` - Criar reserva
- `/Send.asp` - Enviar transferência
- `/Reservation_confirmation.asp` - Confirmar transferência
- `/receiving.asp` - Receber transferências

## Como Desenvolver

1. Instalar dependências:
```bash
cd frontend
npm install
```

2. Rodar em desenvolvimento:
```bash
npm start
```

3. Rodar testes:
```bash
npm test
```

## Documentação

- [API.md](docs/API.md) - Documentação completa das APIs
- [FRONTEND.md](docs/FRONTEND.md) - Documentação do frontend
