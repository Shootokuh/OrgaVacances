const express = require("express");
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.get("/trip/:tripId", authenticateToken, hotelController.getHotelsByTrip);
router.get("/:id", authenticateToken, hotelController.getHotel);
router.post("/", authenticateToken, hotelController.createHotel);
router.put("/:id", authenticateToken, hotelController.updateHotel);
router.delete("/:id", authenticateToken, hotelController.deleteHotel);

module.exports = router;
