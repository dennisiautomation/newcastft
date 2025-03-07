#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Verificar DNS
log "Verificando DNS..."
host global.newcashbank.com.br

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me)
log "IP Público: $PUBLIC_IP"

# Atualizar Nginx para responder ao IP também
log "Atualizando configuração do Nginx..."
cat > /etc/nginx/sites-available/newcashbank << EOL
server {
    listen 80;
    server_name global.newcashbank.com.br $PUBLIC_IP;

    access_log /var/log/nginx/newcashbank.access.log;
    error_log /var/log/nginx/newcashbank.error.log;

    root /var/www/newcashbank/frontend/build;
    index index.html;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Aumentar timeouts para operações bancárias
        proxy_connect_timeout 120;
        proxy_send_timeout 120;
        proxy_read_timeout 120;
    }
}
EOL

# Testar e reiniciar Nginx
log "Verificando configuração..."
nginx -t

log "Reiniciando Nginx..."
systemctl restart nginx

# Mostrar informações de acesso
log "\nInformações de acesso:"
log "1. Via IP: http://$PUBLIC_IP"
log "2. Via domínio: http://global.newcashbank.com.br"
log "\nCredenciais:"
log "Admin: admin@newcashbank.com.br / admin123"
log "Cliente: cliente@newcashbank.com.br / cliente1"

# Testar conexões
log "\nTestando conexões..."
curl -v --max-time 5 http://$PUBLIC_IP/api/health
curl -v --max-time 5 http://global.newcashbank.com.br/api/health

# Mostrar status
log "\nStatus dos serviços:"
systemctl status nginx --no-pager
pm2 list
