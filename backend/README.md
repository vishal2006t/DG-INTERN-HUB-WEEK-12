# DG Interns Hub — Backend Architecture & API Service (Week 12 Capstone)

The backend service is built with **Node.js (v20+)** and **Express.js (v5.x)**, persisting data directly to **MongoDB Atlas (`dg_interns_hub`)** via **Mongoose (v9.x)**.

- **Primary Entry Point:** `server/server.js` (proxied by `backend/server.js`)
- **Default Local Port:** `5000` (`PORT=10000` configured for Render in `render.yaml`)
- **Base API Path:** `/api`

## 📁 Directory Structure

```
backend/
└── server.js                           # Proxy entrypoint loading server/server.js
server/
├── config/
│   ├── database.js                     # MongoDB Atlas connection (timeouts tuned + masked URI logs)
│   └── jwt.js                          # Strict JWT secret provider (fail-closed in production)
├── controllers/
│   ├── authController.js               # Register, Login, Me, Logout
│   ├── jobController.js                # Jobs CRUD, Search, Multi-facets (/filters), Sorting, Pagination
│   ├── applicationController.js        # Candidate apply, Withdraw, Resume upload, Recruiter pipeline, Admin apps, CSV Export
│   ├── notificationController.js       # List, Mark Read, Mark All Read, Delete Notification
│   ├── analyticsController.js          # Public live metrics (/public), Recruiter stats, Admin analytics
│   ├── contactController.js            # Week 12 public inquiry submission & Admin triage
│   └── userController.js               # Profile GET/PUT/DELETE, Admin users list, Role & Status governance
├── middleware/
│   ├── authMiddleware.js               # JWT Bearer verification + active-account (isActive) enforcement
│   ├── roleMiddleware.js               # RBAC (candidate, recruiter, admin)
│   ├── uploadMiddleware.js             # Multer PDF upload (5MB max) + %PDF- magic-byte validation
│   ├── validationMiddleware.js         # Strict 24-hex ObjectId & body validation
│   └── errorMiddleware.js              # Centralized 404 & error serialization
├── models/
│   ├── User.js                         # User schema (bcrypt 10 rounds, notificationPreferences, isActive)
│   ├── Job.js                          # Job schema with text & compound filter/sort indexes
│   ├── Application.js                  # Unique (job, applicant) constraint + recruiter notes
│   ├── Notification.js                 # Indexed recipient notification alerts
│   └── ContactMessage.js               # Persistent contact inquiries for Admin Control Center
├── routes/                             # authRoutes, jobRoutes, applicationRoutes, notificationRoutes, analyticsRoutes, contactRoutes, userRoutes
└── utils/
    ├── helpers.js                      # Standardized sendSuccess / sendError + safe RegExp escaping
    ├── seeder.js                       # Database seed utility
    ├── test-apis.js                    # Legacy Week 11 API checks
    └── test-week12-e2e.js              # Week 12 20-case E2E API, RBAC, IDOR & security suite
```

## 🔒 Week 12 Security & Performance Highlights

1. **Strict JWT Policy (`server/config/jwt.js`)**: Fails closed cleanly at startup/signing in `NODE_ENV=production` when `JWT_SECRET` is unset.
2. **Global NoSQL & XSS Sanitizer (`server/server.js`)**: Strips `$`/`.` key operators and dangerous script tags from request bodies while preserving user password characters intact.
3. **Strict Query Parameter Type & Enum Enforcement**: Blocks `$ne`/`$gt` operator injection on query strings (`type`, `role`, etc.) and escapes RegExp metacharacters against ReDoS.
4. **PDF Magic-Byte Inspection**: Validates real `%PDF-` file signatures rather than relying only on filename extensions.
5. **Cross-Tenant IDOR Prevention & CSV Formula Neutralization**: Restricts recruiter `jobId` filters and neutralizes leading `=`, `+`, `-`, `@` in CSV exports.
6. **CORS Allowlist & Helmet + Rate Limiting**: Enforces origin allowlists (supporting `FRONTEND_URL` and `CORS_ORIGINS`), Helmet `nosniff`, and auth/global `express-rate-limit` headers.

## 🚀 Running & Testing Backend

```bash
# Start API server
npm run server

# Run Week 12 20-case E2E & security suite
npm run test:e2e

# Run legacy baseline API test suite
npm test
```
