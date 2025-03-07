#!/bin/bash
# Script simples para deploy do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy simples do NewCash Bank System ==="
echo "Este script irá configurar e iniciar o sistema completo"

# Instalar dependências necessárias
echo "Instalando dependências..."
apt-get update
apt-get install -y nginx nodejs npm

# Instalar MongoDB corretamente
echo "Instalando MongoDB..."
apt-get install -y gnupg curl
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian $(lsb_release -cs)/mongodb-org/7.0 main" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Iniciar MongoDB
echo "Configurando MongoDB..."
systemctl start mongod
systemctl enable mongod

# Verificar se MongoDB está rodando
echo "Verificando se MongoDB está rodando..."
sleep 5
if systemctl is-active --quiet mongod; then
    echo "MongoDB está rodando corretamente."
else
    echo "Tentando iniciar MongoDB novamente..."
    systemctl start mongod
    sleep 5
    if systemctl is-active --quiet mongod; then
        echo "MongoDB está rodando corretamente agora."
    else
        echo "AVISO: MongoDB não pôde ser iniciado. O sistema funcionará em modo offline."
        # Configurar modo offline no .env
        if [ -f backend/.env ]; then
            echo "MONGODB_OFFLINE_MODE=true" >> backend/.env
        fi
    fi
fi

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
