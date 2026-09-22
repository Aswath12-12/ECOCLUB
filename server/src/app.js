const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const houseRoutes = require('./routes/houseRoutes');
const activityRoutes = require('./routes/activityRoutes');
const markRoutes = require('./routes/markRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const reportRoutes = require('./routes/reportRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security and utility middleware
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'EcoClub House Management API'
  });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/password-resets', passwordResetRoutes);
app.use('/api/reports', reportRoutes);

// Catch 404 and error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
