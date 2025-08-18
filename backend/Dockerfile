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


# Copie du code source (y compris le script d’attente)
COPY . .

# Donne les droits d’exécution au script d’attente (chemin explicite)
RUN chmod +x /app/wait-for-postgres.sh

# Port exposé
EXPOSE 3001

# Lancement avec attente de la DB
CMD ["./wait-for-postgres.sh"]
