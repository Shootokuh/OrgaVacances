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
  const { trip_id, title, date, description, time, end_time, location } = req.body;

  if (!trip_id || !title || !date) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO activities (trip_id, title, date, description, time, end_time, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [trip_id, title, date, description, time, end_time, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur ajout activité :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.deleteActivity = async (req, res) => {
  const activityId = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM activities WHERE id = $1", [activityId]);
    res.status(204).send(); // No Content
  } catch (err) {
    console.error("Erreur suppression activité :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.updateActivity = async (req, res) => {
  const activityId = parseInt(req.params.id);
  const { title, date, time, end_time, location, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const result = await pool.query(
      `UPDATE activities
       SET title = $1,
           date = $2,
           time = $3,
           end_time = $4,
           location = $5,
           description = $6
       WHERE id = $7
       RETURNING *`,
      [
        title,
        date,
        time === "" ? null : time,
        end_time === "" ? null : end_time,
        location === "" ? null : location,
        description,
        activityId,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur modification activité :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
