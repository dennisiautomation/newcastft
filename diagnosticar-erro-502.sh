#!/bin/bash

# Script para diagnosticar e corrigir erro 502 no NewCash Bank System
# Autor: Dennis Canteli
# Data: 07/03/2025

echo "=== Diagnosticando erro 502 no NewCash Bank System ==="

# Verificar se está rodando como root
if [ "$(id -u)" != "0" ]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Verificar status do Nginx
echo "Verificando status do Nginx..."
systemctl status nginx

# Verificar logs do Nginx
echo -e "\nVerificando logs de erro do Nginx..."
tail -n 50 /var/log/nginx/error.log

# Verificar status do backend
echo -e "\nVerificando status do backend (PM2)..."
pm2 status

# Verificar logs do backend
echo -e "\nVerificando logs do backend..."
pm2 logs newcash-bank --lines 50

# Verificar se o backend está ouvindo na porta correta
echo -e "\nVerificando portas em uso..."
netstat -tulpn | grep LISTEN

# Verificar configuração do Nginx
echo -e "\nVerificando configuração do Nginx..."
nginx -t

# Reiniciar serviços
echo -e "\nReiniciando serviços..."
echo "1. Reiniciando backend..."
pm2 restart newcash-bank

echo "2. Reiniciando Nginx..."
systemctl restart nginx

# Verificar novamente status dos serviços
echo -e "\nVerificando status dos serviços após reinicialização..."
echo "1. Status do backend (PM2):"
pm2 status

echo "2. Status do Nginx:"
systemctl status nginx

# Corrigir configuração do Nginx se necessário
echo -e "\nAtualizando configuração do Nginx para o domínio..."
cat > /etc/nginx/sites-available/global.newcashbank.com.br << 'EOF'
server {
    listen 80;
    server_name global.newcashbank.com.br;

    root /var/www/newcash-bank/frontend/build;
    index index.html;

    # Aumentar o timeout para evitar erro 502
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

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
        
        # Aumentar buffer size
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logs específicos para este domínio
    access_log /var/log/nginx/global.newcashbank.com.br-access.log;
    error_log /var/log/nginx/global.newcashbank.com.br-error.log;
}
EOF

# Verificar e aplicar a configuração
echo -e "\nVerificando a nova configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Configuração do Nginx está correta. Reiniciando..."
    systemctl restart nginx
    echo "Nginx reiniciado com sucesso!"
else
    echo "Erro na configuração do Nginx. Por favor, verifique os erros acima."
fi

# Verificar se o backend está rodando na porta correta
echo -e "\nVerificando se o backend está rodando corretamente..."
cd /var/www/newcash-bank/backend
echo "Porta configurada no .env: $(grep PORT .env || echo 'PORT não encontrado no .env')"

# Verificar se o MongoDB está em modo offline
echo -e "\nVerificando configuração do MongoDB..."
grep MONGODB_OFFLINE_MODE .env || echo "MONGODB_OFFLINE_MODE não encontrado no .env"

# Adicionar configuração de modo offline se não existir
if ! grep -q "MONGODB_OFFLINE_MODE" .env; then
    echo -e "\nAdicionando configuração de modo offline ao .env..."
    echo "MONGODB_OFFLINE_MODE=true" >> .env
    echo "Configuração adicionada!"
fi

# Reiniciar backend novamente
echo -e "\nReiniciando backend após ajustes..."
pm2 restart newcash-bank

echo -e "\n=== Diagnóstico e correção concluídos ==="
echo "Tente acessar novamente: https://global.newcashbank.com.br"
echo "Se o problema persistir, verifique os logs em:"
echo "- Nginx: /var/log/nginx/global.newcashbank.com.br-error.log"
echo "- Backend: pm2 logs newcash-bank"
