#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Instalar dependências básicas
log "Instalando dependências básicas..."
sudo apt-get update
sudo apt-get install -y curl git nginx

# Instalar Node.js e NPM
log "Instalando Node.js e NPM..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Criar diretório do projeto
log "Configurando diretório do projeto..."
sudo mkdir -p /var/www/newcashbank
sudo chown -R $USER:$USER /var/www/newcashbank
cd /var/www/newcashbank

# Clonar o repositório
log "Clonando o repositório..."
git clone https://github.com/dennisiautomation/newcastft.git .

# Tornar scripts executáveis
log "Configurando permissões..."
chmod +x deploy-complete.sh

# Executar deploy
log "Iniciando deploy..."
./deploy-complete.sh
