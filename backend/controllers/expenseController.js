const pool = require('../models/db');

// ✅ Obtenir toutes les dépenses d’un voyage avec les bénéficiaires
exports.getExpensesByTrip = async (req, res) => {
  const tripId = parseInt(req.params.tripId);
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Vérifie que le trip appartient à l'utilisateur
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    // Récupérer toutes les dépenses du voyage
    const result = await pool.query(
      `SELECT * FROM expenses WHERE trip_id = $1 ORDER BY date DESC`,
      [tripId]
    );
    const expenses = result.rows;

    // Pour chaque dépense, récupérer les participants bénéficiaires
    const expenseIds = expenses.map(e => e.id);
    let participantsMap = {};
    if (expenseIds.length > 0) {
      const partResult = await pool.query(
        `SELECT ep.expense_id, p.id, p.name FROM expense_participants ep
         JOIN participants p ON ep.participant_id = p.id
         WHERE ep.expense_id = ANY($1)`,
        [expenseIds]
      );
      // Regrouper par expense_id
      participantsMap = partResult.rows.reduce((acc, row) => {
        if (!acc[row.expense_id]) acc[row.expense_id] = [];
        acc[row.expense_id].push({ id: row.id, name: row.name });
        return acc;
      }, {});
    }

    // Ajouter les participants à chaque dépense
    const expensesWithParticipants = expenses.map(e => ({
      ...e,
      participants: participantsMap[e.id] || []
    }));
    res.json(expensesWithParticipants);
  } catch (err) {
    console.error("Erreur getExpensesByTrip :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ✅ Ajouter une dépense avec participants bénéficiaires
exports.addExpense = async (req, res) => {
  const { trip_id, category, amount, description, date, paid_by, participant_ids } = req.body;

  if (!trip_id || !category || !amount || !date) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  // Vérifie que le trip appartient à l'utilisateur
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
  const userId = userResult.rows[0].id;
  const tripResult = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [trip_id, userId]);
  if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO expenses (trip_id, category, amount, description, date, paid_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [trip_id, category, amount, description, date, paid_by]
    );
    const expense = result.rows[0];

    // Insérer les bénéficiaires si fournis
    if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
      const values = participant_ids.map(pid => `(${expense.id}, ${pid})`).join(',');
      await client.query(
        `INSERT INTO expense_participants (expense_id, participant_id) VALUES ${values}`
      );
    }
    await client.query('COMMIT');

    // Retourner la dépense avec les participants
    const partResult = await pool.query(
      `SELECT p.id, p.name FROM expense_participants ep JOIN participants p ON ep.participant_id = p.id WHERE ep.expense_id = $1`,
      [expense.id]
    );
    res.status(201).json({ ...expense, participants: partResult.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erreur ajout dépense :", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
};

// ✅ Modifier une dépense et ses bénéficiaires
exports.updateExpense = async (req, res) => {
  const expenseId = parseInt(req.params.id);
  const { category, amount, description, date, paid_by, participant_ids } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE expenses
       SET category = $1, amount = $2, description = $3, date = $4, paid_by = $5
       WHERE id = $6
       RETURNING *`,
      [category, amount, description, date, paid_by, expenseId]
    );
    // Mettre à jour les bénéficiaires
    await client.query(`DELETE FROM expense_participants WHERE expense_id = $1`, [expenseId]);
    if (participant_ids && Array.isArray(participant_ids) && participant_ids.length > 0) {
      const values = participant_ids.map(pid => `(${expenseId}, ${pid})`).join(',');
      await client.query(
        `INSERT INTO expense_participants (expense_id, participant_id) VALUES ${values}`
      );
    }
    await client.query('COMMIT');

    // Retourner la dépense avec les participants
    const expense = result.rows[0];
    const partResult = await pool.query(
      `SELECT p.id, p.name FROM expense_participants ep JOIN participants p ON ep.participant_id = p.id WHERE ep.expense_id = $1`,
      [expenseId]
    );
    res.json({ ...expense, participants: partResult.rows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erreur update dépense :", err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
};

// ✅ Supprimer une dépense (les bénéficiaires sont supprimés en cascade)
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
