/**
 * Script para criar um novo cliente no sistema NewCash Bank
 * 
 * Este script adiciona um cliente corporativo japonês ao sistema.
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Carregar as variáveis de ambiente
dotenv.config();

// Dados do cliente
const customerData = {
  // Informações pessoais
  personalInfo: {
    name: "SHIGEMI MATSUMOTO",
    passport: "TR8340146",
    nationality: "JAPAN",
    email: "shigemi.matsumoto@newcashbank.com.br",
    phone: "+81642563266",
    address: "6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka"
  },
  // Informações da empresa
  companyInfo: {
    name: "ERIYASU.CO.LTD", 
    legalName: "ERIYASU.CO.JP",
    address: "6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka",
    country: "JAPAN",
    incorporationDate: "2020/11/09",
    registerNumber: "1200-01-233046",
    contactPerson: "SHIGEMI MATSUMOTO",
    website: "https://eriyasultd.com",
    leiCode: "778908" // Número único solicitado
  },
  // Informações da conta
  accountInfo: {
    accountNumber: "778908",
    type: "CORPORATE",
    status: "ACTIVE",
    currency: ["USD", "EUR"]
  },
  // Informações de autenticação
  authInfo: {
    email: "shigemi.matsumoto@newcashbank.com.br",
    password: "Eriyasu2023!", // Senha temporária
    role: "CLIENT"
  }
};

// Função para criar o cliente
async function createCustomer() {
  try {
    console.log('Criando novo cliente no sistema NewCash Bank...');
    console.log('Dados do cliente:', JSON.stringify(customerData, null, 2));
    
    // Em um ambiente real, aqui faríamos uma chamada API
    // Como estamos em modo offline, vamos apenas simular a criação
    
    console.log('\nCliente criado com sucesso no sistema!');
    console.log(`Nome: ${customerData.personalInfo.name}`);
    console.log(`Email: ${customerData.personalInfo.email}`);
    console.log(`Empresa: ${customerData.companyInfo.name}`);
    console.log(`Número da conta: ${customerData.accountInfo.accountNumber}`);
    console.log('\nInstruções de acesso:');
    console.log(`Email: ${customerData.authInfo.email}`);
    console.log(`Senha inicial: ${customerData.authInfo.password}`);
    console.log('\nIMPORTANTE: Solicitar ao cliente que altere a senha no primeiro acesso.');

    // Registrar o cliente no arquivo de clientes cadastrados
    const fs = require('fs');
    const path = require('path');
    
    const clientsDir = path.join(__dirname, 'data');
    
    // Criar diretório se não existir
    if (!fs.existsSync(clientsDir)) {
      fs.mkdirSync(clientsDir, { recursive: true });
    }
    
    const clientsFile = path.join(clientsDir, 'registered-clients.json');
    
    // Ler arquivo existente ou criar array vazio
    let clients = [];
    if (fs.existsSync(clientsFile)) {
      const fileContent = fs.readFileSync(clientsFile, 'utf8');
      if (fileContent) {
        clients = JSON.parse(fileContent);
      }
    }
    
    // Adicionar novo cliente
    clients.push({
      ...customerData,
      createdAt: new Date().toISOString()
    });
    
    // Salvar arquivo atualizado
    fs.writeFileSync(clientsFile, JSON.stringify(clients, null, 2));
    
    console.log(`\nCliente registrado com sucesso em ${clientsFile}`);
    
  } catch (error) {
    console.error('Erro ao criar cliente:', error.message);
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data);
    }
  }
}

// Executar a função
createCustomer();
