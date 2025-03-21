/**
 * Dados de usuários pré-definidos para o modo offline
 * Usado quando o MongoDB não está disponível
 */

const bcrypt = require('bcryptjs');

// Hash da senha (simulando o que o MongoDB faria)
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// Usuários pré-definidos
const users = [
  {
    _id: 'admin-001',
    name: 'Administrador',
    email: 'admin@newcashbank.com.br',
    password: hashPassword('admin123'),
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01')
  },
  {
    _id: 'client-001',
    name: 'Cliente Padrão',
    email: 'cliente@newcashbank.com.br',
    password: hashPassword('cliente1'),
    role: 'CLIENT',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-10')
  },
  {
    _id: 'client-002',
    name: 'SHIGEMI MATSUMOTO',
    email: 'shigemi.matsumoto@newcashbank.com.br',
    password: hashPassword('Eriyasu2023!'),
    role: 'CLIENT',
    status: 'ACTIVE',
    createdAt: new Date('2025-03-21'),
    companyInfo: {
      name: "ERIYASU.CO.LTD", 
      legalName: "ERIYASU.CO.JP",
      address: "6-14 Matsuyamachi Station Building 6B, Chuo-ku, Osaka",
      country: "JAPAN",
      registerNumber: "1200-01-233046"
    },
    accountInfo: {
      accountNumber: "778908",
      type: "CORPORATE",
      currency: ["USD", "EUR"]
    }
  }
];

// Métodos auxiliares para simular o MongoDB
const findUserByEmail = (email) => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase());
};

const findUserById = (id) => {
  return users.find(user => user._id === id);
};

const comparePassword = (inputPassword, hashedPassword) => {
  return bcrypt.compareSync(inputPassword, hashedPassword);
};

module.exports = {
  users,
  findUserByEmail,
  findUserById,
  comparePassword
};
