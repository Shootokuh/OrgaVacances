const admin = require('../firebase');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token reçu:', token);
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = authenticateToken;
