const pool = require('../models/db');

// Récupérer tous les items de la checklist d'un voyage
exports.getChecklist = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  if (isNaN(tripId)) return res.status(400).json({ error: 'ID de voyage invalide' });
  try {
    const result = await pool.query('SELECT * FROM checklistitems WHERE trip_id = $1 ORDER BY id ASC', [tripId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getChecklist:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajouter un item à la checklist
exports.addChecklistItem = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const { title } = req.body;
  if (isNaN(tripId) || !title) return res.status(400).json({ error: 'Données invalides' });
  try {
    const result = await pool.query(
      'INSERT INTO checklistitems (trip_id, title) VALUES ($1, $2) RETURNING *',
      [tripId, title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addChecklistItem:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Modifier le statut coché/décoché d'un item
exports.updateChecklistItem = async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const { is_checked } = req.body;
  if (isNaN(itemId) || typeof is_checked !== 'boolean') return res.status(400).json({ error: 'Données invalides' });
  try {
    const result = await pool.query(
      'UPDATE checklistitems SET is_checked = $1 WHERE id = $2 RETURNING *',
      [is_checked, itemId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item non trouvé' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur updateChecklistItem:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un item de la checklist
exports.deleteChecklistItem = async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) return res.status(400).json({ error: 'ID invalide' });
  try {
    const result = await pool.query('DELETE FROM checklistitems WHERE id = $1 RETURNING *', [itemId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Item non trouvé' });
    res.json({ message: 'Item supprimé', deletedItem: result.rows[0] });
  } catch (err) {
    console.error('Erreur deleteChecklistItem:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
