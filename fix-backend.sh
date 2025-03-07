#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Parar serviços
log "Parando serviços..."
pm2 delete all
systemctl stop nginx

# Limpar PM2
log "Limpando PM2..."
pm2 kill
rm -rf /root/.pm2

# Reinstalar PM2
log "Reinstalando PM2..."
npm install -g pm2@latest

# Configurar diretório de trabalho
log "Configurando diretório de trabalho..."
cd /var/www/newcashbank/backend

# Verificar arquivos de rotas
log "Verificando arquivos de rotas..."
for route in ftApi account transaction reservation admin; do
    if [ ! -f "routes/${route}.routes.js" ]; then
        log "Criando ${route}.routes.js..."
        cat > "routes/${route}.routes.js" << EOL
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', route: '${route}' });
});

module.exports = router;
EOL
    fi
done

# Configurar variáveis de ambiente
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

# Reinstalar dependências
log "Reinstalando dependências..."
rm -rf node_modules package-lock.json
npm install

# Iniciar backend com PM2
log "Iniciando backend..."
pm2 start server.js --name newcashbank-backend
pm2 save

# Reiniciar Nginx
log "Reiniciando Nginx..."
systemctl start nginx

# Verificar status
log "Status dos serviços:"
pm2 list
curl -v http://localhost:3001/api/health
