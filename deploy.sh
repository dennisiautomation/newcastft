#!/bin/bash

# Script de implantação para o NewCash Bank System
# Este script transfere os arquivos necessários para o servidor VPS e configura o ambiente

# Configurações
VPS_IP="77.37.43.78"
VPS_USER="root"
REMOTE_DIR="/var/www/newcash-bank"
LOCAL_DIR="$(pwd)"

echo "==================================================="
echo "🚀 INICIANDO IMPLANTAÇÃO DO NEWCASH BANK SYSTEM"
echo "==================================================="
echo "VPS: $VPS_USER@$VPS_IP"
echo "Diretório remoto: $REMOTE_DIR"
echo "Diretório local: $LOCAL_DIR"
echo "Data/Hora: $(date)"
echo "==================================================="

# Verificar conexão SSH
echo -e "\n🔄 Verificando conexão SSH..."
ssh -o StrictHostKeyChecking=accept-new $VPS_USER@$VPS_IP "echo 'Conexão SSH estabelecida com sucesso!'" || {
    echo "❌ Falha ao conectar via SSH. Verifique suas credenciais e tente novamente."
    exit 1
}

# Criar diretório remoto
echo -e "\n🔄 Criando diretório remoto..."
ssh $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# Preparar frontend para produção
echo -e "\n🔄 Preparando frontend para produção..."
cd "$LOCAL_DIR/frontend" && npm install --legacy-peer-deps && npm run build

if [ $? -ne 0 ]; then
    echo "❌ Falha ao construir o frontend. Verifique os erros acima."
    exit 1
fi

echo "✅ Frontend construído com sucesso!"

# Transferir arquivos para o servidor
echo -e "\n🔄 Transferindo arquivos para o servidor..."

# Backend
echo "📦 Transferindo backend..."
rsync -avz --exclude 'node_modules' --exclude '.git' "$LOCAL_DIR/backend/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/backend/"

# Frontend build
echo "📦 Transferindo frontend build..."
rsync -avz "$LOCAL_DIR/frontend/build/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/frontend/build/"

# Arquivos de configuração
echo "📦 Transferindo arquivos de configuração..."
rsync -avz "$LOCAL_DIR/start-production.js" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"
rsync -avz "$LOCAL_DIR/package.json" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"
rsync -avz "$LOCAL_DIR/setup-mongodb.sh" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

# Configurar servidor
echo -e "\n🔄 Configurando servidor..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR && npm install --legacy-peer-deps && cd backend && npm install --legacy-peer-deps"

# Configurar MongoDB
echo -e "\n🔄 Configurando MongoDB..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR && chmod +x setup-mongodb.sh && ./setup-mongodb.sh"

# Configurar Nginx
echo -e "\n🔄 Configurando Nginx..."
ssh $VPS_USER@$VPS_IP "command -v nginx >/dev/null 2>&1 || { echo 'Nginx não está instalado. Instalando...'; apt-get update && apt-get install -y nginx; }"

# Criar configuração do Nginx
echo -e "\n🔄 Criando configuração do Nginx..."
cat > /tmp/newcash-nginx.conf << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root $REMOTE_DIR/frontend/build;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Transferir configuração do Nginx
rsync -avz /tmp/newcash-nginx.conf "$VPS_USER@$VPS_IP:/etc/nginx/sites-available/newcash"

# Ativar configuração do Nginx
ssh $VPS_USER@$VPS_IP "ln -sf /etc/nginx/sites-available/newcash /etc/nginx/sites-enabled/ && nginx -t && systemctl restart nginx"

# Configurar PM2 para gerenciar o processo Node.js
echo -e "\n🔄 Configurando PM2..."
ssh $VPS_USER@$VPS_IP "command -v pm2 >/dev/null 2>&1 || { echo 'PM2 não está instalado. Instalando...'; npm install -g pm2; }"

# Iniciar aplicação com PM2
echo -e "\n🔄 Iniciando aplicação com PM2..."
ssh $VPS_USER@$VPS_IP "cd $REMOTE_DIR && pm2 start start-production.js --name newcash-bank"

echo -e "\n✅ Implantação concluída com sucesso!"
echo "🌐 Acesse: http://$VPS_IP"
echo "📝 Logs: pm2 logs newcash-bank"
echo "🔄 Reiniciar: pm2 restart newcash-bank"
echo "⏹️ Parar: pm2 stop newcash-bank"
