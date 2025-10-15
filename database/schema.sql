-- Create database
CREATE DATABASE IF NOT EXISTS nyc_taxi_analytics;
USE nyc_taxi_analytics;

-- Table 1: Vendors
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Trips (main table with all trip data)
CREATE TABLE IF NOT EXISTS trips (
    trip_id VARCHAR(50) PRIMARY KEY,
    vendor_id INT NOT NULL,
    pickup_datetime DATETIME NOT NULL,
    dropoff_datetime DATETIME NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1,
    pickup_longitude DECIMAL(12, 8),
    pickup_latitude DECIMAL(12, 8),
    dropoff_longitude DECIMAL(12, 8),
    dropoff_latitude DECIMAL(12, 8),
    store_and_forward_flag CHAR(1) DEFAULT 'N',
    trip_duration_seconds INT NOT NULL,
    trip_distance_km DECIMAL(10, 2),
    trip_speed_kmh DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    INDEX index_pickup_datetime (pickup_datetime),
    INDEX index_vendor (vendor_id),
    INDEX index_passenger_count (passenger_count),
    INDEX index_duration (trip_duration_seconds)
);

-- Table 3: Trip Statistics
CREATE TABLE IF NOT EXISTS trip_statistics (
    statistic_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(50) NOT NULL,
    hour_of_day INT,
    day_of_week INT,
    month_of_year INT,
    is_weekend BOOLEAN DEFAULT FALSE,
    is_rush_hour BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    INDEX index_hour (hour_of_day),
    INDEX index_day (day_of_week),
    INDEX index_weekend (is_weekend),
    INDEX index_rush_hour (is_rush_hour)
);

-- Table 4: Data Quality Log
CREATE TABLE IF NOT EXISTS data_quality_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(50),
    issue_type VARCHAR(100) NOT NULL,
    issue_description TEXT,
    raw_data TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX index_issue_type (issue_type)
);

-- Insert vendor data
INSERT INTO vendors (vendor_id, vendor_name) VALUES
(1, 'Creative Mobile Technologies'),
(2, 'VeriFone Inc');
