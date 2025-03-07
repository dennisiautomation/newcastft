#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Remover configuração padrão do Nginx
log "Removendo configuração padrão do Nginx..."
rm -f /etc/nginx/sites-enabled/default

# Configurar site do NewCash Bank
log "Configurando site do NewCash Bank..."
cat > /etc/nginx/sites-available/newcashbank << 'EOL'
server {
    listen 80;
    server_name global.newcashbank.com.br;
    root /var/www/newcashbank/frontend/build;
    index index.html;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Configuração do frontend React
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Configuração da API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Aumentar timeouts para operações longas
        proxy_connect_timeout 60;
        proxy_send_timeout 60;
        proxy_read_timeout 60;
    }

    # Negar acesso a arquivos ocultos
    location ~ /\. {
        deny all;
    }
}
EOL

# Criar link simbólico
log "Criando link simbólico..."
ln -sf /etc/nginx/sites-available/newcashbank /etc/nginx/sites-enabled/

# Verificar configuração
log "Verificando configuração do Nginx..."
nginx -t

# Reiniciar Nginx
log "Reiniciando Nginx..."
systemctl restart nginx

# Verificar status do backend
log "Verificando status do backend..."
pm2 list

# Reconstruir o frontend
log "Reconstruindo o frontend..."
cd /var/www/newcashbank/frontend
npm run build

# Ajustar permissões
log "Ajustando permissões..."
chown -R www-data:www-data /var/www/newcashbank/frontend/build

log "Configuração concluída!"
log "Acesse: http://global.newcashbank.com.br"
