#!/bin/bash
# Script para corrigir completamente o frontend do NewCash Bank System
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Script de correção completa do frontend do NewCash Bank System ==="

# Verificar se estamos no diretório correto
if [ ! -d "frontend" ]; then
  echo "Erro: Execute este script no diretório raiz do projeto"
  exit 1
fi

# Verificar e criar o arquivo index.css se não existir
if [ ! -f "frontend/src/index.css" ]; then
  echo "Criando arquivo index.css..."
  cat > frontend/src/index.css << 'EOF'
body {
  margin: 0;
  font-family: 'Roboto', 'Segoe UI', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Cor de fundo para o gradiente do topo da página */
.top-gradient {
  background: linear-gradient(135deg, #00234B 0%, #1E3D70 100%);
}

/* Estilos para cards importantes */
.highlight-card {
  border-left: 4px solid #00234B;
  transition: all 0.3s ease;
}

.highlight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 35, 75, 0.12);
}

/* Estilos para botões de ação */
.action-button {
  background-color: #00234B;
  color: white;
  transition: all 0.3s ease;
}

.action-button:hover {
  background-color: #1E3D70;
  box-shadow: 0 4px 8px rgba(0, 35, 75, 0.2);
}

/* Estilos para o rodapé */
.footer {
  background-color: #00234B;
  color: white;
  padding: 1rem 0;
}

/* Animação de loading personalizada */
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 35, 75, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 35, 75, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 35, 75, 0);
  }
}

.pulse-effect {
  animation: pulse 1.5s infinite;
}

/* Botões de destaque */
.highlight-button {
  background-color: #FFB800 !important;
  color: #000000 !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.highlight-button:hover {
  background-color: #D19A00 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(209, 154, 0, 0.3) !important;
}

/* Estilo para números e valores financeiros */
.currency-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  color: #00234B;
}

.positive-amount {
  color: #2e7d32;
}

.negative-amount {
  color: #d32f2f;
}

/* Bordas arredondadas personalizadas */
.rounded-corners {
  border-radius: 8px;
  overflow: hidden;
}

/* Sombras personalizadas */
.custom-shadow {
  box-shadow: 0 2px 8px rgba(0, 35, 75, 0.1);
}

/* Estilos globais para o NewCash Bank System */
:root {
  --primary-color: #000000;
  --secondary-color: #ffffff;
  --accent-color: #f5f5f5;
  --text-primary: #333333;
  --text-secondary: #666666;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;
}

/* Estilos para formulários */
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Estilos para tabelas */
.table-container {
  width: 100%;
  overflow-x: auto;
}

/* Estilos para cards */
.card-hover:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Estilos para o contêiner de carregamento */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}
EOF
fi

# Verificar e criar o arquivo reportWebVitals.js se não existir
if [ ! -f "frontend/src/reportWebVitals.js" ]; then
  echo "Criando arquivo reportWebVitals.js..."
  cat > frontend/src/reportWebVitals.js << 'EOF'
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
EOF
fi

# Verificar e criar o arquivo App.js se não existir
if [ ! -f "frontend/src/App.js" ]; then
  echo "Criando arquivo App.js..."
  cat > frontend/src/App.js << 'EOF'
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ClientDashboard from './pages/client/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/client/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}

export default App;
EOF
fi

# Verificar e criar o arquivo index.js se não existir
if [ ! -f "frontend/src/index.js" ]; then
  echo "Criando arquivo index.js..."
  cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOF
fi

# Criar diretórios necessários
mkdir -p frontend/src/pages
mkdir -p frontend/src/pages/admin
mkdir -p frontend/src/pages/client

# Verificar e criar o arquivo Login.js se não existir
if [ ! -f "frontend/src/pages/Login.js" ]; then
  echo "Criando arquivo Login.js..."
  cat > frontend/src/pages/Login.js << 'EOF'
import React from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';

function Login() {
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            NewCash Bank System
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Entrar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
EOF
fi

# Verificar e criar o arquivo admin/Dashboard.js se não existir
if [ ! -f "frontend/src/pages/admin/Dashboard.js" ]; then
  echo "Criando arquivo admin/Dashboard.js..."
  cat > frontend/src/pages/admin/Dashboard.js << 'EOF'
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function AdminDashboard() {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">
          Painel de Administração
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bem-vindo ao painel administrativo do NewCash Bank System.
        </Typography>
      </Box>
    </Container>
  );
}

export default AdminDashboard;
EOF
fi

# Verificar e criar o arquivo client/Dashboard.js se não existir
if [ ! -f "frontend/src/pages/client/Dashboard.js" ]; then
  echo "Criando arquivo client/Dashboard.js..."
  cat > frontend/src/pages/client/Dashboard.js << 'EOF'
import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function ClientDashboard() {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">
          Painel do Cliente
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bem-vindo ao seu painel do NewCash Bank System.
        </Typography>
      </Box>
    </Container>
  );
}

export default ClientDashboard;
EOF
fi

# Criar script de deploy para o servidor
cat > deploy-server.sh << 'EOF'
#!/bin/bash
# Script para deploy do NewCash Bank System no servidor
# Autor: Dennis Canteli
# Data: 06/03/2025

echo "=== Iniciando deploy do NewCash Bank System ==="

# Criar diretório de trabalho
mkdir -p /var/www/newcash-bank
cd /var/www/newcash-bank

# Clonar repositório
git clone https://github.com/dennisiautomation/newcastft.git .
git checkout fix-ft-api-integration

# Instalar dependências do backend
cd backend
npm install --legacy-peer-deps
cd ..

# Instalar dependências e construir o frontend
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Configurar arquivo .env
cat > backend/.env << 'ENVFILE'
MONGODB_OFFLINE_MODE=true
MONGODB_URI=mongodb://localhost:27017/newcash
JWT_SECRET=newcash-bank-system-secret-key-2025
PORT=3001
ENVFILE

# Configurar Nginx
cat > /etc/nginx/sites-available/newcash << 'NGINX'
server {
    listen 80;
    server_name global.newcashbank.com.br;

    location / {
        root /var/www/newcash-bank/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

# Ativar site e reiniciar Nginx
ln -sf /etc/nginx/sites-available/newcash /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Iniciar aplicação com PM2
cd backend
pm2 delete newcash-bank 2>/dev/null || true
pm2 start server.js --name newcash-bank
pm2 save
pm2 startup

# Configurar SSL com Let's Encrypt
certbot --nginx -d global.newcashbank.com.br --non-interactive --agree-tos --email admin@newcashbank.com.br

echo "=== Deploy concluído ==="
echo "Acesse https://global.newcashbank.com.br/ para verificar se o sistema está funcionando."
EOF

chmod +x deploy-server.sh

echo "=== Script de correção concluído ==="
echo "Agora você pode fazer o commit e push para o repositório."
