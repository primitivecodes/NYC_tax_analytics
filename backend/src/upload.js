const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('./config/db');
const haversineDistance = require('./utils/distance');

async function loadCSV(filePath) {
  const trips = [];
  const excluded = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', row => {
      try {
        if (!row.id || !row.pickup_datetime || !row.dropoff_datetime || row.trip_duration <= 0) {
          row.suspect_reason = 'missing/invalid fields';
          excluded.push(row);
          return;
        }

        const pickup_lat = parseFloat(row.pickup_latitude);
        const pickup_lon = parseFloat(row.pickup_longitude);
        const dropoff_lat = parseFloat(row.dropoff_latitude);
        const dropoff_lon = parseFloat(row.dropoff_longitude);

        if ([pickup_lat, pickup_lon, dropoff_lat, dropoff_lon].some(isNaN)) {
          row.suspect_reason = 'invalid coordinates';
          excluded.push(row);
          return;
        }

        const trip_distance = haversineDistance(pickup_lat, pickup_lon, dropoff_lat, dropoff_lon);
        const average_speed = trip_distance / (parseInt(row.trip_duration) / 3600);
        const date = new Date(row.pickup_datetime);
        const hour_of_day = date.getHours();
        const day_of_week = date.getDay();

        trips.push({
          ...row,
          trip_distance,
          average_speed,
          hour_of_day,
          day_of_week,
          is_suspect: 0,
          suspect_reason: null
        });
      } catch (err) {
        row.suspect_reason = 'error parsing row';
        excluded.push(row);
      }
    })
    .on('end', async () => {
      console.log(`Valid trips: ${trips.length}, Excluded: ${excluded.length}`);
      fs.writeFileSync('excluded_records.json', JSON.stringify(excluded, null, 2));

      const batchSize = 1000;
      for (let i = 0; i < trips.length; i += batchSize) {
        const batch = trips.slice(i, i + batchSize);
        const values = batch.map(t => [
          t.id, t.vendor_id, t.pickup_datetime, t.dropoff_datetime,
          t.passenger_count, t.pickup_longitude, t.pickup_latitude,
          t.dropoff_longitude, t.dropoff_latitude, t.store_and_fwd_flag,
          t.trip_duration, t.trip_distance, t.average_speed,
          t.hour_of_day, t.day_of_week, t.is_suspect, t.suspect_reason
        ]);
        await pool.query(
          `INSERT INTO trips (id,vendor_id,pickup_datetime,dropoff_datetime,passenger_count,pickup_longitude,pickup_latitude,dropoff_longitude,dropoff_latitude,store_and_fwd_flag,trip_duration,trip_distance,average_speed,hour_of_day,day_of_week,is_suspect,suspect_reason) VALUES ?`,
          [values]
        );
      }

      console.log('All trips inserted into DB');
      process.exit(0);
    });
}

// Absolute path to CSV
loadCSV(path.join(__dirname, 'data', 'train.csv'));
