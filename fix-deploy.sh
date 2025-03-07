#!/bin/bash
# Script para corrigir problemas de deploy do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando correção do deploy do NewCash Bank System ==="

# Verificar a estrutura de diretórios
echo "Verificando a estrutura de diretórios..."
cd /var/www/newcash-bank
pwd

# Corrigir estrutura de diretórios
echo "Corrigindo estrutura de diretórios..."
mkdir -p frontend/src
mkdir -p frontend/public
mkdir -p backend/routes
mkdir -p backend/controllers
mkdir -p backend/models
mkdir -p backend/services

# Clonar o repositório novamente em um diretório temporário
echo "Clonando repositório em diretório temporário..."
cd /tmp
git clone https://github.com/dennisiautomation/newcastft.git temp-newcash
cd temp-newcash
git checkout fix-ft-api-integration

# Copiar arquivos para a estrutura correta
echo "Copiando arquivos para a estrutura correta..."
cp -r * /var/www/newcash-bank/
cp -r .env* /var/www/newcash-bank/ 2>/dev/null || true
cp -r .git* /var/www/newcash-bank/ 2>/dev/null || true

# Remover diretório temporário
echo "Removendo diretório temporário..."
cd /var/www
rm -rf /tmp/temp-newcash

# Configurar ambiente
echo "Configurando ambiente..."
cd /var/www/newcash-bank
chmod +x deploy-simple.sh
chmod +x diagnose.sh

# Executar deploy novamente
echo "Executando deploy novamente..."
./deploy-simple.sh

echo "=== Correção concluída ==="
echo "Acesse o sistema pelo navegador: https://global.newcashbank.com.br/"
