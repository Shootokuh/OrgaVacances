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
# Copie la clé de service Firebase uniquement si présente (utile en local, ignorée en prod cloud)
COPY firebase-service-account.json ./firebase-service-account.json

# Donne les droits d’exécution au script d’attente
RUN chmod +x wait-for-postgres.sh

# Port exposé
EXPOSE 3001

# Lancement avec attente de la DB
CMD ["./wait-for-postgres.sh"]
