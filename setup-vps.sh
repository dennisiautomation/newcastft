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

# Configurar hostname
log "Configurando hostname..."
hostnamectl set-hostname global.newcashbank.com.br

# Instalar dependências básicas
log "Instalando dependências básicas..."
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx

# Instalar Node.js e NPM
log "Instalando Node.js e NPM..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Criar diretório do projeto
log "Configurando diretório do projeto..."
mkdir -p /var/www/newcashbank
chown -R www-data:www-data /var/www/newcashbank
cd /var/www/newcashbank

# Clonar o repositório
log "Clonando o repositório..."
git clone https://github.com/dennisiautomation/newcastft.git .

# Configurar credenciais do sistema
log "Configurando credenciais do sistema..."
cat > backend/config/auth.json << EOL
{
    "admin": {
        "email": "admin@newcashbank.com.br",
        "password": "admin123"
    },
    "client": {
        "email": "cliente@newcashbank.com.br",
        "password": "cliente1"
    }
}
EOL

# Configurar variáveis de ambiente
log "Configurando variáveis de ambiente..."
cat > backend/.env << EOL
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/newcashbank
FT_API_BASE_URL=http://mytest.ftassetmanagement.com/api
FT_API_KEY=6d9bac1b-f685-11ef-a3af-00155d010b18
USD_ACCOUNT=60428
EUR_ACCOUNT=60429
EOL

# Configurar modo offline
log "Configurando modo offline..."
sed -i 's/OFFLINE_MODE=false/OFFLINE_MODE=true/' backend/.env

# Baixar logo oficial
log "Baixando logo oficial..."
mkdir -p frontend/src/assets/images
curl -o frontend/src/assets/images/newcash-logo-official.png https://newcashbank.com.br/assets/images/logo-TBMb_ZBJ.png

# Tornar scripts executáveis
log "Configurando permissões..."
chmod +x deploy-complete.sh

# Configurar firewall
log "Configurando firewall..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Executar deploy
log "Iniciando deploy..."
./deploy-complete.sh

# Criar arquivo de verificação de saúde
log "Criando verificação de saúde..."
echo '{"status":"ok","version":"1.0.0"}' > /var/www/newcashbank/frontend/build/health.json

log "Setup concluído! Sistema disponível em:"
log "https://global.newcashbank.com.br"
log "Credenciais de Admin: admin@newcashbank.com.br / admin123"
log "Credenciais de Cliente: cliente@newcashbank.com.br / cliente1"
