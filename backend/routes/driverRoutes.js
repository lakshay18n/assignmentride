const express = require('express');
const router = express.Router();
const { seedDrivers, getAvailableDrivers } = require('../controllers/driverController');

router.get('/seed', seedDrivers);
router.get('/available', getAvailableDrivers);

module.exports = router;
