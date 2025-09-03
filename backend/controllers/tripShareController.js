// Accepte une invitation à un trip (depuis le lien magique)
exports.acceptInvitation = async (req, res) => {
  const { id: tripId } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email manquant' });
  // Vérifie que l'utilisateur existe (doit être inscrit via Firebase)
  const user = await userModel.findByEmail(email);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  // Ajoute l'utilisateur comme viewer (si pas déjà présent)
  await tripUserModel.addUserToTrip(tripId, user.id, 'viewer');
  res.json({ success: true });
};
const tripUserModel = require('../models/tripUser');
const userModel = require('../models/user');

// Partage un trip avec un utilisateur (par email)
exports.shareTrip = async (req, res) => {
  const { id: tripId } = req.params;
  const { email } = req.body;
  // Récupère l'id interne de l'utilisateur courant à partir de l'email Firebase
  const requesterEmail = req.user?.email;
  if (!requesterEmail) return res.status(401).json({ error: 'Utilisateur non authentifié' });
  const requester = await userModel.findByEmail(requesterEmail);
  if (!requester) return res.status(403).json({ error: 'Profil utilisateur non trouvé' });
  const userId = requester.id;

  // Vérifie que le demandeur est bien owner du trip
  const isOwner = await tripUserModel.userHasAccessToTrip(tripId, userId);
  if (!isOwner) return res.status(403).json({ error: 'Accès refusé' });

  // Récupère l'utilisateur à inviter
  const userToShare = await userModel.findByEmail(email);
  if (!userToShare) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  // Ajoute l'utilisateur comme viewer
  await tripUserModel.addUserToTrip(tripId, userToShare.id, 'viewer');
  res.json({ success: true });
};

// Retire un utilisateur d'un trip partagé
exports.unshareTrip = async (req, res) => {
  const { id: tripId } = req.params;
  const { userIdToRemove } = req.body;
  const userId = req.user.id;

  // Vérifie que le demandeur est bien owner du trip
  const isOwner = await tripUserModel.userHasAccessToTrip(tripId, userId);
  if (!isOwner) return res.status(403).json({ error: 'Accès refusé' });

  await tripUserModel.removeUserFromTrip(tripId, userIdToRemove);
  res.json({ success: true });
};

// Liste les utilisateurs ayant accès à un trip
exports.getTripUsers = async (req, res) => {
  const { id: tripId } = req.params;
  const userId = req.user.id;

  // Vérifie que l'utilisateur a accès au trip
  const hasAccess = await tripUserModel.userHasAccessToTrip(tripId, userId);
  if (!hasAccess) return res.status(403).json({ error: 'Accès refusé' });

  const users = await tripUserModel.getUsersForTrip(tripId);
  res.json(users);
};
