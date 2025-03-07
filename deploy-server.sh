#!/bin/bash
# Script para deploy do NewCash Bank System no servidor
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy do NewCash Bank System ==="

# Criar diretório de trabalho
mkdir -p /var/www/newcash-bank
cd /var/www/newcash-bank

# Clonar repositório
git clone https://github.com/dennisiautomation/newcastft.git .
git checkout fix-ft-api-integration

# Instalar dependências do backend
cd backend
npm install --legacy-peer-deps
cd ..

# Instalar dependências e construir o frontend
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Configurar arquivo .env
cat > backend/.env << 'ENVFILE'
MONGODB_OFFLINE_MODE=true
MONGODB_URI=mongodb://localhost:27017/newcash
JWT_SECRET=newcash-bank-system-secret-key-2025
PORT=3001
ENVFILE

# Configurar Nginx
cat > /etc/nginx/sites-available/newcash << 'NGINX'
server {
    listen 80;
    server_name global.newcashbank.com.br;

    location / {
        root /var/www/newcash-bank/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Ativar site e reiniciar Nginx
ln -sf /etc/nginx/sites-available/newcash /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Iniciar aplicação com PM2
cd backend
pm2 delete newcash-bank 2>/dev/null || true
pm2 start server.js --name newcash-bank
pm2 save
pm2 startup

# Configurar SSL com Let's Encrypt
certbot --nginx -d global.newcashbank.com.br --non-interactive --agree-tos --email admin@newcashbank.com.br

echo "=== Deploy concluído ==="
echo "Acesse https://global.newcashbank.com.br/ para verificar se o sistema está funcionando."
