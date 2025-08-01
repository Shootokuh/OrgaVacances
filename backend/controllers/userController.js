const pool = require('../models/db');

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getUsers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addUser = async (req, res) => {
  const { google_id, email, name, avatar_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [google_id, email, name, avatar_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addUser:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};