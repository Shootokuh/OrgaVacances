const pool = require('../models/db');

// Récupérer toutes les activités pour un voyage donné, triées par date
exports.getActivitiesByTrip = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE trip_id = $1 ORDER BY date ASC',
      [tripId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getActivitiesByTrip:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addActivity = async (req, res) => {
  const { trip_id, title, date, description } = req.body;

  if (!trip_id || !title || !date) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO activities (trip_id, title, date, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [trip_id, title, date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur ajout activité :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};