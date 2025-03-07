#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Limpar instalação anterior
log "Limpando instalação anterior..."
rm -rf /var/www/newcashbank/*

# Configurar Git
log "Configurando Git..."
git config --global --add safe.directory /var/www/newcashbank

# Clonar repositório novamente
log "Clonando repositório..."
cd /var/www/newcashbank
git clone https://github.com/dennisiautomation/newcastft.git .

# Configurar Nginx
log "Configurando Nginx..."
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/newcashbank << 'EOL'
server {
    listen 80;
    server_name global.newcashbank.com.br;
    root /var/www/newcashbank/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
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
EOL

# Criar link simbólico
ln -sf /etc/nginx/sites-available/newcashbank /etc/nginx/sites-enabled/

# Instalar dependências
log "Instalando dependências..."
cd /var/www/newcashbank/frontend
npm install --legacy-peer-deps
npm run build

cd /var/www/newcashbank/backend
npm install
npm install pm2 -g

# Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."
cat > .env << EOL
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/newcashbank
FT_API_BASE_URL=http://mytest.ftassetmanagement.com/api
FT_API_KEY=6d9bac1b-f685-11ef-a3af-00155d010b18
USD_ACCOUNT=60428
EUR_ACCOUNT=60429
OFFLINE_MODE=true
EOL

# Iniciar backend
log "Iniciando backend..."
pm2 delete newcashbank-backend 2>/dev/null || true
pm2 start server.js --name newcashbank-backend
pm2 save

# Ajustar permissões
log "Ajustando permissões..."
chown -R www-data:www-data /var/www/newcashbank

# Reiniciar Nginx
log "Reiniciando Nginx..."
nginx -t && systemctl restart nginx

log "Setup concluído!"
log "Acesse: http://global.newcashbank.com.br"
log "Admin: admin@newcashbank.com.br / admin123"
log "Cliente: cliente@newcashbank.com.br / cliente1"
