const pool = require('../models/db');

// GET /api/participants/:tripId
exports.getParticipants = async (req, res) => {
  const { tripId } = req.params;
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Vérifie que le trip appartient à l'utilisateur
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
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
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Vérifie que le trip appartient à l'utilisateur
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
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
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Vérifie que le participant appartient à un trip de l'utilisateur
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const partRows = await pool.query('SELECT * FROM participants WHERE id = $1', [participantId]);
    const participant = partRows.rows[0];
    if (!participant) return res.status(404).json({ error: 'Participant non trouvé' });
    const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [participant.trip_id, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    await pool.query('DELETE FROM participants WHERE id = $1', [participantId]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du participant' });
  }
};
