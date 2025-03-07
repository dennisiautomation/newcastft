#!/bin/bash

# Função para logs
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

cd /var/www/newcashbank/backend

# Configurar rotas da FT Asset Management
log "Configurando rotas da FT Asset Management..."
cat > routes/ftApi.routes.js << 'EOL'
const express = require('express');
const router = express.Router();

router.get('/accounts', (req, res) => {
    res.json({
        accounts: [
            { id: '60428', type: 'USD', balance: 1000000.00 },
            { id: '60429', type: 'EUR', balance: 850000.00 }
        ]
    });
});

router.post('/transfer', (req, res) => {
    res.json({
        status: 'success',
        message: 'Transferência realizada com sucesso',
        transaction: {
            id: Date.now(),
            amount: req.body.amount,
            from: req.body.from,
            to: req.body.to,
            date: new Date()
        }
    });
});

module.exports = router;
EOL

# Configurar rotas de conta
log "Configurando rotas de conta..."
cat > routes/account.routes.js << 'EOL'
const express = require('express');
const router = express.Router();

router.get('/balance', (req, res) => {
    res.json({
        usd: { account: '60428', balance: 1000000.00 },
        eur: { account: '60429', balance: 850000.00 }
    });
});

router.get('/statement', (req, res) => {
    res.json({
        transactions: [
            {
                id: '1',
                type: 'credit',
                amount: 50000,
                date: new Date(),
                description: 'Depósito'
            }
        ]
    });
});

module.exports = router;
EOL

# Reiniciar backend
log "Reiniciando backend..."
pm2 restart newcashbank-backend
pm2 save

# Testar rotas
log "\nTestando rotas..."
curl http://localhost:3001/api/ftApi/accounts
echo -e "\n"
curl http://localhost:3001/api/account/balance

log "\nRotas configuradas e testadas!"
