// Load MySQL library and environment variables
const mysql = require('mysql2/promise');
require('dotenv').config();

// Setup database connection settings
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nyc_taxi_analytics',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(config);

// Test if we can connect to database
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('Connected to database successfully');
        conn.release();
        return true;
    } catch (err) {
        console.error('Failed to connect to database:', err.message);
        return false;
    }
}

// Run a query on the database
async function runQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('Query failed:', err.message);
        throw err;
    }
}

// Close all database connections
async function closeConnection() {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing connection:', err.message);
    }
}

// Export functions so other files can use them
module.exports = {
    connectionPool: pool,
    testDatabaseConnection: testConnection,
    executeQuery: runQuery,
    closeDatabaseConnection: closeConnection
};
