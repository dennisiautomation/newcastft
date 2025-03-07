#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Parar serviços
log "Parando serviços..."
pm2 delete all
systemctl stop nginx

# Configurar backend com autenticação
log "Configurando backend com autenticação..."
cd /var/www/newcashbank/backend

# Criar arquivo auth.js
cat > auth.js << 'EOL'
const users = {
    'admin@newcashbank.com.br': {
        password: 'admin123',
        role: 'admin',
        name: 'Administrador'
    },
    'cliente@newcashbank.com.br': {
        password: 'cliente1',
        role: 'client',
        name: 'Cliente'
    }
};

const authenticate = (email, password) => {
    const user = users[email];
    if (user && user.password === password) {
        const { password, ...userData } = user;
        return { success: true, user: userData };
    }
    return { success: false, message: 'Credenciais inválidas' };
};

module.exports = { authenticate };
EOL

# Atualizar server.js
cat > server.js << 'EOL'
const express = require('express');
const cors = require('cors');
const { authenticate } = require('./auth');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const result = authenticate(email, password);
    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
EOL

# Reinstalar dependências
log "Reinstalando dependências..."
rm -rf node_modules package-lock.json
npm install

# Iniciar backend
log "Iniciando backend..."
pm2 start server.js --name newcashbank-backend
pm2 save

# Configurar Nginx para aceitar qualquer domínio
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/newcashbank << 'EOL'
server {
    listen 80;
    server_name _;

    access_log /var/log/nginx/newcashbank.access.log;
    error_log /var/log/nginx/newcashbank.error.log;

    root /var/www/newcashbank/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Aumentar timeouts
        proxy_connect_timeout 120;
        proxy_send_timeout 120;
        proxy_read_timeout 120;
    }
}
EOL

# Reiniciar Nginx
log "Reiniciando Nginx..."
nginx -t && systemctl restart nginx

# Testar autenticação
log "\nTestando autenticação..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@newcashbank.com.br","password":"admin123"}'

# Mostrar status
log "\nStatus dos serviços:"
systemctl status nginx --no-pager
pm2 list

log "\nCredenciais do NewCash Bank:"
log "Admin: admin@newcashbank.com.br / admin123"
log "Cliente: cliente@newcashbank.com.br / cliente1"
