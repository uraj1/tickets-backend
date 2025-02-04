#!/bin/bash

prompt() {
  read -p "$1 [$2]: " input
  echo "${input:-$2}"
}

SERVER_PORT=$(prompt "Enter the default port your server starts on" "8001")
DOMAIN_NAME=$(prompt "Enter your domain name" "yourdomain.com")

# Install NGINX
sudo apt install -y nginx

# Set up UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Configure NGINX
NGINX_CONFIG="server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:$SERVER_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}"

NGINX_FILE="/etc/nginx/sites-available/default"
echo "$NGINX_CONFIG" | sudo tee $NGINX_FILE

# Test NGINX configuration and reload
sudo nginx -t && sudo nginx -s reload

echo "\nNGINX setup completed successfully!"
echo "Your application is running behind NGINX on port 80."