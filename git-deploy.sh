#!/bin/bash

# Script para enviar atualizações para o Git
# Autor: Dennis Canteli
# Data: 21/03/2025

echo "==================================================="
echo "🚀 ENVIANDO ATUALIZAÇÕES PARA O GIT"
echo "==================================================="
echo "Data/Hora: $(date)"
echo "==================================================="

# Adicionar todas as alterações ao Git
echo -e "\n🔄 Adicionando alterações ao Git..."
git add .

# Criar um commit com mensagem
echo -e "\n🔄 Criando commit..."
MENSAGEM="Atualização $(date +%d/%m/%Y): Correções de rotas, menu e ajustes de balances"
git commit -m "$MENSAGEM"

# Enviar para o repositório remoto
echo -e "\n🔄 Enviando para o repositório remoto (origin/main)..."
git push origin main

echo -e "\n✅ Alterações enviadas com sucesso!"
echo "📝 Mensagem do commit: $MENSAGEM"
