# NewCash Bank System

Sistema bancário integrado com FT Asset Management, desenvolvido para o NewCash Bank.

## Estrutura do Projeto

```
newcastft/
├── backend/              # Servidor Node.js/Express
│   ├── routes/          # Rotas da API
│   ├── server.js        # Configuração do servidor
│   └── .env            # Variáveis de ambiente
├── frontend/            # Interface React
│   └── build/          # Build otimizado
└── scripts/            # Scripts de deploy
    ├── fix-vps.sh
    ├── fix-backend.sh
    ├── fix-nginx.sh
    └── fix-ssl.sh
```

## Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: React (tema preto e branco)
- **Servidor**: Nginx + SSL
- **Banco de Dados**: MongoDB (modo offline disponível)
- **API Externa**: FT Asset Management

## Contas Configuradas

- USD Account: 60428
- EUR Account: 60429

## Credenciais de Acesso

- **Admin**:
  - Email: admin@newcashbank.com.br
  - Senha: admin123

- **Cliente**:
  - Email: cliente@newcashbank.com.br
  - Senha: cliente1

## Processo de Deploy

1. **Preparação do Servidor**
   ```bash
   ./fix-vps.sh        # Configura ambiente básico
   ./fix-backend.sh    # Configura Node.js e PM2
   ./fix-nginx.sh      # Configura Nginx
   ./fix-ssl.sh        # Configura HTTPS
   ```

2. **Configurações de Segurança**
   - SSL/TLS via Let's Encrypt
   - HTTPS forçado
   - Headers de segurança otimizados
   - Timeouts adequados para operações bancárias

3. **Integração FT Asset Management**
   - Rotas implementadas em `/backend/routes/ftApi.routes.js`
   - Contas USD e EUR configuradas
   - Endpoints de transferência e consulta

4. **Monitoramento**
   - PM2 para gestão de processos
   - Logs do Nginx em `/var/log/nginx/`
   - Logs do backend via PM2

## Acesso ao Sistema

- **Produção**: https://global.newcashbank.com.br
- **API**: https://global.newcashbank.com.br/api

## Manutenção

1. **Renovação SSL**
   - Automática via cron
   - Verificar: `certbot renew --dry-run`

2. **Logs**
   ```bash
   pm2 logs newcashbank-backend    # Logs do backend
   tail -f /var/log/nginx/*.log    # Logs do Nginx
   ```

3. **Reiniciar Serviços**
   ```bash
   pm2 restart newcashbank-backend
   systemctl restart nginx
   ```

## Identidade Visual

- Cores: Preto e branco
- Logo: https://newcashbank.com.br/assets/images/logo-TBMb_ZBJ.png
- CEO: Helio Pereira (helio@newcashbank.com.br)

## Suporte

Para questões técnicas, contate a equipe de TI do NewCash Bank.

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
npm install --legacy-peer-deps
npm run start
```

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run start
```

### Environment Variables
The backend requires the following environment variables in a `.env` file:

```
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/newcash-bank
MONGODB_OFFLINE_MODE=false

# JWT Configuration
JWT_SECRET=newcash-bank-jwt-super-secret-key-2025
JWT_EXPIRATION=24h

# FT API Configuration
FT_API_BASE_URL=https://api.ftassetmanagement.com/v1
FT_API_KEY=your-api-key-here
USD_ACCOUNT=123456789
EUR_ACCOUNT=987654321

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=notifications@newcash.com
EMAIL_PASS=your-email-password
```

## Deployment

For production deployment, follow these steps:

1. Clone the repository
2. Configure environment variables
3. Build the frontend
4. Set up MongoDB
5. Configure Nginx as a reverse proxy
6. Use PM2 for process management

Detailed deployment instructions are available in the [DEPLOY.md](DEPLOY.md) file.

### Quick Deployment

For quick deployment to a VPS, you can use the provided deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Build the frontend
- Transfer files to the VPS
- Set up MongoDB, Nginx, and PM2
- Start the application

## MongoDB Configuration

The system requires MongoDB to be running. If you encounter connection issues, you can:

1. Ensure MongoDB is installed and running:
   ```bash
   systemctl status mongod
   ```

2. Start MongoDB if it's not running:
   ```bash
   systemctl start mongod
   ```

3. Run the MongoDB setup script:
   ```bash
   chmod +x setup-mongodb.sh
   ./setup-mongodb.sh
   ```

4. If necessary, enable offline mode by setting `MONGODB_OFFLINE_MODE=true` in the `.env` file.

## Default Users

After installation, the system comes with two default users:

1. **Admin User**
   - Email: admin@newcash.com
   - Password: Admin@123

2. **Client User**
   - Email: cliente@newcash.com
   - Password: Cliente@123

## Troubleshooting

### MongoDB Connection Issues
If you encounter MongoDB connection errors:
- Verify MongoDB is running
- Check the connection string in `.env`
- Run the `setup-mongodb.sh` script
- Consider using offline mode temporarily

### NPM Dependency Errors
If you encounter npm dependency conflicts:
- Use the `--legacy-peer-deps` flag with npm install
- Update to compatible package versions

## Security Considerations

For production environments:
- Change default passwords
- Use HTTPS
- Configure a firewall
- Set up regular database backups
- Rotate JWT secrets periodically

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

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
