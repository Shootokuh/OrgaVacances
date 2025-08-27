// Retourne le nom de l'utilisateur connecté (pour displayName frontend)
exports.getMe = async (req, res) => {
  const email = req.user?.email;
  if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  try {
    const userResult = await pool.query('SELECT name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
    }
    res.json({ name: userResult.rows[0].name });
  } catch (err) {
    console.error('Erreur getMe:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
const pool = require('../models/db');


exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getUsers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// L'inscription est maintenant gérée 100% par Firebase Auth côté frontend.
// Cette route peut servir à créer un profil utilisateur en base si besoin, mais ne doit plus recevoir ni stocker de mot de passe.
exports.register = async (req, res) => {
  const { email, name, google_id } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  try {
    // Upsert : crée ou met à jour le profil utilisateur (nom, google_id)
    const result = await pool.query(
      `INSERT INTO users (email, name, google_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, google_id = COALESCE(EXCLUDED.google_id, users.google_id)
       RETURNING id, email, name, google_id`,
      [email, name, google_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// La connexion est maintenant gérée par Firebase Auth côté frontend.
// Cette route peut servir à vérifier l'existence d'un utilisateur ou à retourner ses infos, mais ne doit plus générer de token.
exports.login = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }
  try {
    const userResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const user = userResult.rows[0];
    res.json({ user });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Suppression de toute la logique de reset password : tout est géré par Firebase Auth côté frontend

// Avec Firebase, req.user est déjà rempli par le middleware si le token est valide
// Ajout d'utilisateur sans gestion de mot de passe (Firebase gère l'auth)
exports.addUser = async (req, res) => {
  const { google_id, email, name, avatar_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [google_id || null, email, name, avatar_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur addUser:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};