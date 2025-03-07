#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Iniciando deploy do sistema...${NC}"

# Instalação de dependências básicas
echo -e "${GREEN}Instalando dependências...${NC}"
apt update
apt install -y nginx nodejs npm

# Instalar PM2 globalmente
npm install -g pm2

# Preparar diretório da aplicação
echo -e "${GREEN}Preparando diretório...${NC}"
mkdir -p /var/www/app
cd /var/www/app

# Clonar o repositório
echo -e "${GREEN}Clonando repositório...${NC}"
git clone https://github.com/dennisiautomation/newcastft.git .
git checkout 2d93c9b

# Configurar backend
echo -e "${GREEN}Configurando backend...${NC}"
cd backend
cp .env.example .env
npm install
pm2 start server.js --name app-backend

# Configurar frontend
echo -e "${GREEN}Configurando frontend...${NC}"
cd ../frontend
npm install
npm run build

# Configurar Nginx
echo -e "${GREEN}Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/app << EOL
server {
    listen 80;
    server_name _;

    root /var/www/app/frontend/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
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
EOL

ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Verificar status
echo -e "${GREEN}Verificando status dos serviços...${NC}"
systemctl status nginx
pm2 status

echo -e "${GREEN}Deploy concluído!${NC}"
