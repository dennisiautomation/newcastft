#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Instalar Certbot
log "Instalando Certbot..."
dnf install -y certbot python3-certbot-nginx

# Obter certificado
log "Obtendo certificado SSL..."
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email helio@newcashbank.com.br \
  --domains global.newcashbank.com.br \
  --redirect

# Configurar Nginx com SSL
log "Configurando Nginx com SSL..."
cat > /etc/nginx/sites-available/newcashbank << 'EOL'
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
    ssl_trusted_certificate /etc/letsencrypt/live/global.newcashbank.com.br/chain.pem;

    # Configurações de SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security "max-age=31536000" always;

    access_log /var/log/nginx/newcashbank.access.log;
    error_log /var/log/nginx/newcashbank.error.log;

    root /var/www/newcashbank/frontend/build;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

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

# Configurar renovação automática
log "Configurando renovação automática do SSL..."
systemctl enable certbot-renew.timer
systemctl start certbot-renew.timer

log "\nConfiguração SSL concluída!"
log "Acesse: https://global.newcashbank.com.br"
log "\nCredenciais:"
log "Admin: admin@newcashbank.com.br / admin123"
log "Cliente: cliente@newcashbank.com.br / cliente1"

# Verificar status
log "\nStatus dos serviços:"
systemctl status nginx --no-pager
curl -k https://global.newcashbank.com.br/api/health
