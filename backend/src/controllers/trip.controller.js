const tripService = require('../services/trip.service');

async function fetchTrips(req, res) {
  try {
    const trips = await tripService.getTrips(req.query);
    res.json(trips);
  } catch(err) { res.status(500).json({error: err.message}); }
}

async function fetchTripById(req, res) {
  try {
    const trip = await tripService.getTripById(req.params.id);
    if (!trip) return res.status(404).json({error: 'Not found'});
    res.json(trip);
  } catch(err) { res.status(500).json({error: err.message}); }
}

async function fetchStats(req, res) {
  try {
    const stats = await tripService.getTripStats();
    res.json(stats);
  } catch(err) { res.status(500).json({error: err.message}); }
}

async function fetchTopTrips(req, res) {
  try {
    const metric = req.query.metric || 'average_speed';
    const k = parseInt(req.query.k) || 10;
    const topTrips = await tripService.getTopTrips(metric, k);
    res.json(topTrips);
  } catch(err) { res.status(500).json({error: err.message}); }
}

async function fetchAnomalies(req, res) {
  try {
    const anomalies = await tripService.getAnomalies();
    res.json(anomalies);
  } catch(err) { res.status(500).json({error: err.message}); }
}

module.exports = { fetchTrips, fetchTripById, fetchStats, fetchTopTrips, fetchAnomalies };
