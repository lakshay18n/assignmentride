const express = require('express');
const router = express.Router();
const { createRide, cancelRide, getUserRides } = require('../controllers/rideController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createRide);
router.put('/cancel/:id', authMiddleware, cancelRide);
router.get('/my-rides', authMiddleware, getUserRides);

module.exports = router;
