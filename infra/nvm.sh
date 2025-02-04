#!/bin/bash

prompt() {
  read -p "$1 [$2]: " input
  echo "${input:-$2}"
}

NODE_VERSION=$(prompt "Enter the Node.js version to install" "18.0.0")

# Update and upgrade the system
sudo apt update && sudo apt upgrade -y

# Install necessary packages
sudo apt install -y curl git

# Install NVM and Node.js
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install $NODE_VERSION

echo "\nNVM and Node.js setup completed successfully!"