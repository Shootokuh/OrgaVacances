// Récupère un trip par son id, seulement si l'utilisateur y a accès (owner ou viewer)
exports.getTripById = async (req, res) => {
  const tripId = parseInt(req.params.id);
  if (isNaN(tripId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Récupère l'id utilisateur interne à partir de l'email Firebase
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
    }
    const userId = userResult.rows[0].id;
    // Vérifie l'accès à ce trip
    const tripUserModel = require('../models/tripUser');
    const hasAccess = await tripUserModel.userHasAccessToTrip(tripId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Accès refusé à ce voyage' });
    }
    // Récupère le trip
    const result = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Voyage non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur getTripById:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
const pool = require('../models/db');

exports.getTrips = async (req, res) => {
  // Utilise l'utilisateur Firebase injecté par le middleware
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    // Récupère l'id utilisateur interne à partir de l'email Firebase
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
    }
    const userId = userResult.rows[0].id;
    // Récupère tous les trips accessibles par l'utilisateur (owner ou viewer)
    const tripUserModel = require('../models/tripUser');
    const accessibleTripIds = await tripUserModel.getTripsForUser(userId);
    let trips = [];
    if (accessibleTripIds.length > 0) {
      // Récupère tous les trips accessibles
      const result = await pool.query(
        `SELECT * FROM trips WHERE id = ANY($1::int[]) ORDER BY id ASC`,
        [accessibleTripIds]
      );
      const tripUserRes = await pool.query(
        `SELECT trip_id, role FROM trip_users WHERE user_id = $1 AND trip_id = ANY($2::int[])`,
        [userId, accessibleTripIds]
      );
      const tripRoles = {};
      for (const row of tripUserRes.rows) {
        tripRoles[row.trip_id] = row.role;
      }
      trips = result.rows.map(trip => ({ ...trip, role: tripRoles[trip.id] || 'viewer' }));
    }
    res.json(trips);
  } catch (err) {
    console.error('Erreur getTrips:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addTrip = async (req, res) => {
  // Utilise l'utilisateur Firebase injecté par le middleware
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  const { title, destination, start_date, end_date } = req.body;
  try {
    // Récupère l'id et le nom utilisateur interne à partir de l'email Firebase
    const userResult = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
    }
    const userId = userResult.rows[0].id;
    const userName = userResult.rows[0].name || 'Moi';

    // Créer le voyage
    const result = await pool.query(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, destination, start_date, end_date]
    );
    const trip = result.rows[0];

    // Ajouter le créateur comme participant
    await pool.query('INSERT INTO participants (trip_id, name) VALUES ($1, $2)', [trip.id, userName]);

    // Ajouter le créateur dans trip_users comme owner
    const tripUserModel = require('../models/tripUser');
    await tripUserModel.addUserToTrip(trip.id, userId, 'owner');

    res.status(201).json(trip);
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

exports.updateTrip = async (req, res) => {
  const tripId = parseInt(req.params.id);
  const { budget } = req.body;

  if (isNaN(tripId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  if (budget === undefined) {
    return res.status(400).json({ error: 'Budget manquant' });
  }

  try {
    const result = await pool.query(
      'UPDATE trips SET budget = $1 WHERE id = $2 RETURNING *',
      [budget, tripId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Voyage non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur updateTrip:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};