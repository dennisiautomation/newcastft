#!/bin/bash

# Script para corrigir o login e saldo no servidor
# Autor: Dennis
# Data: 21/03/2025

# Parar o serviço atual
pkill -f "node /var/www/newcashbank/backend/server.js"

# Aplicar as correções
cp -f Login.js /var/www/newcashbank/frontend/src/pages/auth/
cp -f authSlice.js /var/www/newcashbank/frontend/src/store/slices/
cp -f Dashboard.js /var/www/newcashbank/frontend/src/pages/client/

# Reconstruir o frontend
cd /var/www/newcashbank/frontend
npm run build

# Reiniciar o servidor
cd /var/www/newcashbank/backend
nohup node server.js > server.log 2>&1 &

echo "===================================================="
echo "✅ Correção aplicada com sucesso!"
echo "===================================================="
echo "Credenciais de cliente: shigemi.matsumoto@newcashbank.com.br / Eriyasu2023!"
echo "Credenciais de admin: admin@newcashbank.com.br / admin123"
echo "===================================================="
