#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para tratamento de erros
handle_error() {
    log "ERRO: $1"
    exit 1
}

# Verificar requisitos
log "Verificando requisitos..."
command -v node >/dev/null 2>&1 || handle_error "Node.js não encontrado. Por favor, instale o Node.js"
command -v npm >/dev/null 2>&1 || handle_error "NPM não encontrado. Por favor, instale o NPM"
command -v nginx >/dev/null 2>&1 || handle_error "Nginx não encontrado. Por favor, instale o Nginx"

# Criar backup
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
log "Criando backup em $BACKUP_DIR..."
mkdir -p $BACKUP_DIR
cp -r backend frontend $BACKUP_DIR/ 2>/dev/null || log "Aviso: Backup parcial criado"

# Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."
cat > backend/.env << EOL || handle_error "Falha ao criar arquivo .env"
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/newcashbank
FT_API_BASE_URL=http://mytest.ftassetmanagement.com/api
FT_API_KEY=6d9bac1b-f685-11ef-a3af-00155d010b18
USD_ACCOUNT=60428
EUR_ACCOUNT=60429
EOL

# Instalar dependências do backend
log "Instalando dependências do backend..."
cd backend || handle_error "Diretório backend não encontrado"
npm install || handle_error "Falha ao instalar dependências do backend"
cd ..

# Instalar dependências do frontend
log "Instalando dependências do frontend..."
cd frontend || handle_error "Diretório frontend não encontrado"
npm install --legacy-peer-deps || handle_error "Falha ao instalar dependências do frontend"
npm run build || handle_error "Falha ao construir o frontend"
cd ..

# Iniciar backend com PM2
log "Configurando PM2..."
npm install pm2 -g || handle_error "Falha ao instalar PM2"
cd backend || handle_error "Diretório backend não encontrado"
pm2 delete newcashbank-backend 2>/dev/null || true
pm2 start server.js --name newcashbank-backend || handle_error "Falha ao iniciar o backend com PM2"
pm2 save || handle_error "Falha ao salvar configuração do PM2"
cd ..

# Configurar Nginx
log "Configurando Nginx..."
NGINX_CONF="/etc/nginx/sites-available/newcashbank"
sudo tee $NGINX_CONF << EOL || handle_error "Falha ao criar configuração do Nginx"
server {
    listen 80;
    listen 443 ssl;
    server_name global.newcashbank.com.br;

    ssl_certificate /etc/letsencrypt/live/global.newcashbank.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/global.newcashbank.com.br/privkey.pem;

    # Configurações de SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Redirecionamento HTTP para HTTPS
    if (\$scheme != "https") {
        return 301 https://\$server_name\$request_uri;
    }

    location / {
        root /Users/denniscanteli/newcastft/frontend/build;
        try_files \$uri \$uri/ /index.html;
        
        # Headers de segurança
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Headers de segurança para a API
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
EOL

# Configurar SSL com Let's Encrypt
log "Configurando SSL com Let's Encrypt..."
if ! command -v certbot &> /dev/null; then
    log "Instalando Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx || handle_error "Falha ao instalar Certbot"
fi

sudo certbot --nginx -d global.newcashbank.com.br --non-interactive --agree-tos --email helio@newcashbank.com.br || handle_error "Falha ao configurar SSL"

# Criar link simbólico e reiniciar Nginx
log "Finalizando configuração do Nginx..."
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/ || handle_error "Falha ao criar link simbólico"
sudo nginx -t || handle_error "Configuração do Nginx inválida"
sudo systemctl restart nginx || handle_error "Falha ao reiniciar Nginx"

# Verificar serviços
log "Verificando serviços..."
curl -s http://localhost:3001/api/health >/dev/null || log "Aviso: API não está respondendo"
curl -s https://global.newcashbank.com.br >/dev/null || log "Aviso: Frontend não está acessível"

log "Deploy concluído com sucesso!"
log "Frontend: https://global.newcashbank.com.br"
log "Backend API: https://global.newcashbank.com.br/api"
log "Backup salvo em: $BACKUP_DIR"

# Criar arquivo de log do deploy
DEPLOY_LOG="deploy_$(date +%Y%m%d_%H%M%S).log"
log "Log do deploy salvo em: $DEPLOY_LOG"
