const express = require('express');
const http = require('http'); // already correct
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const connectRedis = require('./config/redis');
const { initSocket } = require('./config/socket'); // socket loader
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();

/*
  Create HTTP server
  This allows Express + Socket.io to run together
*/
const server = http.createServer(app);

/*
  Initialize Socket.io
*/
initSocket(server);

/*
  Connect Databases
*/
connectDB();
connectRedis();

/*
  Global Rate Limiter
*/
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/*
  Security Middleware
*/
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(globalLimiter);
app.use(mongoSanitize());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/*
  Logging
*/
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

/*
  Health Check Route
*/
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Movie Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/*
  API Routes
*/
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

/*
  404 Handler
*/
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/*
  Global Error Handler
*/
app.use(errorHandler);

/*
  Start Server
*/
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

/*
  Handle Unhandled Promise Rejections
*/
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

/*
  Handle Uncaught Exceptions
*/
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;