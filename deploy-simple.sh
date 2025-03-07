#!/bin/bash
# Script simples para deploy do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy simples do NewCash Bank System ==="
echo "Este script irá configurar e iniciar o sistema em modo offline com SSL"

# Instalar dependências necessárias
echo "Instalando dependências..."
apt-get update
apt-get install -y nginx nodejs npm certbot python3-certbot-nginx

# Configurar modo offline
echo "Configurando modo offline..."
mkdir -p backend
if [ ! -f backend/.env ]; then
    echo "Criando arquivo .env..."
    touch backend/.env
fi
echo "MONGODB_OFFLINE_MODE=true" > backend/.env
echo "MONGODB_URI=mongodb://localhost:27017/newcash" >> backend/.env
echo "JWT_SECRET=newcash-bank-system-secret-key" >> backend/.env
echo "PORT=3001" >> backend/.env

# Instalar dependências do projeto
echo "Instalando dependências do projeto..."
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps && cd ..
cd frontend && npm install --legacy-peer-deps && npm run build && cd ..

# Configurar Nginx
echo "Configurando Nginx..."
cat > /etc/nginx/sites-available/newcash-bank << EOF
server {
    listen 80;
    server_name global.newcashbank.com.br;
    
    location / {
        root $(pwd)/frontend/build;
        try_files \$uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/newcash-bank /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Configurar SSL com Let's Encrypt
echo "Configurando SSL com Let's Encrypt..."
certbot --nginx -d global.newcashbank.com.br --non-interactive --agree-tos --email admin@newcashbank.com.br --redirect

# Iniciar o aplicativo
echo "Iniciando o aplicativo em modo offline..."
npm install -g pm2
pm2 start start-production.js --name newcash-bank
pm2 save
pm2 startup

echo "=== Deploy concluído! ==="
echo "Sistema configurado para funcionar em modo OFFLINE (sem MongoDB)"
echo "Acesse o sistema pelo navegador: https://global.newcashbank.com.br/"
echo "Para visualizar logs: pm2 logs newcash-bank"
echo "O certificado SSL será renovado automaticamente pelo Certbot"
