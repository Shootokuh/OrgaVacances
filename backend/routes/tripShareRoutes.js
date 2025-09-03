const express = require('express');
const router = express.Router();
const tripShareController = require('../controllers/tripShareController');


// Partager un trip avec un utilisateur
router.post('/:id/share', tripShareController.shareTrip);
// Accepter une invitation à un trip (depuis le lien magique)
router.post('/:id/share/accept', tripShareController.acceptInvitation);
// Retirer un utilisateur d'un trip partagé
router.post('/:id/unshare', tripShareController.unshareTrip);
// Lister les utilisateurs ayant accès à un trip
router.get('/:id/users', tripShareController.getTripUsers);

module.exports = router;
