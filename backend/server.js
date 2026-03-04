 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Virtual Memory Companion API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Virtual Memory Companion API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      photos: '/api/v1/photos',
      moods: '/api/v1/moods',
      companion: '/api/v1/companion',
      caregiver: '/api/v1/caregiver'
    }
  });
});

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const photoRoutes = require('./src/routes/photos');
const caregiverRoutes = require('./src/routes/caregiverRoutes');
const moodRoutes = require('./src/routes/moodRoutes');
const companionRoutes = require('./src/routes/companionRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/caregiver', caregiverRoutes);
app.use('/api/v1/moods', moodRoutes);
app.use('/api/v1/companion', companionRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

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