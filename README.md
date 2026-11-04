# DG Interns Hub - Full-Stack React.js & Express.js Internship Portal (Week 11)

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.x-red.svg)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.x-yellow.svg)](https://axios-http.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Connected-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-42%2F42_Passed-success.svg)](server/utils/test-apis.js)

**GitHub Repository:** [https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11)  
**Live Frontend Deployment:** [https://vishal2006t.github.io/DG-INTERN-HUB-WEEK-11/](https://vishal2006t.github.io/DG-INTERN-HUB-WEEK-11/)

---

## 🌟 1. Project Introduction

**DG Interns Hub (Week 11)** is a production-grade, full-stack **Job & Internship Portal** connecting ambitious students, early-career developers, and modern recruiters. Built with a decoupled frontend/backend architecture, the platform features role-based access control (**Candidate**, **Recruiter**, **Admin**), persistent in-app notifications, dark/light theme switching, multi-criteria debounced search, validated PDF resume uploads, real-time analytics, and CSV recruitment exports.

The application adheres to enterprise software engineering standards with zero mock data, real MongoDB Atlas cloud persistence, rigorous input validation, rate limiting, and security hardening.

---

## 🚀 2. Key Features

### Candidate Experience
- **Interactive Directory**: Explore internship openings with real-time multi-criteria filtering (Category, Location, Work Mode, Stipend, Sort Order).
- **Debounced Search**: 350ms debounced search engine indexing title, company name, skills, and full description.
- **Single-Click Apply**: Pre-populated application forms with client-side & server-side PDF resume validation (5MB max limit).
- **Application Tracking**: Dedicated pipeline view tracking statuses (*Pending*, *Under Review*, *Accepted*, *Rejected*) with withdrawal capabilities.
- **Profile & Skill Management**: Interactive technical skills tag management with instant persistence.
- **Bookmarks & Saved Roles**: Instant role saving stored locally for rapid revisit.

### Recruiter Experience
- **Recruiter Dashboard**: Manage company postings, view active listing metrics, and monitor total applicants.
- **Job Creation & Editing**: Comprehensive job management modal with tags, perks, stipend, and deadline settings.
- **Applicant Pipeline & Status Transitions**: Review submitted candidate profiles, read cover letters, preview resumes, and update application status.
- **CSV Data Export**: Export candidate pipelines to standardized CSV files for external applicant tracking systems.

### Admin Governance
- **Platform Analytics**: High-level platform KPIs including total users, job listings, application throughput, and system health.
- **Universal User Management**: Audit system accounts, change user roles, and moderate spam users.
- **Global Job Moderation**: Administrative oversight across all recruiters and listings.

### Platform-Wide Capabilities
- **Persistent In-App Notifications**: Notification badge center with read status management and polling synchronization.
- **Persistent Theme Engine**: Smooth transition between Dark Slate (`#0B0F19`) and Light mode, synchronized with `localStorage`.
- **Responsive Layout**: Designed for mobile (390px), tablet (768px), and high-resolution desktop (1920px).

---

## 🛠️ 3. Technology Stack

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Modern component architecture & hooks |
| **Build & Tooling** | Vite 8.x | High-speed ESM bundling & hot module replacement |
| **Routing** | React Router DOM 7.x | Declarative routing with destination memory |
| **HTTP Client** | Axios 1.x | Centralized API client with JWT request/response interceptors |
| **Icons & UI** | Lucide React (`lucide-react`) | Accessible, tree-shakeable SVG icon set |
| **Backend Framework** | Node.js (v20+), Express.js (v5.x) | High-throughput REST API runtime |
| **Database** | MongoDB Atlas, Mongoose (v9.x) | Cloud document persistence & schema validation |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` | Stateless session management & 10-round password hashing |
| **File Handling** | Multer 2.x | Multipart upload processing & PDF MIME filtering |
| **Security Suite** | Helmet, CORS, Express Rate Limit | Header protection, origin isolation & brute-force defense |

---

## 🏛️ 4. Architecture

The repository employs a modular, full-stack structure with decoupled frontend and backend execution paths:

```
DG-INTERN-HUB-WEEK-11/
├── backend/                               # Backend entrypoint & documentation
│   ├── server.js                          # Modular backend entry proxy
│   └── README.md                          # Backend architectural guide
├── frontend/                              # Frontend architecture documentation
│   └── README.md                          # React SPA architectural guide
├── postman/                               # Complete API Collection
│   └── DG-Interns-Hub-API.json            # 7-folder Postman collection
├── screenshots/                           # UI and test verification assets
│   ├── 01_homepage_portal.png             # Homepage portal overview
│   └── README.md                          # Screenshots checklist
├── server/                                # Express.js REST API Engine
│   ├── config/
│   │   └── database.js                    # MongoDB Atlas connection & health check
│   ├── controllers/                       # Route business logic handlers
│   │   ├── authController.js              # Register, Login, Me, Logout
│   │   ├── jobController.js               # Job CRUD, Search, Filter, Pagination
│   │   ├── applicationController.js       # Apply, Status Update, Withdraw, CSV Export
│   │   ├── notificationController.js      # In-app notifications
│   │   ├── analyticsController.js         # Admin platform metrics
│   │   └── userController.js              # User profiles & role administration
│   ├── middleware/                        # Express middleware
│   │   ├── authMiddleware.js              # JWT Bearer verification
│   │   ├── roleMiddleware.js              # RBAC role guards
│   │   ├── uploadMiddleware.js            # Multer PDF validator (max 5MB)
│   │   ├── validationMiddleware.js        # Request payload validators
│   │   └── errorMiddleware.js             # Centralized 404 & error handlers
│   ├── models/                            # Mongoose database models
│   │   ├── User.js                        # User schema with bcrypt hooks
│   │   ├── Job.js                         # Job schema with text indexes
│   │   ├── Application.js                 # Application schema with unique constraint
│   │   └── Notification.js                # Notification schema
│   ├── routes/                            # Modular API route definitions
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── userRoutes.js
│   ├── utils/                             # Utilities & test suites
│   │   ├── helpers.js                     # Unified sendSuccess & sendError responses
│   │   ├── seeder.js                      # Database initial seeding
│   │   ├── test-apis.js                   # 42-test comprehensive API suite
│   │   └── verify-persistence.js          # MongoDB persistence test suite
│   └── server.js                          # Express application entry
├── src/                                   # React.js SPA Frontend
│   ├── assets/                            # Branding, images, and illustrations
│   ├── components/                        # UI components & dashboard views
│   ├── context/                           # Auth, Notification, Theme, SavedJobs contexts
│   ├── pages/                             # Route view pages
│   ├── routes/                            # Protected route wrappers
│   ├── services/                          # Axios API client
│   ├── styles/                            # Supplemental page styles
│   ├── App.css                            # Main CSS design system
│   ├── App.jsx                            # Route dispatcher & global providers
│   └── main.jsx                           # React DOM mount point
├── uploads/                               # Secure resume upload directory
│   └── resumes/
├── .env.example                           # Safe configuration template
├── .gitignore                             # Git ignore rules (secrets & node_modules)
├── Dockerfile                             # Containerization build manifest
├── docker-compose.yml                     # Multi-service container orchestration
├── index.html                             # SPA HTML entry point
├── package.json                           # Root dependencies and scripts
└── vite.config.js                         # Vite build & chunking configuration
```

---

## 🔒 5. Security Features

1. **Password Hashing**: `bcryptjs` with 10 salt rounds automatically hashes passwords before storing in MongoDB. Plaintext passwords never persist.
2. **JWT Authentication**: Secure JSON Web Tokens with configurable expiration (`JWT_EXPIRES_IN=7d`), transmitted strictly through the `Authorization: Bearer <token>` header.
3. **Role-Based Access Control (RBAC)**: Statically enforced authorization tiers (`candidate`, `recruiter`, `admin`). Public registration blocks privilege escalation attempts to `admin`.
4. **Rate Limiting**:
   - Authentication routes (`/api/auth/*`): Stricter limit of 50 requests per 15 minutes to eliminate credential brute-forcing.
   - General API routes (`/api/*`): 300 requests per 15 minutes per IP.
5. **Secure HTTP Headers**: `helmet` enforces protective headers preventing MIME-sniffing, clickjacking, and XSS attacks.
6. **CORS Control**: Dynamic origin validation checking `FRONTEND_URL` and `CLIENT_URL`.
7. **Input Validation**: Schema-level validation and middleware sanitization rejecting invalid email formats, short passwords, and malformed object IDs.
8. **Safe Database Logging**: Credentials embedded in connection strings are masked (`maskMongoUri`) to prevent secret exposure in terminal outputs and server logs.

---

## ⚙️ 6. Environment Configuration

Copy `.env.example` to `.env` in the root folder:

```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env` (never commit this file to version control):

```env
# Server Network Configuration
PORT=5000
NODE_ENV=development

# Database Connection (MongoDB Atlas Cloud Cluster or Local Server)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dg_interns_hub?retryWrites=true&w=majority

# JWT Authentication Secret (Generate with crypto.randomBytes(32).toString('hex'))
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_here
JWT_EXPIRES_IN=7d

# CORS Allowed Client URLs
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Frontend Vite Public Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 💻 7. Installation & Local Development

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run the Full Stack Application
Launch both the Express API and Vite React frontend concurrently:
```powershell
npm run dev:all
```

Or run each in dedicated terminal sessions:
- **Backend Server (Port 5000):** `npm run server`
- **Frontend Dev Server (Port 5173):** `npm run dev`

Open your browser at: **`http://localhost:5173`**

---

## 🌐 8. Production Deployment

### Frontend Deployment (GitHub Pages)
- **Live URL:** [https://vishal2006t.github.io/DG-INTERN-HUB-WEEK-11/](https://vishal2006t.github.io/DG-INTERN-HUB-WEEK-11/)
- **Automated CI/CD:** `.github/workflows/deploy.yml` triggers on every push to `main`, running `npm run build` and publishing artifacts to the `gh-pages` branch.
- **SPA Routing Support:** The build pipeline automatically generates `dist/404.html` and mirrors assets to `docs/` with `.nojekyll` enabled for zero-downtime routing.

### Backend Deployment (Node.js / Docker)
- Deployable to cloud platforms including **Render**, **Railway**, **AWS**, or **Heroku**.
- **Docker Support:** Ready to build and run with the provided `Dockerfile` and `docker-compose.yml`:
  ```bash
  docker compose up --build
  ```
- **Health Check & Ping Endpoints:**
  - `GET /` — Returns service status, version, and endpoints map.
  - `GET /api/health` — Returns real-time MongoDB Atlas connection status.

---

## 📖 9. API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (`candidate` or `recruiter`).
- `POST /api/auth/login` — Authenticate and receive a JWT Bearer token.
- `GET /api/auth/me` — Retrieve active session profile.
- `POST /api/auth/logout` — Invalidate user session client-side.

### Job Listings
- `GET /api/jobs` — Retrieve paginated jobs with search (`?search=`), category (`?category=`), type (`?type=`), skill (`?skill=`), and sort (`?sort=`).
- `GET /api/jobs/:id` — Retrieve single job details by MongoDB `_id` or `slug`.
- `POST /api/jobs` — Create new job listing (*Recruiter / Admin*).
- `PUT /api/jobs/:id` — Update existing job listing (*Job Owner / Admin*).
- `DELETE /api/jobs/:id` — Delete job listing (*Job Owner / Admin*).

### Applications
- `POST /api/applications` — Submit application with cover letter and resume (*Candidate*).
- `POST /api/applications/upload-resume` — Upload verified PDF resume file.
- `GET /api/applications/my` — Retrieve candidate's active applications (*Candidate*).
- `GET /api/applications/recruiter` — Retrieve submitted applications for recruiter's jobs (*Recruiter / Admin*).
- `PUT /api/applications/:id/status` — Update application status (*Recruiter / Admin*).
- `DELETE /api/applications/:id` — Withdraw application (*Candidate / Admin*).
- `GET /api/applications/export/csv` — Export applications dataset as CSV (*Recruiter / Admin*).

### Notifications & Analytics
- `GET /api/notifications` — Retrieve user notifications.
- `PUT /api/notifications/read-all` — Mark all notifications as read.
- `GET /api/analytics/admin` — Retrieve system KPIs and breakdown (*Admin*).

### User Administration
- `GET /api/users/profile` — Get logged-in user profile.
- `PUT /api/users/profile` — Update candidate profile & skills.
- `GET /api/users` — List platform users (*Admin*).
- `PUT /api/users/:id/role` — Update user authorization role (*Admin*).

---

## 🧪 10. Testing & Verification Results

### 1. Backend Automated API Test Suite
Run the 42-test automated verification suite against the running server:
```powershell
npm test
```

**Actual Verified Output:**
```
--- STARTING COMPREHENSIVE WEEK 8 API TESTS ---
[TEST 1] Health Check: Status 200 -> PASS
[TEST 2] Register Candidate: Status 201 -> PASS
[TEST 3] Duplicate Register: Status 409 (Expected 409) -> PASS
[TEST 4] Login Candidate: Status 200 -> PASS
[TEST 5] Login Invalid Credentials: Status 401 (Expected 401) -> PASS
[TEST 6] Login Seeded Recruiter: Status 200 -> PASS
[TEST 7] Login Seeded Admin: Status 200 -> PASS
[TEST 8] GET /api/auth/me: Status 200 -> PASS
[TEST 9] POST /api/auth/logout: Status 200 -> PASS
[TEST 10] GET /api/users/profile: Status 200 -> PASS
[TEST 11] PUT /api/users/profile: Status 200 -> PASS
[TEST 11b] DELETE /api/users/profile: Status 200 -> PASS
[TEST 12] GET /api/jobs (Pagination): Status 200, Total: 15, Items: 5 -> PASS
[TEST 13] GET /api/jobs?search=react: Status 200, Found: 2 -> PASS
[TEST 13b] GET /api/jobs?search=Nexora (Company): Status 200, Found: 10 -> PASS
[TEST 13c] GET /api/jobs?search=Remote (Location): Status 200, Found: 4 -> PASS
[TEST 14] GET /api/jobs Multi-Filter: Status 200, Found: 2 -> PASS
[TEST 14b] GET /api/jobs?skill=React: Status 200, Found: 2 -> PASS
[TEST 15] GET /api/jobs?sort=stipend-high: Status 200 -> PASS
[TEST 15b] GET /api/jobs?sort=oldest: Status 200 -> PASS
[TEST 15c] GET /api/jobs?sort=deadline: Status 200 -> PASS
[TEST 16] GET /api/jobs/:id (Slug): Status 200 -> PASS
[TEST 17] POST /api/jobs (Recruiter Auth): Status 201 -> PASS
[TEST 18] PUT /api/jobs/:id: Status 200 -> PASS
[TEST 19] POST /api/applications (Apply): Status 201 -> PASS
[TEST 20] Prevent Duplicate Application: Status 409 (Expected 409) -> PASS
[TEST 21] GET /api/applications/my: Status 200, Count: 1 -> PASS
[TEST 22] GET /api/applications/:id: Status 200 -> PASS
[TEST 23] PUT /api/applications/:id/status: Status 200 -> PASS
[TEST 23b] Security: Candidate updates status (Expected 403): Status 403 -> PASS
[TEST 24] DELETE /api/applications/:id (Withdraw): Status 200 -> PASS
[TEST 25] Security: Missing Token (Expected 401): Status 401 -> PASS
[TEST 26] Security: Invalid Token (Expected 401): Status 401 -> PASS
[TEST 27] Security: Candidate creates Job (Expected 403): Status 403 -> PASS
[TEST 27b] Security: Candidate updates Job (Expected 403): Status 403 -> PASS
[TEST 28] Security: Malformed Input (Expected 400): Status 400 -> PASS
[TEST 29] DELETE /api/jobs/:id: Status 200 -> PASS
[TEST 30] Centralized 404 Handler (Expected 404): Status 404 -> PASS
--- STARTING WEEK 10 ADVANCED TESTS ---
[TEST 31] Security: Public registration cannot assign Admin: Status 201, Assigned Role: "candidate" -> PASS
[TEST 32] Recruiter GET /api/applications/recruiter: Status 200 -> PASS
[TEST 33] Security: Candidate blocked from recruiter applications (Expected 403): Status 403 -> PASS
[TEST 34] Admin GET /api/analytics/admin: Status 200 -> PASS
[TEST 35] Security: Candidate blocked from admin analytics (Expected 403): Status 403 -> PASS
[TEST 36] Admin GET /api/users: Status 200, Found: 20 -> PASS
[TEST 37] Security: Candidate blocked from user management (Expected 403): Status 403 -> PASS
[TEST 38] Admin PUT /api/users/:id/role: Status 200 -> PASS
[TEST 39] Notifications GET /api/notifications: Status 200, Unread: 1 -> PASS
[TEST 40] Notifications PUT /api/notifications/read-all: Status 200 -> PASS
[TEST 41] Advanced Challenge: GET /api/applications/export/csv: Status 200 -> PASS
[TEST 42] Security: Candidate blocked from CSV export (Expected 403): Status 403 -> PASS
--- ALL 42+ ADVANCED WEEK 10 API, SECURITY, AND WORKFLOW TESTS PASSED! ---
```

### 2. Database Persistence Verification
Run database persistence, schema validation, and fault-tolerance checks:
```powershell
npm run test:persistence
```
- Verified User persistence in MongoDB Atlas.
- Verified relational Job & Application schema integrity.
- Verified explicit fast-failure on unreachable DB hosts (no silent fallback).

### 3. Frontend Production Build Check
```powershell
npm run build
```
- Built production bundles with Rollup vendor chunking (`react-vendor`, `icons-vendor`) in under 1 second.
- Mirrored build output to `docs/` and generated `dist/404.html`.

---

## 🔐 11. Pre-Seeded Evaluation Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Candidate** | Register new or use test accounts | Provided during registration | Search, apply with resume, manage profile, track status |
| **Recruiter** | `recruiter@nexoracloud.com` | `RecruiterPassword123!` | Create/edit jobs, manage applicants, update statuses, export CSV |
| **Admin** | `admin@dginternshub.com` | `AdminPassword123!` | System analytics, user management, global job moderation |

---

## 📄 License & Attribution

Developed for the **DG Interns Hub** Full-Stack Web Development Internship Program.
- **Author:** Vishal T
- **Repository:** [https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11)
