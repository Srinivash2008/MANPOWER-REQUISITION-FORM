const express = require('express');
const http = require('http');
const mysql = require('mysql2/promise');
const helmet = require('helmet');
// const redis = require('redis');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
const pool = require('./config/database'); // Import the common database pool
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

// Import socketManager to centralize Socket.IO logic
const { initializeSocketIO } = require('./socketManager');

// Import custom route modules
const authRoutes = require('./routes/auth'); // For authentication (login)

const dashboardRoutes = require('./routes/dashboard'); // For dashboard summary data


const authMiddleware = require('./middleware/auth'); // Middleware to verify JWT tokens



// === Initialize Express app and HTTP server first ===
const app = express();
//app.use(express.static(path.join(__dirname, 'dist')))

const server = http.createServer(app);

// === Then, initialize Socket.IO with the server instance ===
const io = initializeSocketIO(server);

// === Express Middleware ===
// Parse incoming JSON payloads
app.use(express.json());
// Secure your app by setting various HTTP headers
app.use(helmet());
// Add this line to serve static files from the 'system_updates_files' directory


// Enable CORS for all HTTP requests to allow frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// // === Redis Client Setup ===
// let redisClient;
// (async () => {
//     // Create a Redis client instance using the environment variables
//     redisClient = redis.createClient({
//         url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
//     });

//     // Handle Redis connection errors
//     redisClient.on('error', err => 
//         console.log('Redis Client Error', err)
//         );

//     // Connect to Redis server
//     try {
//         await redisClient.connect();
//         console.log('Connected to Redis');
//     } catch (err) {
//         console.error('Failed to connect to Redis:', err.message);
//     }
// })();


// === API Routes ===

// Public authentication routes (e.g., /api/auth/login)
app.use('/api/auth', authRoutes);

// Protected employee routes - require authentication via JWT middleware
// All routes defined in employeeRoutes will be prefixed with /api/employees
// and will first pass through authMiddleware for token verification
//app.use('/api/employees', authMiddleware, employeeRoutes);

// Protected dashboard routes - require authentication via JWT middleware
// All routes defined in dashboardRoutes will be prefixed with /api/dashboard
// and will first pass through authMiddleware for token verification
app.use('/api/dashboard', authMiddleware, dashboardRoutes);



app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});




app.get('/api/dashboard-data', authMiddleware, async (req, res) => {
    try {
        // req.user.emp_id comes from JWT payload. We map it to database's 'employee_id' column.
        const [rows] = await pool.execute('SELECT emp_name, emp_dept FROM employee_personal WHERE employee_id = ?', [req.user.emp_id]); // <<< CORRECTED COLUMN NAME
        if (rows.length > 0) {
            res.json({
                message: `Welcome, ${rows[0].emp_name} from ${rows[0].emp_dept}!`,
                userData: { ...rows[0], emp_pos: req.user.emp_pos }
            });
        } else {
            res.status(404).json({ message: 'User data not found.' });
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});





// ===== Daily Ticket Quality Automation Cron Job =====
// ===== Daily Ticket Quality Automation Cron Job =====


cron.schedule(
  '30 3 * * *', // 03:30 UTC
  async () => {
    console.log("Running Daily Ticket Quality Automation at UTC 03:30:", new Date().toISOString());

    try {
      const query = `
        UPDATE hd_add_entry AS t
        JOIN (
            SELECT id
            FROM (
                SELECT id,
                       employee_id,
                       ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY RAND()) AS rn
                FROM hd_add_entry
                WHERE received_date = CURDATE() - INTERVAL 1 DAY
                  AND status = 'Resolved'
                  AND ticket_mode IN ('Email', 'chat')
                  AND quality = 'No'
            ) ranked
            WHERE rn <= 2
        ) selected
        ON t.id = selected.id
        SET t.quality = 'Yes',
            t.quality_created_date = NOW();
      `;
      const [result] = await pool.execute(query);

      if (result.affectedRows > 0) {
        console.log(`Daily Quality Automation: ${result.affectedRows} tickets updated successfully.`);
      } else {
        console.log("No eligible tickets found for yesterday.");
      }
    } catch (err) {
      console.error("Error running daily ticket quality job:", err.message);
    }
  },
  { timezone: "UTC" } // explicitly run in UTC
);



// async function runDailyTicketQualityAutomation() {
//     console.log("Running Daily Ticket Quality Automation:", new Date());

//     try {
//         const query = `
//             UPDATE hd_add_entry AS t
//             JOIN (
//                 SELECT id
//                 FROM (
//                     SELECT id,
//                            employee_id,
//                            @rn := IF(@prev_emp = employee_id, @rn + 1, 1) AS rn,
//                            @prev_emp := employee_id
//                     FROM hd_add_entry, (SELECT @rn := 0, @prev_emp := 0) vars
//                     WHERE received_date = CURDATE() - INTERVAL 1 DAY
//                       AND status = 'Resolved'
//                       AND ticket_mode IN ('Email', 'chat')
//                       AND quality != 'Yes'
//                     ORDER BY employee_id, RAND()
//                 ) ranked
//                 WHERE rn <= 2
//             ) selected
//             ON t.id = selected.id
//             SET t.quality = 'Yes',
//                 t.quality_created_date = NOW();
//         `;
//         await pool.execute(query);
//         console.log("Daily Ticket Quality Automation completed successfully.");
//     } catch (err) {
//         console.error("Error running daily ticket quality job:", err.message);
//     }
// }

// // Schedule cron job
// cron.schedule('30 4 * * *', runDailyTicketQualityAutomation);

// ===== Manual Run =====
// Uncomment the line below to run manually
// runDailyTicketQualityAutomation();

// ===== Test route =====
app.get('/', (req, res) => {
    res.send('PDMR ACS HD Backend is running! Daily ticket automation enabled.');
});

// === Socket.IO Connection Handling ===
io.on('connection', (socket) => {
    console.log('A user connected via Socket.IO:', socket.id);

    // Event listener for authenticating the socket connection using a JWT
    socket.on('authenticate', (token) => {
        try {
            // Verify the JWT received from the client
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            // Attach decoded user information to the socket object
            socket.user = decoded;
            console.log(`User ${decoded.emp_id} authenticated via socket.`);
            // Join a Socket.IO room based on the user's employee position for targeted messaging
            socket.join(decoded.emp_pos);
            // Emit a welcome message back to the newly authenticated user
            socket.emit('welcome', `Hello ${decoded.emp_id}! You are connected.`);
        } catch (error) {
            console.error('Socket authentication failed:', error.message);
            // Emit an authentication error and disconnect the socket if token is invalid
            socket.emit('auth_error', 'Authentication failed');
            socket.disconnect(true);
        }
    });

    // Event listener for receiving notifications from clients
    socket.on('send-notification', (message) => {
        console.log('Received notification from client:', message);
        // Broadcast the message to all connected clients
        io.emit('receive-notification', {
            from: socket.user ? socket.user.emp_id : 'anonymous', // Identify sender
            message: message,
            time: new Date()
        });

        // Example: To send a notification only to 'admin' users
        // io.to('admin').emit('admin-notification', `Admin alert: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from Socket.IO:', socket.id);
        if (socket.user) {
            console.log(`Authenticated user ${socket.user.emp_id} disconnected.`);
        }
    });
});

// === Server Start ===
const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));