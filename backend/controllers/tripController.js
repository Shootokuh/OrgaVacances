const pool = require('../models/db');

exports.getTrips = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trips ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getTrips:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addTrip = async (req, res) => {
  const { user_id, title, destination, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, title, destination, start_date, end_date]
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