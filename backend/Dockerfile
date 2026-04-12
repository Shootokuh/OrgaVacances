# backend/Dockerfile
FROM node:18

# Dossier de travail
WORKDIR /app

# Copie des fichiers package.json
COPY package*.json ./

# Copie du code source
COPY . .


# Installation des dépendances
RUN npm install

# Port exposé
EXPOSE 3001

# Lancement direct du serveur Node.js
CMD ["npm", "start"]
