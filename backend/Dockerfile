# backend/Dockerfile
FROM node:18

# Installe netcat (nc)
RUN apt-get update && apt-get install -y netcat-openbsd

# Dossier de travail
WORKDIR /app

# Copie des fichiers package.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .


# Port exposé
EXPOSE 3001

# Lancement direct du serveur Node.js
CMD ["npm", "start"]
