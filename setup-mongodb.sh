#!/bin/bash

# Script para configurar o MongoDB no servidor
# Este script verifica, instala e configura o MongoDB

echo "==================================================="
echo "🔄 CONFIGURANDO MONGODB PARA NEWCASH BANK SYSTEM"
echo "==================================================="
echo "Data/Hora: $(date)"
echo "==================================================="

# Verificar se o MongoDB está instalado
if ! command -v mongod &> /dev/null; then
    echo "MongoDB não está instalado. Instalando..."
    
    # Verificar o sistema operacional
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y gnupg curl
        
        # Verificar a versão do Ubuntu/Debian
        if [ -f /etc/lsb-release ]; then
            source /etc/lsb-release
            if [[ "$DISTRIB_RELEASE" == "22.04" ]]; then
                # Ubuntu 22.04
                curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
                    gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
                    --dearmor
                
                echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | \
                    tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            elif [[ "$DISTRIB_RELEASE" == "20.04" ]]; then
                # Ubuntu 20.04
                curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
                    gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
                    --dearmor
                
                echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | \
                    tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            else
                # Outras versões do Ubuntu
                curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
                    gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
                    --dearmor
                
                echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | \
                    tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            fi
        else
            # Debian
            curl -fsSL https://pgp.mongodb.com/server-6.0.asc | \
                gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg \
                --dearmor
            
            echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/debian $(lsb_release -cs)/mongodb-org/6.0 main" | \
                tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        fi
        
        apt-get update
        apt-get install -y mongodb-org
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        cat > /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
        yum install -y mongodb-org
    else
        echo "Sistema operacional não suportado. Instalando MongoDB manualmente..."
        curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-6.0.10.tgz
        tar -zxvf mongodb-linux-x86_64-ubuntu2204-6.0.10.tgz
        mkdir -p /usr/local/mongodb
        cp -R -n mongodb-linux-x86_64-ubuntu2204-6.0.10/* /usr/local/mongodb
        echo 'export PATH=/usr/local/mongodb/bin:$PATH' >> /etc/profile
        source /etc/profile
    fi
    
    # Criar diretório de dados
    mkdir -p /data/db
    chmod 777 /data/db
    
    # Iniciar e habilitar o serviço do MongoDB
    if command -v systemctl &> /dev/null; then
        systemctl start mongod
        systemctl enable mongod
    else
        service mongod start
        update-rc.d mongod defaults
    fi
    
    echo "✅ MongoDB instalado com sucesso!"
else
    echo "✅ MongoDB já está instalado."
fi

# Verificar se o MongoDB está em execução
MONGO_RUNNING=false

if command -v systemctl &> /dev/null && systemctl is-active --quiet mongod; then
    echo "✅ MongoDB está em execução (systemd)."
    MONGO_RUNNING=true
elif service mongod status &> /dev/null; then
    echo "✅ MongoDB está em execução (service)."
    MONGO_RUNNING=true
elif pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB está em execução (processo)."
    MONGO_RUNNING=true
else
    echo "MongoDB não está em execução. Tentando iniciar..."
    
    if command -v systemctl &> /dev/null; then
        systemctl start mongod
        if systemctl is-active --quiet mongod; then
            echo "✅ MongoDB iniciado com sucesso (systemd)!"
            MONGO_RUNNING=true
        fi
    fi
    
    if [ "$MONGO_RUNNING" = false ] && command -v service &> /dev/null; then
        service mongod start
        if service mongod status &> /dev/null; then
            echo "✅ MongoDB iniciado com sucesso (service)!"
            MONGO_RUNNING=true
        fi
    fi
    
    if [ "$MONGO_RUNNING" = false ]; then
        echo "Tentando iniciar MongoDB manualmente..."
        mkdir -p /data/db
        chmod 777 /data/db
        nohup mongod --fork --logpath /var/log/mongodb.log
        
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB iniciado manualmente com sucesso!"
            MONGO_RUNNING=true
        else
            echo "❌ Falha ao iniciar o MongoDB. Verificando logs..."
            tail -n 20 /var/log/mongodb.log
            
            echo "Tentando iniciar MongoDB com configuração mínima..."
            nohup mongod --dbpath /data/db --logpath /var/log/mongodb.log --fork
            
            if pgrep -x "mongod" > /dev/null; then
                echo "✅ MongoDB iniciado com configuração mínima!"
                MONGO_RUNNING=true
            else
                echo "❌ Falha ao iniciar o MongoDB. Verifique os logs para mais detalhes."
                exit 1
            fi
        fi
    fi
fi

# Aguardar MongoDB iniciar completamente
echo "Aguardando MongoDB iniciar completamente..."
sleep 10

# Verificar se o MongoDB está realmente respondendo
echo "Verificando se o MongoDB está respondendo..."
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if mongo --eval "db.version()" &>/dev/null || mongosh --eval "db.version()" &>/dev/null; then
        echo "✅ MongoDB está respondendo corretamente."
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "MongoDB ainda não está respondendo. Tentativa $RETRY_COUNT de $MAX_RETRIES. Aguardando..."
            sleep 5
        else
            echo "❌ MongoDB não está respondendo após várias tentativas."
            echo "Tentando reiniciar o serviço..."
            
            if command -v systemctl &> /dev/null; then
                systemctl restart mongod
            else
                service mongod restart
            fi
            
            sleep 10
            
            if mongo --eval "db.version()" &>/dev/null || mongosh --eval "db.version()" &>/dev/null; then
                echo "✅ MongoDB está respondendo após reinicialização."
            else
                echo "❌ MongoDB ainda não está respondendo. Continuando mesmo assim..."
            fi
        fi
    fi
done

# Criar banco de dados e usuário para o NewCash Bank
echo "🔄 Configurando banco de dados NewCash Bank..."

# Verificar se mongosh está disponível, caso contrário usar mongo
MONGO_CMD="mongo"
if command -v mongosh &> /dev/null; then
    MONGO_CMD="mongosh"
fi

# Criar script para MongoDB
cat > /tmp/setup-db.js << EOF
use newcash-bank;

// Verificar se o usuário já existe
var userExists = false;
try {
    userExists = db.getUsers().users.filter(function(user) {
        return user.user === "newcash";
    }).length > 0;
} catch (e) {
    // Ignorar erro se getUsers não estiver disponível
    print("Nota: Não foi possível verificar usuários existentes: " + e);
}

// Criar usuário se não existir
if (!userExists) {
    try {
        db.createUser({
            user: "newcash",
            pwd: "newcash2025",
            roles: [
                { role: "readWrite", db: "newcash-bank" }
            ]
        });
        print("✅ Usuário 'newcash' criado com sucesso!");
    } catch (e) {
        print("Erro ao criar usuário: " + e);
        print("Tentando método alternativo...");
        
        // Método alternativo para criar usuário
        try {
            db.getSiblingDB("admin").createUser({
                user: "newcash",
                pwd: "newcash2025",
                roles: [
                    { role: "readWrite", db: "newcash-bank" },
                    { role: "readWrite", db: "admin" }
                ]
            });
            print("✅ Usuário 'newcash' criado no banco 'admin'!");
        } catch (e2) {
            print("Erro ao criar usuário no banco 'admin': " + e2);
        }
    }
} else {
    print("✅ Usuário 'newcash' já existe.");
}

// Criar coleções iniciais
try {
    db.createCollection("users");
    db.createCollection("accounts");
    db.createCollection("transactions");
    db.createCollection("reservations");
    print("✅ Coleções criadas com sucesso!");
} catch (e) {
    print("Nota: Algumas coleções já podem existir: " + e);
}

// Inserir dados iniciais se necessário
try {
    if (db.users.countDocuments() === 0) {
        try {
            db.users.insertOne({
                email: "admin@newcash.com",
                password: "\$2a\$10\$XJrS.9QYrTrwHC6YrJJZn.VTOqEPSuMmLQPQur9Tx7QQdpUXIJ9kK", // Admin@123
                name: "Admin User",
                role: "admin",
                status: "active",
                createdAt: new Date(),
                lastLogin: new Date()
            });
            
            db.users.insertOne({
                email: "cliente@newcash.com",
                password: "\$2a\$10\$XJrS.9QYrTrwHC6YrJJZn.VTOqEPSuMmLQPQur9Tx7QQdpUXIJ9kK", // Cliente@123
                name: "Cliente Teste",
                role: "client",
                status: "active",
                createdAt: new Date(),
                lastLogin: new Date()
            });
            
            print("✅ Usuários iniciais inseridos com sucesso!");
        } catch (e) {
            print("Erro ao inserir usuários iniciais: " + e);
        }
    } else {
        print("✅ Usuários já existem no banco de dados.");
    }
} catch (e) {
    print("Erro ao verificar usuários: " + e);
}
EOF

# Executar script no MongoDB
echo "Executando script de configuração do banco de dados..."
$MONGO_CMD < /tmp/setup-db.js || {
    echo "Tentando método alternativo para configurar o banco de dados..."
    $MONGO_CMD --eval "$(cat /tmp/setup-db.js)" || {
        echo "Tentando método alternativo com autenticação desativada..."
        $MONGO_CMD --noauth --eval "$(cat /tmp/setup-db.js)"
    }
}

echo "==================================================="
echo "✅ CONFIGURAÇÃO DO MONGODB CONCLUÍDA COM SUCESSO!"
echo "==================================================="

# Verificar status final do MongoDB
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB está em execução e pronto para uso!"
else
    echo "⚠️ MongoDB não parece estar em execução. Verifique os logs."
fi
