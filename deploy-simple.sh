#!/bin/bash
# Script simples para deploy do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy simples do NewCash Bank System ==="
echo "Este script irá configurar e iniciar o sistema completo"

# Instalar dependências necessárias
echo "Instalando dependências..."
apt-get update
apt-get install -y mongodb nginx nodejs npm

# Iniciar MongoDB
echo "Configurando MongoDB..."
systemctl start mongodb
systemctl enable mongodb

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
    server_name _;
    
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

# Iniciar o aplicativo
echo "Iniciando o aplicativo..."
npm install -g pm2
pm2 start start-production.js --name newcash-bank
pm2 save
pm2 startup

echo "=== Deploy concluído! ==="
echo "Acesse o sistema pelo navegador: http://$(hostname -I | awk '{print $1}')"
echo "Para visualizar logs: pm2 logs newcash-bank"
