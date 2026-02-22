require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files (uploaded media)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Virtual Memory Companion API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Virtual Memory Companion API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      media: '/api/v1/media',
      chat: '/api/v1/chat',
      caregiver: '/api/v1/caregiver'
    }
  });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
// const userRoutes = require('./src/routes/userRoutes');
// const mediaRoutes = require('./src/routes/mediaRoutes');
// const chatRoutes = require('./src/routes/chatRoutes');
// const caregiverRoutes = require('./src/routes/caregiverRoutes');

// Use routes
app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/media', mediaRoutes);
// app.use('/api/v1/chat', chatRoutes);
// app.use('/api/v1/caregiver', caregiverRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log('============================================');
  console.log('  Virtual Memory Companion - Backend API');
  console.log('============================================');
  console.log(`  Environment: ${NODE_ENV}`);
  console.log(`  Server running on: http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  API docs: http://localhost:${PORT}/api`);
  console.log('============================================\n');
});

module.exports = app;
