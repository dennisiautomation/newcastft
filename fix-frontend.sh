#!/bin/bash
echo "=== Script de correção do frontend do NewCash Bank System ==="

# Acessar diretório do frontend
cd /var/www/newcash-bank/frontend

# Criar arquivo reportWebVitals.js
echo "Criando arquivo reportWebVitals.js..."
cat > src/reportWebVitals.js << 'EOF'
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

# Verificar e corrigir o arquivo index.js
echo "Verificando arquivo index.js..."
if [ -f "src/index.js" ]; then
  # Garantir que o import do reportWebVitals está presente
  grep -q "reportWebVitals" src/index.js
  if [ $? -ne 0 ]; then
    echo "Adicionando import do reportWebVitals ao index.js..."
    echo "import reportWebVitals from './reportWebVitals';" >> src/index.js
    echo "reportWebVitals();" >> src/index.js
  fi
else
  echo "Criando arquivo index.js..."
  cat > src/index.js << 'EOF'
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

# Instalar dependências
echo "Instalando dependências..."
npm install web-vitals --legacy-peer-deps
npm install react-router-dom @mui/material @emotion/react @emotion/styled --legacy-peer-deps

# Construir o frontend
echo "Construindo o frontend..."
npm run build

# Configurar Nginx para servir o frontend
echo "Configurando Nginx..."
cat > /etc/nginx/sites-available/newcash << 'EOF'
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
EOF

# Ativar site e reiniciar Nginx
ln -sf /etc/nginx/sites-available/newcash /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# Configurar SSL com Let's Encrypt
echo "Configurando SSL com Let's Encrypt..."
certbot --nginx -d global.newcashbank.com.br --non-interactive --agree-tos --email admin@newcashbank.com.br

echo "=== Correção do frontend concluída ==="
echo "Acesse https://global.newcashbank.com.br/ para verificar se o sistema está funcionando."
