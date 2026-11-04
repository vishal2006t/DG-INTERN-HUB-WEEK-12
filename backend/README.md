# DG Interns Hub - Backend Architecture & API Service (Week 11)

Welcome to the backend module of the **DG Interns Hub** application.

## 🏗️ Architecture Overview

The backend is built with **Node.js (v20+)** and **Express.js (v5.x)**, persisting data directly to **MongoDB Atlas** using **Mongoose (v9.x)**.

- **Primary Entry Point:** `server/server.js` (and `backend/server.js`)
- **Port:** Configured via `PORT` in `.env` (defaults to `5000`)
- **Base API URL:** `http://localhost:5000/api`

## 📁 Directory Structure

```
backend/
└── server.js                      # Modular proxy entry point
server/
├── config/
│   └── database.js                # MongoDB Atlas connection with URI masking
├── controllers/
│   ├── authController.js          # Authentication (Register, Login, Me, Logout)
│   ├── jobController.js           # Jobs CRUD, Search, Filter, Pagination, Sorting
│   ├── applicationController.js   # Application lifecycle, PDF upload, CSV Export
│   ├── notificationController.js  # In-app notifications
│   ├── analyticsController.js     # Admin platform statistics
│   └── userController.js          # User profiles and Admin user management
├── middleware/
│   ├── authMiddleware.js          # JWT Bearer verification
│   ├── roleMiddleware.js          # Candidate, Recruiter, Admin RBAC
│   ├── uploadMiddleware.js        # Multer PDF validator (5MB limit)
│   ├── validationMiddleware.js    # Payload validation
│   └── errorMiddleware.js         # Centralized 404 & error handling
├── models/
│   ├── User.js                    # User schema with bcrypt password hashing
│   ├── Job.js                     # Job schema with text indexing
│   ├── Application.js             # Application schema with uniqueness constraint
│   └── Notification.js            # In-app notification schema
├── routes/
│   ├── authRoutes.js              # /api/auth/*
│   ├── jobRoutes.js               # /api/jobs/*
│   ├── applicationRoutes.js       # /api/applications/*
│   ├── notificationRoutes.js      # /api/notifications/*
│   ├── analyticsRoutes.js         # /api/analytics/*
│   └── userRoutes.js              # /api/users/*
├── utils/
│   ├── helpers.js                 # Uniform sendSuccess & sendError responses
│   ├── seeder.js                  # Initial database seeding
│   ├── test-apis.js               # 42-test API & Security suite
│   └── verify-persistence.js      # DB persistence & fault tolerance tests
└── validators/
    ├── authValidator.js
    ├── jobValidator.js
    └── applicationValidator.js
```

## 🔒 Security Implementations

1. **Helmet HTTP Headers**: Enforces secure HTTP response headers.
2. **CORS Controls**: Configured origin whitelist supporting credentials.
3. **Rate Limiting**: Stricter rate limiting on `/api/auth` (50 req/15min) and general protection on `/api` (300 req/15min).
4. **JWT Authentication**: Signed tokens verified via Bearer Authorization header.
5. **Password Hashing**: `bcryptjs` with 10 salt rounds before database persistence.
6. **NoSQL Injection Sanitization**: Safe query parsing and regex validation.
7. **Role-Based Access Control**: Strict segregation between `candidate`, `recruiter`, and `admin` permissions.

## 🚀 Running the Backend

```bash
# Start server
npm run server

# Run API test suite
npm test

# Run DB persistence verification
npm run test:persistence
```
