import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { connectDB, getConnectionStatus } from './config/database.js';
import { seedInitialData } from './utils/seeder.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Middleware imports
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security 1: Helmet to set secure HTTP response headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Security 2: CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive check
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Security 3: Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', generalLimiter);

// Specific stricter rate limiter for authentication routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes'
  }
});
app.use('/api/auth', authLimiter);

// Security 4: Request body size limits
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true, limit: '15kb' }));

// Root Welcome & API Status Endpoint
app.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(200).json({
    success: true,
    name: 'DG Interns Hub Backend API',
    version: '11.0.0',
    status: 'online',
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.state
    },
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      users: '/api/users',
      notifications: '/api/notifications',
      analytics: '/api/analytics'
    },
    documentation: 'https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11'
  });
});

// Health Check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  const isHealthy = dbStatus.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy
      ? 'DG Interns Hub Backend API is running smoothly'
      : 'Database connection is degraded or disconnected',
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      name: dbStatus.name,
      host: dbStatus.host
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect to MongoDB and start server
let serverInstance;

export const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    serverInstance = app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`DG INTERNS HUB BACKEND SERVER`);
      console.log(`Running on port: ${PORT}`);
      console.log(`API Base URL:    http://localhost:${PORT}/api`);
      console.log(`Environment:     ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);
    });

    return serverInstance;
  } catch (error) {
    console.error('[Server] Failed to initialize server:', error.message);
    process.exit(1);
  }
};

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
