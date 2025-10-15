const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Haversine distance function (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = angle => (angle * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function cleanCSV(inputFile, outputFile) {
  const cleaned = [];
  const excluded = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', row => {
      // Basic validation
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
      const average_speed = trip_distance / (parseInt(row.trip_duration)/3600);
      const date = new Date(row.pickup_datetime);
      const hour_of_day = date.getHours();
      const day_of_week = date.getDay();

      cleaned.push({
        ...row,
        trip_distance,
        average_speed,
        hour_of_day,
        day_of_week,
        is_suspect: 0,
        suspect_reason: null
      });
    })
    .on('end', () => {
      console.log(`Cleaned trips: ${cleaned.length}, Excluded: ${excluded.length}`);

      // Write cleaned data
      const headers = Object.keys(cleaned[0]).join(',');
      const rows = cleaned.map(r => Object.values(r).join(','));
      fs.writeFileSync(outputFile, [headers, ...rows].join('\n'));

      // Optional: log excluded
      fs.writeFileSync(path.join(__dirname, 'excluded_records.json'), JSON.stringify(excluded, null, 2));
      console.log(`Cleaned CSV saved to ${outputFile}`);
    });
}

// Run script
const inputCSV = path.join(__dirname, 'data', 'train.csv');
const outputCSV = path.join(__dirname, 'cleaned_data', 'cleaned_taxi_data.csv');
cleanCSV(inputCSV, outputCSV);
