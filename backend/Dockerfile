# backend/Dockerfile
FROM node:18

# Dossier de travail
WORKDIR /app

# Copie des fichiers package.json
COPY backend/package*.json ./

# Copie du code source
COPY backend/. .


# Installation des dépendances
RUN npm install

# Port exposé
EXPOSE 3001

# Lancement direct du serveur Node.js
CMD ["npm", "start"]
