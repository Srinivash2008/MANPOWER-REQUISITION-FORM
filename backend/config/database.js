// backend/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create and export the database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        //console.log('Database connection pool created successfully.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        //console.error('Error creating database connection pool:', err.message);
    });

module.exports = pool;