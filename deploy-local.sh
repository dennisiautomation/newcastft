#!/bin/bash

# Script de implantação local para o NewCash Bank System
# Este script prepara a versão de produção e a serve localmente

echo "==================================================="
echo "🚀 INICIANDO IMPLANTAÇÃO LOCAL DO NEWCASH BANK SYSTEM"
echo "==================================================="
echo "Data/Hora: $(date)"
echo "==================================================="

# Diretório do projeto
PROJECT_DIR="$(pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BACKEND_DIR="$PROJECT_DIR/backend"

# Preparar frontend para produção
echo -e "\n🔄 Preparando frontend para produção..."
cd "$FRONTEND_DIR" && npm run build

if [ $? -ne 0 ]; then
    echo "❌ Falha ao construir o frontend. Verifique os erros acima."
    exit 1
fi

echo "✅ Frontend construído com sucesso!"

# Instalar serve se não estiver instalado
echo -e "\n🔄 Verificando se o serve está instalado..."
if ! command -v serve &> /dev/null; then
    echo "Instalando serve globalmente..."
    npm install -g serve
fi

# Iniciar servidor para o frontend
echo -e "\n🔄 Iniciando servidor para o frontend na porta 5000..."
cd "$FRONTEND_DIR/build" && serve -s &
FRONTEND_PID=$!

echo -e "\n✅ Implantação local concluída com sucesso!"
echo "🌐 Acesse o frontend: http://localhost:5000"
echo "⚠️ Pressione Ctrl+C para encerrar os servidores"

# Aguardar sinal de interrupção
trap "kill $FRONTEND_PID; echo -e '\n🛑 Servidores encerrados.'; exit 0" INT
wait
