#!/bin/bash

echo "Iniciando deploy do NewCash Bank System..."

# Configurar variáveis de ambiente
echo "Configurando variáveis de ambiente..."
cat > backend/.env << EOL
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/newcashbank
FT_API_BASE_URL=http://mytest.ftassetmanagement.com/api
FT_API_KEY=6d9bac1b-f685-11ef-a3af-00155d010b18
USD_ACCOUNT=60428
EUR_ACCOUNT=60429
EOL

# Instalar dependências do backend
echo "Instalando dependências do backend..."
cd backend
npm install
cd ..

# Instalar dependências do frontend
echo "Instalando dependências do frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Iniciar backend com PM2
echo "Iniciando backend com PM2..."
cd backend
npm install pm2 -g
pm2 start server.js --name newcashbank-backend
cd ..

# Configurar Nginx
echo "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/newcashbank << EOL
server {
    listen 80;
    server_name global.newcashbank.com.br;

    location / {
        root /Users/denniscanteli/newcastft/frontend/build;
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

# Criar link simbólico e reiniciar Nginx
sudo ln -s /etc/nginx/sites-available/newcashbank /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "Deploy concluído com sucesso!"
echo "Frontend: http://global.newcashbank.com.br"
echo "Backend API: http://global.newcashbank.com.br/api"
