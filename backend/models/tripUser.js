// Modèle pour la gestion du partage de trips entre utilisateurs
const pool = require('./db');

// Ajoute un utilisateur à un trip (partage)
exports.addUserToTrip = async (tripId, userId, role = 'viewer') => {
  await pool.query(
    'INSERT INTO trip_users (trip_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [tripId, userId, role]
  );
};

// Retire un utilisateur d'un trip
exports.removeUserFromTrip = async (tripId, userId) => {
  await pool.query(
    'DELETE FROM trip_users WHERE trip_id = $1 AND user_id = $2',
    [tripId, userId]
  );
};

// Récupère tous les utilisateurs ayant accès à un trip
exports.getUsersForTrip = async (tripId) => {
  const res = await pool.query(
    `SELECT u.id, u.email, tu.role FROM trip_users tu JOIN users u ON tu.user_id = u.id WHERE tu.trip_id = $1`,
    [tripId]
  );
  return res.rows;
};

// Vérifie si un utilisateur a accès à un trip
exports.userHasAccessToTrip = async (tripId, userId) => {
  const res = await pool.query(
    'SELECT 1 FROM trip_users WHERE trip_id = $1 AND user_id = $2',
    [tripId, userId]
  );
  return res.rowCount > 0;
};

// Récupère tous les trips accessibles par un utilisateur
exports.getTripsForUser = async (userId) => {
  const res = await pool.query(
    'SELECT trip_id FROM trip_users WHERE user_id = $1',
    [userId]
  );
  return res.rows.map(r => r.trip_id);
};
