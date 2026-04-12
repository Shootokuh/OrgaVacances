const multer = require('multer');
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
const { saveTripCover } = require('../services/storage/tripCoverStorage');

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const uploadCoverMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COVER_IMAGE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non autorise'));
    }
    cb(null, true);
  }
}).single('image');

exports.uploadTripCover = (req, res) => {
  uploadCoverMiddleware(req, res, async (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image trop volumineuse (max 5 Mo)'
        : err.message || 'Erreur upload';
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier image fourni' });
    }

    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifie' });

    try {
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Profil utilisateur non trouve' });
      }

      const userId = userResult.rows[0].id;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const { publicUrl, storagePath } = await saveTripCover({
        userId,
        fileBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        baseUrl
      });

      res.status(201).json({ cover_image_url: publicUrl, storage_path: storagePath });
    } catch (uploadError) {
      console.error('Erreur uploadTripCover:', uploadError);
      res.status(500).json({ error: 'Erreur serveur pendant upload image' });
    }
  });
};

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
        `SELECT t.*, COALESCE(COUNT(a.id), 0)::int AS activities_count
         FROM trips t
         LEFT JOIN activities a ON a.trip_id = t.id
         WHERE t.id = ANY($1::int[])
         GROUP BY t.id
         ORDER BY t.id ASC`,
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
  const { title, destination, start_date, end_date, cover_image_url } = req.body;
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
      'INSERT INTO trips (user_id, title, destination, start_date, end_date, cover_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, title, destination, start_date, end_date, cover_image_url || null]
    );
    const trip = result.rows[0];

    // Ajouter le créateur comme participant
    await pool.query('INSERT INTO participants (trip_id, name) VALUES ($1, $2)', [trip.id, userName]);

    // Ajouter le créateur dans trip_users comme owner
    const tripUserModel = require('../models/tripUser');
    await tripUserModel.addUserToTrip(trip.id, userId, 'owner');

    res.status(201).json({ ...trip, role: 'owner', activities_count: 0 });
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
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Utilisateur non authentifié' });
    // Récupère l'id utilisateur interne à partir de l'email Firebase
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profil utilisateur non trouvé' });
    }
    const userId = userResult.rows[0].id;
    // Vérifie que l'utilisateur est owner du trip
    const tripUserModel = require('../models/tripUser');
    const roleRes = await pool.query('SELECT role FROM trip_users WHERE trip_id = $1 AND user_id = $2', [tripId, userId]);
    if (roleRes.rows.length === 0 || roleRes.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Seul le propriétaire peut supprimer ce voyage' });
    }
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
  const { budget, title, destination, start_date, end_date } = req.body;
  const hasCoverImageKey = Object.prototype.hasOwnProperty.call(req.body, 'cover_image_url');
  const coverImageUrl = hasCoverImageKey
    ? (req.body.cover_image_url === '' ? null : req.body.cover_image_url)
    : undefined;

  if (isNaN(tripId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  const fieldsToUpdate = [];
  const values = [];

  if (budget !== undefined) {
    values.push(budget);
    fieldsToUpdate.push(`budget = $${values.length}`);
  }
  if (title !== undefined) {
    values.push(title);
    fieldsToUpdate.push(`title = $${values.length}`);
  }
  if (destination !== undefined) {
    values.push(destination);
    fieldsToUpdate.push(`destination = $${values.length}`);
  }
  if (start_date !== undefined) {
    values.push(start_date);
    fieldsToUpdate.push(`start_date = $${values.length}`);
  }
  if (end_date !== undefined) {
    values.push(end_date);
    fieldsToUpdate.push(`end_date = $${values.length}`);
  }
  if (coverImageUrl !== undefined) {
    values.push(coverImageUrl);
    fieldsToUpdate.push(`cover_image_url = $${values.length}`);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
  }

  try {
    values.push(tripId);
    const result = await pool.query(
      `UPDATE trips SET ${fieldsToUpdate.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
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