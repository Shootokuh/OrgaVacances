// controllers/hotelController.js
const db = require("../models/db");

exports.getHotelsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { rows } = await db.query("SELECT * FROM hotels WHERE trip_id = $1 ORDER BY start_date", [tripId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des hôtels" });
  }
};


exports.getHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query("SELECT * FROM hotels WHERE id = $1", [id]);
    const hotel = rows[0];
    if (!hotel) return res.status(404).json({ error: "Hôtel non trouvé" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'hôtel" });
  }
};


exports.createHotel = async (req, res) => {
  try {
    const { trip_id, name, address, start_date, end_date, reserved, notes, link } = req.body;
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
    const { rows } = await db.query(
      `UPDATE hotels SET name=$1, address=$2, start_date=$3, end_date=$4, reserved=$5, notes=$6, link=$7 WHERE id=$8 RETURNING *`,
      [name, address, start_date, end_date, reserved, notes, link, id]
    );
    const hotel = rows[0];
    if (!hotel) return res.status(404).json({ error: "Hôtel non trouvé" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'hôtel" });
  }
};


exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM hotels WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de l'hôtel" });
  }
};
