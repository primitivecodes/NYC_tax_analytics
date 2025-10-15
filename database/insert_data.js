// Import required modules
const fs = require('fs');
const csvParser = require('csv-parser');
const { connectionPool } = require('./database');

// Configuration
const BATCH_SIZE = 1000;
const NYC_BOUNDS = { minLongitude: -74.3, maxLongitude: -73.7, minLatitude: 40.5, maxLatitude: 41.0 };

// Main function to insert data from CSV file
async function insertDataFromCSV(csvFilePath) {
    let connection;
    try {
        // Get database connection
        connection = await connectionPool.getConnection();
        console.log('Connected to database');
        
        // Initialize batches and counters
        const tripBatch = [];
        const statisticsBatch = [];
        let processedCount = 0;
        let rejectedCount = 0;
        
        // Read CSV file
        const readStream = fs.createReadStream(csvFilePath);
        const parser = readStream.pipe(csvParser());
        
        // Process each row from train.csv
        for await (const row of parser) {
            // Parse CSV columns: id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count,
            // pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, 
            // store_and_fwd_flag, trip_duration
            const record = {
                id: row.id,
                vendorId: parseInt(row.vendor_id),
                pickupDatetime: row.pickup_datetime,
                dropoffDatetime: row.dropoff_datetime,
                passengerCount: parseInt(row.passenger_count),
                pickupLongitude: parseFloat(row.pickup_longitude),
                pickupLatitude: parseFloat(row.pickup_latitude),
                dropoffLongitude: parseFloat(row.dropoff_longitude),
                dropoffLatitude: parseFloat(row.dropoff_latitude),
                storeAndForwardFlag: row.store_and_fwd_flag || 'N',
                tripDuration: parseInt(row.trip_duration)
            };
            
            // Validate record
            if (!record.id || record.vendorId < 1 || record.vendorId > 2 || 
                record.passengerCount < 1 || record.tripDuration < 60) {
                rejectedCount++;
                continue;
            }
            
            // Calculate distance using Haversine formula (derived feature 1)
            const lat1 = record.pickupLatitude * (Math.PI / 180);
            const lat2 = record.dropoffLatitude * (Math.PI / 180);
            const deltaLat = (record.dropoffLatitude - record.pickupLatitude) * (Math.PI / 180);
            const deltaLon = (record.dropoffLongitude - record.pickupLongitude) * (Math.PI / 180);
            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                      Math.cos(lat1) * Math.cos(lat2) *
                      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distanceKm = 6371 * c;
            
            // Calculate speed (derived feature 2)
            const speedKmh = (distanceKm / (record.tripDuration / 3600));
            
            // Extract time features (derived feature 3)
            const pickupDate = new Date(record.pickupDatetime);
            const hourOfDay = pickupDate.getHours();
            const dayOfWeek = pickupDate.getDay();
            const monthOfYear = pickupDate.getMonth() + 1;
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0;
            const isRushHour = ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 19)) ? 1 : 0;
            
            // Add trip to batch
            tripBatch.push([
                record.id, record.vendorId, record.pickupDatetime, record.dropoffDatetime,
                record.passengerCount, record.pickupLongitude, record.pickupLatitude,
                record.dropoffLongitude, record.dropoffLatitude, record.storeAndForwardFlag,
                record.tripDuration, Math.round(distanceKm * 100) / 100, 
                Math.round(speedKmh * 100) / 100
            ]);
            
            // Add statistics to batch
            statisticsBatch.push([record.id, hourOfDay, dayOfWeek, monthOfYear, isWeekend, isRushHour]);
            
            processedCount++;
            
            // Insert batch when size reached
            if (tripBatch.length >= BATCH_SIZE) {
                await connection.query(
                    'INSERT IGNORE INTO trips (trip_id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, store_and_forward_flag, trip_duration_seconds, trip_distance_km, trip_speed_kmh) VALUES ?',
                    [tripBatch]
                );
                await connection.query(
                    'INSERT IGNORE INTO trip_statistics (trip_id, hour_of_day, day_of_week, month_of_year, is_weekend, is_rush_hour) VALUES ?',
                    [statisticsBatch]
                );
                tripBatch.length = 0;
                statisticsBatch.length = 0;
                console.log(`Processed ${processedCount} records`);
            }
        }
        
        // Insert remaining records
        if (tripBatch.length > 0) {
            await connection.query(
                'INSERT IGNORE INTO trips (trip_id, vendor_id, pickup_datetime, dropoff_datetime, passenger_count, pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, store_and_forward_flag, trip_duration_seconds, trip_distance_km, trip_speed_kmh) VALUES ?',
                [tripBatch]
            );
            await connection.query(
                'INSERT IGNORE INTO trip_statistics (trip_id, hour_of_day, day_of_week, month_of_year, is_weekend, is_rush_hour) VALUES ?',
                [statisticsBatch]
            );
        }
        
        console.log(`Total processed: ${processedCount}, Total rejected: ${rejectedCount}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) connection.release();
    }
}

// Run the insertion
const csvFilePath = '../data/train.csv';
insertDataFromCSV(csvFilePath);
