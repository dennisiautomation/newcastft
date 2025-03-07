#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Parar Nginx
log "Parando Nginx..."
systemctl stop nginx

# Remover configurações antigas
log "Limpando configurações antigas..."
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/newcashbank
rm -f /etc/nginx/sites-available/newcashbank

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/newcashbank << 'EOL'
server {
    listen 80 default_server;
    server_name _;

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

        # Aumentar timeouts
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
        proxy_read_timeout 60;
    }
}
EOL

# Criar link simbólico
log "Criando link simbólico..."
ln -sf /etc/nginx/sites-available/newcashbank /etc/nginx/sites-enabled/

# Configurar firewall
log "Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Verificar configuração do Nginx
log "Verificando configuração..."
nginx -t

# Reiniciar Nginx
log "Reiniciando Nginx..."
systemctl restart nginx

# Verificar status
log "Status do Nginx:"
systemctl status nginx --no-pager

# Verificar portas
log "Portas em uso:"
netstat -tulpn | grep -E ':80|:3001'

# Verificar backend
log "Status do backend:"
curl -v http://127.0.0.1:3001/api/health

# Mostrar logs
log "Últimas linhas do log de erro do Nginx:"
tail -n 20 /var/log/nginx/newcashbank.error.log
