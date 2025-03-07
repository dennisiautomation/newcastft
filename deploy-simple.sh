#!/bin/bash
# Script simples para deploy do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy simples do NewCash Bank System ==="
echo "Este script irá configurar e iniciar o sistema com MongoDB Atlas"

# Instalar dependências necessárias
echo "Instalando dependências..."
apt-get update
apt-get install -y nginx nodejs npm

# Configurar MongoDB Atlas
echo "Configurando conexão com MongoDB Atlas..."
mkdir -p backend
if [ ! -f backend/.env ]; then
    echo "Criando arquivo .env..."
    touch backend/.env
fi

# Usar MongoDB Atlas - serviço de banco de dados MongoDB na nuvem
# Esta é uma string de conexão de exemplo. Você deve substituí-la pela sua própria
# string de conexão do MongoDB Atlas.
echo "MONGODB_URI=mongodb+srv://newcash:NewCash2025@cluster0.mongodb.net/newcash?retryWrites=true&w=majority" > backend/.env
echo "MONGODB_OFFLINE_MODE=false" >> backend/.env
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
echo "Iniciando o aplicativo com MongoDB Atlas..."
npm install -g pm2
pm2 start start-production.js --name newcash-bank
pm2 save
pm2 startup

echo "=== Deploy concluído! ==="
echo "Sistema configurado para usar MongoDB Atlas (banco de dados na nuvem)"
echo "IMPORTANTE: Você precisa criar uma conta no MongoDB Atlas e substituir a string de conexão"
echo "no arquivo backend/.env pela sua própria string de conexão."
echo "Acesse o sistema pelo navegador: http://$(hostname -I | awk '{print $1}')"
echo "Para visualizar logs: pm2 logs newcash-bank"
