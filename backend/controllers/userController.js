const jwt = require('jsonwebtoken');
const pool = require('../models/db');
const bcrypt = require('bcrypt');


exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getUsers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.addUser = async (req, res) => {
  const { google_id, email, name, avatar_url, password } = req.body;
  try {
    let password_hash = null;
    if (password) {
      const saltRounds = 10;
      password_hash = await bcrypt.hash(password, saltRounds);
    }
    const result = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar_url, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [google_id || null, email, name, avatar_url || null, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addUser:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.register = async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [email, name, password_hash]
    );
    res.status(201).json({ id: result.rows[0].id, email: result.rows[0].email, name: result.rows[0].name });
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User query result:', userResult.rows);
    if (userResult.rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Utilisateur ou mot de passe incorrect' });
    }
    const user = userResult.rows[0];
    if (!user.password_hash) {
      console.log('User has no password_hash');
      return res.status(401).json({ error: 'Utilisateur sans mot de passe, utilisez Google' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', valid);
    if (!valid) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Utilisateur ou mot de passe incorrect' });
    }
    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '24h' }
    );
    console.log('JWT token generated:', token);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Middleware pour extraire l'utilisateur du token
exports.getMe = async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    // On peut renvoyer les infos du token ou aller chercher l'utilisateur en BDD si besoin
    const userResult = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(userResult.rows[0]);
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};