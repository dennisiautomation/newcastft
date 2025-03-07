#!/bin/bash
# Script de diagnóstico para o NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando diagnóstico do NewCash Bank System ==="

# Verificar se o Nginx está rodando
echo "Verificando status do Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx está rodando"
else
    echo "❌ Nginx não está rodando"
    echo "Tentando iniciar o Nginx..."
    systemctl start nginx
fi

# Verificar configuração do Nginx
echo "Verificando configuração do Nginx..."
nginx -t

# Verificar se o Node.js está instalado
echo "Verificando Node.js..."
node -v
if [ $? -ne 0 ]; then
    echo "❌ Node.js não está instalado ou não está no PATH"
else
    echo "✅ Node.js está instalado"
fi

# Verificar se o PM2 está rodando a aplicação
echo "Verificando status do aplicativo no PM2..."
pm2 list | grep newcash-bank
if [ $? -ne 0 ]; then
    echo "❌ Aplicativo não está rodando no PM2"
    echo "Tentando iniciar o aplicativo..."
    cd /var/www/newcash-bank
    pm2 start start-production.js --name newcash-bank
else
    echo "✅ Aplicativo está rodando no PM2"
fi

# Verificar logs do aplicativo
echo "Verificando logs do aplicativo (últimas 20 linhas)..."
pm2 logs newcash-bank --lines 20 --nostream

# Verificar se o frontend foi compilado corretamente
echo "Verificando build do frontend..."
if [ -d "/var/www/newcash-bank/frontend/build" ]; then
    echo "✅ Build do frontend existe"
    ls -la /var/www/newcash-bank/frontend/build
else
    echo "❌ Build do frontend não existe"
    echo "Tentando recompilar o frontend..."
    cd /var/www/newcash-bank/frontend
    npm run build
fi

# Verificar arquivo .env
echo "Verificando arquivo .env..."
if [ -f "/var/www/newcash-bank/backend/.env" ]; then
    echo "✅ Arquivo .env existe"
    echo "Conteúdo do arquivo .env (sem senhas):"
    grep -v "PASSWORD\|SECRET" /var/www/newcash-bank/backend/.env
else
    echo "❌ Arquivo .env não existe"
    echo "Criando arquivo .env básico..."
    mkdir -p /var/www/newcash-bank/backend
    cat > /var/www/newcash-bank/backend/.env << EOF
MONGODB_OFFLINE_MODE=true
MONGODB_URI=mongodb://localhost:27017/newcash
JWT_SECRET=newcash-bank-system-secret-key
PORT=3001
EOF
fi

# Verificar permissões dos arquivos
echo "Verificando permissões..."
ls -la /var/www/newcash-bank

# Reiniciar serviços
echo "Reiniciando serviços..."
systemctl restart nginx
pm2 restart newcash-bank

echo "=== Diagnóstico concluído ==="
echo "Se o problema persistir, verifique os logs completos:"
echo "- PM2: pm2 logs newcash-bank"
echo "- Nginx: tail -f /var/log/nginx/error.log"
echo "- Sistema: journalctl -xe"
