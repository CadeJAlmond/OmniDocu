#!/bin/sh
# Init script for PGAdmin - Creates an initial database server entry
# This script runs when the pgadmin container starts

# Create the servers.json file with PostgreSQL connection details
# It will be loaded by pgAdmin on first start

mkdir -p /var/lib/pgadmin

cat > /var/lib/pgadmin/servers.json << 'EOF'
{
    "Servers": {
        "1": {
            "Name": "OmniDocu PostgreSQL",
            "Group": "Servers",
            "Host": "postgres",
            "Port": 5432,
            "MaintenanceDB": "omnidocu_db",
            "Username": "omnidocu",
            "Password": "omnidocu_password",
            "SavePassword": true,
            "SSLMode": "prefer"
        }
    }
}
EOF

echo "PGAdmin server configuration created successfully!"