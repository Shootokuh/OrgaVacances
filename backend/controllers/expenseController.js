const pool = require('../models/db');

// ✅ Obtenir toutes les dépenses d’un voyage
exports.getExpensesByTrip = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  try {
    const result = await pool.query(
      `SELECT * FROM expenses WHERE trip_id = $1 ORDER BY date DESC`,
      [tripId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getExpensesByTrip :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Ajouter une dépense
exports.addExpense = async (req, res) => {
  const { trip_id, category, amount, description, date, paid_by } = req.body;

  if (!trip_id || !category || !amount || !date) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (trip_id, category, amount, description, date, paid_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [trip_id, category, amount, description, date, paid_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur ajout dépense :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Modifier une dépense
exports.updateExpense = async (req, res) => {
  const expenseId = parseInt(req.params.id);
  const { category, amount, description, date, paid_by } = req.body;

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET category = $1, amount = $2, description = $3, date = $4, paid_by = $5
       WHERE id = $6
       RETURNING *`,
      [category, amount, description, date, paid_by, expenseId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur update dépense :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Supprimer une dépense
exports.deleteExpense = async (req, res) => {
  const expenseId = parseInt(req.params.id);
  try {
    await pool.query(`DELETE FROM expenses WHERE id = $1`, [expenseId]);
    res.status(204).send(); // No Content
  } catch (err) {
    console.error("Erreur suppression dépense :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
