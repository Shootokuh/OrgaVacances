const pool = require('../models/db');

exports.getTrips = async (req, res) => {
  // Récupère l'utilisateur via le token
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const jwt = require('jsonwebtoken');
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  try {
    const result = await pool.query('SELECT * FROM trips WHERE user_id = $1 ORDER BY id ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getTrips:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addTrip = async (req, res) => {
  // Récupère l'utilisateur via le token
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const jwt = require('jsonwebtoken');
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  const { title, destination, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, destination, start_date, end_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addTrip:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);

  if (isNaN(tripId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const result = await pool.query('DELETE FROM trips WHERE id = $1 RETURNING *', [tripId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Voyage non trouvé' });
    }

    res.json({ message: 'Voyage supprimé avec succès', deletedTrip: result.rows[0] });
  } catch (err) {
    console.error('Erreur deleteTrip:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.updateTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
  const { budget } = req.body;

  if (isNaN(tripId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  if (budget === undefined) {
    return res.status(400).json({ error: 'Budget manquant' });
  }

  try {
    const result = await pool.query(
      'UPDATE trips SET budget = $1 WHERE id = $2 RETURNING *',
      [budget, tripId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Voyage non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur updateTrip:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};