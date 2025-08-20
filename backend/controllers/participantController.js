const pool = require('../models/db');

// GET /api/participants/:tripId
exports.getParticipants = async (req, res) => {
  const { tripId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM participants WHERE trip_id = $1', [tripId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des participants' });
  }
};

// POST /api/participants/:tripId
exports.addParticipant = async (req, res) => {
  const { tripId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  try {
    const result = await pool.query(
      'INSERT INTO participants (trip_id, name) VALUES ($1, $2) RETURNING *',
      [tripId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du participant' });
  }
};

// DELETE /api/participants/:participantId
exports.deleteParticipant = async (req, res) => {
  const { participantId } = req.params;
  try {
    await pool.query('DELETE FROM participants WHERE id = $1', [participantId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du participant' });
  }
};
