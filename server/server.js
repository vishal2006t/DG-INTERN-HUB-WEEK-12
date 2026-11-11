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
import contactRoutes from './routes/contactRoutes.js';

// Middleware imports
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { sanitizeQuery } from './utils/helpers.js';

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
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Security 2: Strict CORS configuration
const rawOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000'
].filter(Boolean);
const allowedOrigins = [...new Set(rawOrigins)];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, curl requests without a browser Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /^https:\/\/dg-interns-hub(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin) || origin === 'https://dghubintern.vercel.app') {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
        return callback(null, true);
      }
      const err = new Error('Origin not allowed by CORS policy');
      err.statusCode = 403;
      return callback(err, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Security 3: Rate limiting
const isTestMode = process.env.NODE_ENV === 'test';
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTestMode ? 1000 : 300,
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
  max: isTestMode ? 200 : 50,
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

// Security 5: Global NoSQL operator ($) & XSS sanitization middleware
const sanitizeBodyPreservePasswords = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeBodyPreservePasswords);
  const cleaned = sanitizeQuery(obj, { stripXss: false });
  for (const key of Object.keys(cleaned)) {
    if (key === 'password' || key === 'currentPassword' || key === 'newPassword') {
      continue;
    }
    if (typeof cleaned[key] === 'string') {
      cleaned[key] = sanitizeQuery(cleaned[key], { stripXss: true });
    } else if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
      cleaned[key] = sanitizeBodyPreservePasswords(cleaned[key]);
    }
  }
  return cleaned;
};

app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeBodyPreservePasswords(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeQuery(req.params, { stripXss: true });
  }
  next();
});

// Root Welcome & API Status Endpoint
app.get('/', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(200).json({
    success: true,
    name: 'DG Interns Hub Backend API',
    version: '12.0.0',
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
      analytics: '/api/analytics',
      contact: '/api/contact'
    },
    documentation: 'DG Interns Hub Week 12 Capstone API'
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
app.use('/api/contact', contactRoutes);

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
