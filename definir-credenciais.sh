#!/bin/bash

# Script para definir as credenciais corretas no sistema NewCash Bank
# Autor: Dennis Canteli
# Data: 07/03/2025

echo "=== Configurando credenciais corretas no sistema NewCash Bank ==="

# Verificar se está rodando como root
if [ "$(id -u)" != "0" ]; then
   echo "Este script deve ser executado como root" 
   exit 1
fi

# Diretório do backend
BACKEND_DIR="/var/www/newcash-bank/backend"

# Criar script para definir as credenciais
cat > $BACKEND_DIR/setup-credentials.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Modelo de usuário simplificado para o script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  status: String,
  twoFactorEnabled: Boolean,
  failedLoginAttempts: Number,
  createdAt: Date,
  updatedAt: Date
});

// Método para hash de senha
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Função principal
async function setupCredentials() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newcash-bank', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conexão estabelecida com sucesso!');
    
    // Remover usuários existentes
    console.log('Removendo usuários existentes...');
    await User.deleteMany({});
    
    // Criar usuário admin
    console.log('Criando usuário admin...');
    const admin = new User({
      name: 'Administrador',
      email: 'admin@newcashbank.com.br',
      password: 'admin123',  // Será hasheada automaticamente
      role: 'admin',
      status: 'active',
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await admin.save();
    
    // Criar usuário cliente
    console.log('Criando usuário cliente...');
    const client = new User({
      name: 'Cliente',
      email: 'cliente@newcashbank.com.br',
      password: 'cliente1',  // Será hasheada automaticamente
      role: 'client',
      status: 'active',
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await client.save();
    
    console.log('Credenciais configuradas com sucesso!');
    console.log('Admin: admin@newcashbank.com.br / admin123');
    console.log('Cliente: cliente@newcashbank.com.br / cliente1');
    
    // Fechar conexão
    await mongoose.connection.close();
    console.log('Conexão com MongoDB fechada.');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao configurar credenciais:', error);
    process.exit(1);
  }
}

// Executar função principal
setupCredentials();
EOF

# Executar o script
echo "Instalando dependências necessárias..."
cd $BACKEND_DIR
npm install bcryptjs mongoose dotenv

echo "Configurando credenciais..."
node setup-credentials.js

echo "Reiniciando o servidor..."
pm2 restart newcash-bank

echo "=== Configuração de credenciais concluída ==="
echo "Agora você pode acessar o sistema com as seguintes credenciais:"
echo "Admin: admin@newcashbank.com.br / admin123"
echo "Cliente: cliente@newcashbank.com.br / cliente1"
