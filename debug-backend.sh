#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Parar todos os processos
log "Parando processos..."
pm2 delete all
killall node 2>/dev/null

# Limpar diretório do backend
cd /var/www/newcashbank/backend
log "Limpando node_modules..."
rm -rf node_modules package-lock.json

# Criar arquivo server.js básico
log "Criando servidor básico..."
cat > server.js << 'EOL'
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Rotas simuladas
const routes = ['ftApi', 'account', 'transaction', 'reservation', 'admin'];

routes.forEach(route => {
    app.get(`/api/${route}/test`, (req, res) => {
        res.json({
            status: 'ok',
            route: route,
            message: `Rota ${route} funcionando`
        });
    });
});

// Dados simulados para teste
app.get('/api/account/balance', (req, res) => {
    res.json({
        usd_account: '60428',
        eur_account: '60429',
        usd_balance: 1000000.00,
        eur_balance: 850000.00
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
EOL

# Criar package.json básico
log "Configurando package.json..."
cat > package.json << 'EOL'
{
  "name": "newcashbank-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOL

# Instalar dependências
log "Instalando dependências..."
npm install

# Testar servidor diretamente
log "Testando servidor Node.js..."
node server.js &
sleep 5

# Verificar se está rodando
curl http://localhost:3001/api/health

# Matar processo de teste
killall node

# Iniciar com PM2
log "Iniciando com PM2..."
pm2 start server.js --name newcashbank-backend
pm2 save

log "Teste as rotas com:"
log "curl http://localhost:3001/api/health"
log "curl http://localhost:3001/api/account/balance"
