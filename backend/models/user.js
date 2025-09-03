// backend/models/user.js
const pool = require('./db');

// Trouve un utilisateur par email
exports.findByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
};

// (Optionnel) Trouve un utilisateur par id
exports.findById = async (id) => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};
