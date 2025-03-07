#!/bin/bash

# Script para configurar o domínio global.newcashbank.com.br no Nginx
# Autor: Dennis Canteli
# Data: 07/03/2025

echo "=== Configurando domínio global.newcashbank.com.br no Nginx ==="

# Verificar se está rodando como root
if [ "$(id -u)" != "0" ]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Criar configuração do Nginx para o domínio
echo "Criando configuração do Nginx para o domínio..."
cat > /etc/nginx/sites-available/global.newcashbank.com.br << 'EOF'
server {
    listen 80;
    server_name global.newcashbank.com.br;

    root /var/www/newcash-bank/frontend/build;
    index index.html;

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
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Ativar configuração
echo "Ativando configuração..."
ln -sf /etc/nginx/sites-available/global.newcashbank.com.br /etc/nginx/sites-enabled/

# Verificar configuração do Nginx
echo "Verificando configuração do Nginx..."
nginx -t

# Reiniciar Nginx
echo "Reiniciando Nginx..."
systemctl restart nginx

echo "=== Configuração do domínio concluída ==="
echo "Agora você pode acessar o sistema pelo domínio: http://global.newcashbank.com.br"
echo ""
echo "Credenciais de acesso:"
echo "Admin: admin@newcashbank.com.br (senha padrão)"
echo "Cliente: cliente@newcashbank.com.br (senha padrão)"
echo ""
echo "Para verificar os logs do Nginx, execute: tail -f /var/log/nginx/error.log"
