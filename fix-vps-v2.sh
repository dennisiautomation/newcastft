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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    handle_error "Este script precisa ser executado como root"
fi

# Configurar diretório base
BASE_DIR="/var/www/newcashbank"
log "Configurando diretório base em $BASE_DIR"

# Limpar instalação anterior
log "Limpando instalação anterior..."
rm -rf $BASE_DIR
mkdir -p $BASE_DIR
cd $BASE_DIR || handle_error "Não foi possível acessar $BASE_DIR"

# Clonar repositório
log "Clonando repositório..."
git clone https://github.com/dennisiautomation/newcastft.git .

# Verificar se o clone foi bem sucedido
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    handle_error "Clone do repositório falhou. Diretórios frontend/backend não encontrados."
fi

# Instalar Node.js e NPM se necessário
log "Verificando Node.js e NPM..."
if ! command -v node &> /dev/null; then
    log "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Configurar frontend
log "Configurando frontend..."
cd $BASE_DIR/frontend || handle_error "Diretório frontend não encontrado"
npm install --legacy-peer-deps || handle_error "Falha ao instalar dependências do frontend"
npm run build || handle_error "Falha ao construir o frontend"

# Configurar backend
log "Configurando backend..."
cd $BASE_DIR/backend || handle_error "Diretório backend não encontrado"
npm install || handle_error "Falha ao instalar dependências do backend"

# Instalar PM2 globalmente
log "Instalando PM2..."
npm install -g pm2 || handle_error "Falha ao instalar PM2"

# Configurar variáveis de ambiente do backend
log "Configurando variáveis de ambiente..."
cat > .env << EOL
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/newcashbank
FT_API_BASE_URL=http://mytest.ftassetmanagement.com/api
FT_API_KEY=6d9bac1b-f685-11ef-a3af-00155d010b18
USD_ACCOUNT=60428
EUR_ACCOUNT=60429
OFFLINE_MODE=true
EOL

# Configurar Nginx
log "Configurando Nginx..."
rm -f /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/newcashbank << 'EOL'
server {
    listen 80;
    server_name global.newcashbank.com.br;

    root /var/www/newcashbank/frontend/build;
    index index.html;

    # Configuração do frontend React
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
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
    }
}
EOL

# Criar link simbólico para Nginx
log "Criando link simbólico do Nginx..."
ln -sf /etc/nginx/sites-available/newcashbank /etc/nginx/sites-enabled/

# Verificar configuração do Nginx
nginx -t || handle_error "Configuração do Nginx inválida"

# Ajustar permissões
log "Ajustando permissões..."
chown -R www-data:www-data $BASE_DIR
chmod -R 755 $BASE_DIR

# Iniciar backend com PM2
log "Iniciando backend..."
cd $BASE_DIR/backend
pm2 delete newcashbank-backend 2>/dev/null || true
pm2 start server.js --name newcashbank-backend || handle_error "Falha ao iniciar backend"
pm2 save || handle_error "Falha ao salvar configuração do PM2"

# Reiniciar Nginx
log "Reiniciando Nginx..."
systemctl restart nginx || handle_error "Falha ao reiniciar Nginx"

# Verificar serviços
log "Verificando serviços..."
if ! curl -s http://localhost:3001/api/health &>/dev/null; then
    log "AVISO: API não está respondendo em http://localhost:3001/api/health"
fi

log "Setup concluído com sucesso!"
log "Frontend: http://global.newcashbank.com.br"
log "Backend API: http://global.newcashbank.com.br/api"
log "Credenciais:"
log "  Admin: admin@newcashbank.com.br / admin123"
log "  Cliente: cliente@newcashbank.com.br / cliente1"

# Mostrar status dos serviços
log "\nStatus do PM2:"
pm2 list
log "\nStatus do Nginx:"
systemctl status nginx --no-pager
