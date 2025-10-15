const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const tripRoutes = require('./routes/trips');
const statsRoutes = require('./routes/stats');

// Use routes
app.use('/api/trips', tripRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/charts', statsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NYC Taxi API is running!',
    endpoints: {
      trips: '/api/trips',
      stats: '/api/stats',
      charts: '/api/charts',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});