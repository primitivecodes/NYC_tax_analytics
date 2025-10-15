const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');

router.get('/stats', tripController.fetchStats);
router.get('/top', tripController.fetchTopTrips);
router.get('/anomalies', tripController.fetchAnomalies);
router.get('/:id', tripController.fetchTripById); // dynamic, must be last
router.get('/', tripController.fetchTrips);

module.exports = router;
