// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // charge les variables depuis un fichier .env

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test de connexion à la base
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur connexion DB', err);
  } else {
    console.log('✅ Connecté à PostgreSQL ! Heure actuelle :', res.rows[0].now);
  }
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Backend opérationnel !');
});

// ✅ Nouvelle route : liste des utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/users', async (req, res) => {
  const { google_id, email, name, avatar_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [google_id, email, name, avatar_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur ajout utilisateur :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Nouvelle route : liste des voyages
app.get('/api/trips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trips ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des voyages :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ✅ Nouvelle route : ajout d’un voyage
app.post('/api/trips', async (req, res) => {
  const { user_id, title, destination, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, title, destination, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur ajout voyage :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend lancé sur http://localhost:${PORT}`);
});
