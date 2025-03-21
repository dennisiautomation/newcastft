/**
 * Script para fazer login com o cliente japonês
 * Este script simula um login bem-sucedido para o cliente SHIGEMI MATSUMOTO
 */

// Dados de login para o cliente japonês
const loginData = {
  email: "shigemi.matsumoto@newcashbank.com.br",
  password: "Eriyasu2023!"
};

// Função que simula o login (para ser usada no console/desenvolvimento)
function simulateLogin() {
  console.log(`
=====================================================
NEWCASH BANK SYSTEM - SIMULAÇÃO DE LOGIN
=====================================================

Detalhes do cliente:
- Nome: SHIGEMI MATSUMOTO
- Email: ${loginData.email}
- Empresa: ERIYASU.CO.LTD
- Número da conta: 778908
- Moedas disponíveis: USD, EUR

Para fazer login no sistema, use:
- Email: ${loginData.email}
- Senha: ${loginData.password}

INSTRUÇÕES:
1. Acesse http://localhost:3000
2. Insira as credenciais acima
3. Se o login falhar, entre com as credenciais alternativas:
   - Email: cliente@newcashbank.com.br
   - Senha: cliente1

=====================================================
`);
  
  // Simular um token JWT para desenvolvimento
  const jwt = {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudC0wMDIiLCJyb2xlIjoiQ0xJRU5UIiwiaWF0IjoxNzExMDQxNDk3LCJleHAiOjE3MTExMjc4OTd9.6LM8sU3bH7hLwAzPqOsYA5XZ4rTkWY3TQVLGvLnZ1H0",
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsaWVudC0wMDIiLCJpYXQiOjE3MTEwNDE0OTcsImV4cCI6MTcxMTY0NjI5N30.VXZvCJ1OxS5KuSzK3Z0jK6l0Z9wJ9bV3vD4F6vZ1fxM"
  };
  
  // Simular os dados do usuário
  const userData = {
    id: "client-002",
    name: "SHIGEMI MATSUMOTO",
    email: "shigemi.matsumoto@newcashbank.com.br",
    role: "CLIENT",
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
  };
  
  // Simular a resposta do servidor
  return {
    status: 'success',
    message: 'Login realizado com sucesso',
    data: {
      user: userData,
      ...jwt
    }
  };
}

// Executar a função
const result = simulateLogin();

// Exportar para uso em outros módulos
module.exports = {
  loginData,
  simulateLogin
};
