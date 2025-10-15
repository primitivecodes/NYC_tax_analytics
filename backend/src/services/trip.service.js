const pool = require('../config/db');
const quickselect = require('../utils/quickselect');


async function getTrips(query) {
  const limit = parseInt(query.limit) || 100;
  const offset = parseInt(query.offset) || 0;
  const min_distance = query.min_distance ? parseFloat(query.min_distance) : undefined;
  const max_distance = query.max_distance ? parseFloat(query.max_distance) : undefined;
  const vendor_id = query.vendor_id ? parseInt(query.vendor_id) : undefined;
  const day_of_week = query.day_of_week ? parseInt(query.day_of_week) : undefined;
  const hour_of_day = query.hour_of_day ? parseInt(query.hour_of_day) : undefined;

  let sql = 'SELECT * FROM trips WHERE 1';
  const params = [];

  if (vendor_id !== undefined) { sql += ' AND vendor_id = ?'; params.push(vendor_id); }
  if (day_of_week !== undefined) { sql += ' AND day_of_week = ?'; params.push(day_of_week); }
  if (hour_of_day !== undefined) { sql += ' AND hour_of_day = ?'; params.push(hour_of_day); }
  if (min_distance !== undefined) { sql += ' AND trip_distance >= ?'; params.push(min_distance); }
  if (max_distance !== undefined) { sql += ' AND trip_distance <= ?'; params.push(max_distance); }

  sql += ' LIMIT ? OFFSET ?'; params.push(limit, offset);

  console.log('SQL:', sql, 'Params:', params); // debug
  const [rows] = await pool.query(sql, params);
  return rows;
}



async function getTripById(id) {
  const [rows] = await pool.query(`SELECT * FROM trips WHERE id = ?`, [id]);
  return rows[0];
}

async function getTripStats() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as total_trips, AVG(trip_distance) as avg_distance, AVG(trip_duration) as avg_duration FROM trips
  `);
  return rows[0];
}
async function getTopTrips(metric='average_speed', k=10) {
  const [rows] = await pool.query(`SELECT * FROM trips`);
  const topK = quickselect(rows, k, (a,b)=>a[metric]-b[metric]);
  return topK;
}

async function getAnomalies() {
  const [rows] = await pool.query(`SELECT * FROM trips WHERE is_suspect=1`);
  return rows;
}

module.exports = { getTrips, getTripById, getTripStats, getTopTrips, getAnomalies };
