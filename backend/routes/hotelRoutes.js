// routes/hotelRoutes.js
const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

// GET tous les hôtels d'un trip
router.get("/trip/:tripId", hotelController.getHotelsByTrip);
// GET un hôtel par id
router.get("/:id", hotelController.getHotel);
// POST créer un hôtel
router.post("/", hotelController.createHotel);
// PUT mettre à jour un hôtel
router.put("/:id", hotelController.updateHotel);
// DELETE supprimer un hôtel
router.delete("/:id", hotelController.deleteHotel);

module.exports = router;
