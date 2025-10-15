USE nyc_taxi_analytics;

SELECT COUNT(*) AS total_trips FROM trips;

SELECT COUNT(*) AS total_locations FROM locations;

SELECT COUNT(*) AS total_vendors FROM vendors;

SELECT vendor_id, COUNT(*) AS trip_count 
FROM trips 
GROUP BY vendor_id;

SELECT AVG(trip_duration_seconds) / 60 AS average_duration_minutes 
FROM trips;

SELECT AVG(trip_distance_km) AS average_distance_km 
FROM trips;

SELECT AVG(trip_speed_kmh) AS average_speed_kmh 
FROM trips 
WHERE trip_speed_kmh IS NOT NULL;

SELECT passenger_count, COUNT(*) AS trip_count 
FROM trips 
GROUP BY passenger_count 
ORDER BY passenger_count;

SELECT hour_of_day, COUNT(*) AS trip_count 
FROM trip_statistics 
GROUP BY hour_of_day 
ORDER BY hour_of_day;

SELECT day_of_week, COUNT(*) AS trip_count 
FROM trip_statistics 
GROUP BY day_of_week 
ORDER BY day_of_week;

SELECT is_weekend, COUNT(*) AS trip_count 
FROM trip_statistics 
GROUP BY is_weekend;

SELECT is_rush_hour, COUNT(*) AS trip_count 
FROM trip_statistics 
GROUP BY is_rush_hour;

SELECT issue_type, COUNT(*) AS count 
FROM data_quality_log 
GROUP BY issue_type 
ORDER BY count DESC;

SELECT * FROM trips 
ORDER BY trip_duration_seconds DESC 
LIMIT 10;

SELECT * FROM trips 
WHERE trip_speed_kmh IS NOT NULL 
ORDER BY trip_speed_kmh DESC 
LIMIT 10;

SELECT * FROM trips 
ORDER BY trip_distance_km DESC 
LIMIT 10;

SELECT v.vendor_name, COUNT(t.trip_id) AS trip_count, 
       AVG(t.trip_duration_seconds) / 60 AS avg_duration_minutes,
       AVG(t.trip_distance_km) AS avg_distance_km
FROM trips t
JOIN vendors v ON t.vendor_id = v.vendor_id
GROUP BY v.vendor_id, v.vendor_name;

SELECT t.*, ts.hour_of_day, ts.day_of_week, ts.is_weekend, ts.is_rush_hour
FROM trips t
JOIN trip_statistics ts ON t.trip_id = ts.trip_id
LIMIT 5;

SELECT l.longitude, l.latitude, COUNT(*) AS pickup_count
FROM trips t
JOIN locations l ON t.pickup_location_id = l.location_id
GROUP BY l.location_id, l.longitude, l.latitude
ORDER BY pickup_count DESC
LIMIT 10;

SELECT l.longitude, l.latitude, COUNT(*) AS dropoff_count
FROM trips t
JOIN locations l ON t.dropoff_location_id = l.location_id
GROUP BY l.location_id, l.longitude, l.latitude
ORDER BY dropoff_count DESC
LIMIT 10;

SELECT DATE(pickup_datetime) AS trip_date, COUNT(*) AS trip_count
FROM trips
GROUP BY DATE(pickup_datetime)
ORDER BY trip_date;

SELECT 
    CASE 
        WHEN trip_duration_seconds < 600 THEN 'Short (< 10 min)'
        WHEN trip_duration_seconds < 1800 THEN 'Medium (10-30 min)'
        ELSE 'Long (>= 30 min)'
    END AS duration_category,
    COUNT(*) AS trip_count
FROM trips
GROUP BY duration_category;

SELECT 
    CASE 
        WHEN trip_distance_km < 2 THEN 'Very Short (< 2 km)'
        WHEN trip_distance_km < 5 THEN 'Short (2-5 km)'
        WHEN trip_distance_km < 10 THEN 'Medium (5-10 km)'
        ELSE 'Long (>= 10 km)'
    END AS distance_category,
    COUNT(*) AS trip_count
FROM trips
GROUP BY distance_category;
