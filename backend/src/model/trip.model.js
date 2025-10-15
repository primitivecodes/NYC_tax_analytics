// src/models/trip.model.js
const pool = require('../config/db');

async function createTripTable() {
  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id VARCHAR(50) PRIMARY KEY,
      vendor_id INT,
      pickup_datetime DATETIME,
      dropoff_datetime DATETIME,
      passenger_count INT,
      pickup_longitude DECIMAL(9,6),
      pickup_latitude DECIMAL(8,6),
      dropoff_longitude DECIMAL(9,6),
      dropoff_latitude DECIMAL(8,6),
      store_and_fwd_flag CHAR(1),
      trip_duration INT,
      trip_distance FLOAT,
      average_speed FLOAT,
      hour_of_day TINYINT,
      day_of_week TINYINT,
      is_suspect BOOLEAN DEFAULT 0,
      suspect_reason VARCHAR(255)
    );
  `);

  // Indexes to create
  const indexes = [
    { name: 'idx_pickup_datetime', column: 'pickup_datetime' },
    { name: 'idx_hour_of_day', column: 'hour_of_day' },
    { name: 'idx_trip_distance', column: 'trip_distance' },
    { name: 'idx_average_speed', column: 'average_speed' },
  ];

  for (const index of indexes) {
    // Check if index exists
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE table_schema = DATABASE()
         AND table_name = 'trips'
         AND index_name = ?`,
      [index.name]
    );

    if (rows[0].count === 0) {
      console.log(`Creating index ${index.name}...`);
      await pool.query(`CREATE INDEX ${index.name} ON trips(${index.column});`);
      console.log(`Index ${index.name} created.`);
    } else {
      console.log(`Index ${index.name} already exists.`);
    }
  }

  console.log('Trips table and indexes are ready!');
}

module.exports = { createTripTable };
