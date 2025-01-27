#!/bin/bash

prompt() {
  read -p "$1 [$2]: " input
  echo "${input:-$2}"
}

NODE_VERSION=$(prompt "Enter the Node.js version to install" "15.0.0")
REPO_URL=$(prompt "Enter the GitHub repository URL to clone" "https://github.com/example/repo.git")
SERVER_PORT=$(prompt "Enter the default port your server starts on" "8001")
DOMAIN_NAME=$(prompt "Enter your domain name" "yourdomain.com")

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install $NODE_VERSION

git clone $REPO_URL

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

sudo nginx -t && sudo nginx -s reload

echo "\nSetup completed successfully!"
echo "Your application is running behind NGINX on port 80."