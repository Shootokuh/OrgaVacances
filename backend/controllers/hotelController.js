// controllers/hotelController.js
const db = require("../models/db");

exports.getHotelsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    // Vérifie que le trip appartient à l'utilisateur
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const tripResult = await db.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    const { rows } = await db.query("SELECT * FROM hotels WHERE trip_id = $1 ORDER BY start_date", [tripId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des hôtels" });
  }
};


exports.getHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const hotelRows = await db.query("SELECT * FROM hotels WHERE id = $1", [id]);
    const hotel = hotelRows.rows[0];
    if (!hotel) return res.status(404).json({ error: "Hôtel non trouvé" });
    // Vérifie que le trip de l'hôtel appartient à l'utilisateur
    const tripResult = await db.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [hotel.trip_id, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'hôtel" });
  }
};


exports.createHotel = async (req, res) => {
  try {
    const { trip_id, name, address, start_date, end_date, reserved, notes, link } = req.body;
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    const tripResult = await db.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [trip_id, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    const { rows } = await db.query(
      `INSERT INTO hotels (trip_id, name, address, start_date, end_date, reserved, notes, link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [trip_id, name, address, start_date, end_date, reserved, notes, link]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création de l'hôtel" });
  }
};


exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, start_date, end_date, reserved, notes, link } = req.body;
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    // Vérifie que l'hôtel appartient à un trip de l'utilisateur
    const hotelRows = await db.query("SELECT * FROM hotels WHERE id = $1", [id]);
    const hotel = hotelRows.rows[0];
    if (!hotel) return res.status(404).json({ error: "Hôtel non trouvé" });
    const tripResult = await db.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [hotel.trip_id, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    const { rows } = await db.query(
      `UPDATE hotels SET name=$1, address=$2, start_date=$3, end_date=$4, reserved=$5, notes=$6, link=$7 WHERE id=$8 RETURNING *`,
      [name, address, start_date, end_date, reserved, notes, link, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'hôtel" });
  }
};


exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit' });
    const userId = userResult.rows[0].id;
    // Vérifie que l'hôtel appartient à un trip de l'utilisateur
    const hotelRows = await db.query("SELECT * FROM hotels WHERE id = $1", [id]);
    const hotel = hotelRows.rows[0];
    if (!hotel) return res.status(404).json({ error: "Hôtel non trouvé" });
    const tripResult = await db.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [hotel.trip_id, userId]);
    if (tripResult.rows.length === 0) return res.status(403).json({ error: 'Accès interdit à ce voyage' });
    await db.query("DELETE FROM hotels WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'hôtel" });
  }
};
