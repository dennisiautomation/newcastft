#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Instalar EPEL e Certbot
log "Instalando EPEL e Certbot..."
dnf install -y epel-release
dnf install -y certbot python3-certbot-nginx

# Parar Nginx temporariamente
log "Parando Nginx..."
systemctl stop nginx

# Obter certificado
log "Obtendo certificado SSL..."
certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email helio@newcashbank.com.br \
  --domains global.newcashbank.com.br

# Configurar Nginx com SSL
log "Configurando Nginx com SSL..."
cat > /etc/nginx/conf.d/newcashbank.conf << 'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name global.newcashbank.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name global.newcashbank.com.br;

    ssl_certificate /etc/letsencrypt/live/global.newcashbank.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/global.newcashbank.com.br/privkey.pem;

    # Configurações de SSL otimizadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    add_header Strict-Transport-Security "max-age=31536000" always;

    access_log /var/log/nginx/newcashbank.access.log;
    error_log /var/log/nginx/newcashbank.error.log;

    root /var/www/newcashbank/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts para operações bancárias
        proxy_connect_timeout 120;
        proxy_send_timeout 120;
        proxy_read_timeout 120;
    }
}
EOL

# Remover configuração antiga
log "Removendo configuração antiga..."
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/newcashbank
rm -f /etc/nginx/sites-available/newcashbank

# Configurar renovação automática
log "Configurando renovação automática do SSL..."
echo "0 0,12 * * * root python3 -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" > /etc/cron.d/certbot

# Testar e reiniciar Nginx
log "Verificando configuração..."
nginx -t

log "Reiniciando Nginx..."
systemctl restart nginx

log "\nConfiguração SSL concluída!"
log "Acesse: https://global.newcashbank.com.br"
log "\nCredenciais do NewCash Bank:"
log "Admin: admin@newcashbank.com.br / admin123"
log "Cliente: cliente@newcashbank.com.br / cliente1"

# Verificar status
log "\nStatus dos serviços:"
systemctl status nginx --no-pager
curl -k https://global.newcashbank.com.br/api/health
