#!/bin/sh

echo "🔄 Attente de la disponibilité de PostgreSQL sur le host 'db'..."

# Boucle jusqu’à ce que la base soit prête (nc = netcat)
until nc -z db 5432; do
  echo "⏳ PostgreSQL n’est pas encore prêt - nouvelle tentative dans 1s"
  sleep 1
done

echo "✅ PostgreSQL est prêt - démarrage du serveur Node"
exec node index.js
