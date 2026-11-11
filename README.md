# DG Interns Hub — Week 12 Final Full-Stack Capstone Application

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_Live-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Week12_E2E-20%2F20_Passed-success.svg)](server/utils/test-week12-e2e.js)
[![Lint](https://img.shields.io/badge/oxlint-0_Warnings-success.svg)](package.json)

**DG Interns Hub (Week 12 Final Capstone)** upgrades the Week 11 MERN job and internship portal into a modern SaaS recruitment platform featuring a unified design system (Light & Dark themes), persistent sidebar workspaces for Candidates, Recruiters, and Admins, MongoDB Atlas live data pipelines, security hardening, performance tuning, and complete engineering deliverables.

> **Week 11 Preservation Policy:** Week 12 lives solely inside `D:\DG INTERNS HUB\WEEK 12\WEB` with isolated `render.yaml` (`dg-intern-hub-week-12-api`) and `vercel.json` deployment targets so Week 11 repositories and production deployments remain untouched.

---

## 1. Key Platform Capabilities

### Candidate Workspace
- **Explore Listings (`/jobs`):** 350ms debounced search, dynamic facets (`GET /api/jobs/filters`), work mode, job type, experience level, location, sorting, and server-side pagination.
- **Job Details & Resume Apply (`/jobs/:id`):** Skill tags, stipend overview, bookmark toggle, and modal application submission with validated `.pdf` resume upload (`%PDF-` magic-byte check, 5MB cap).
- **Candidate Dashboard (`/dashboard`), Applications (`/applications`), Saved Jobs (`/saved-jobs`), Notifications (`/notifications`), Profile (`/profile`), & Settings (`/settings`):** Real-time application tracking, readiness score, withdrawal, and persisted notification preferences.

### Recruiter Hiring Studio
- **Role Dashboard:** Live open job counts, applicant pipelines, **Post Internship** & **Edit Job** modals.
- **Applicant Moderation:** Review cover statements/resumes, persist internal review notes, update status (`pending` -> `reviewed` -> `shortlisted` -> `accepted` / `rejected`), and trigger CSV exports with formula-injection neutralization.

### Admin Control Center
- **Platform Telemetry:** Live database aggregations (`Users by Role`, `Applications Pipeline`, `Recent Platform Activity`).
- **Governance Tabs:** Manage Users & Roles, Moderate Listings, Oversee Global Applications (`/api/applications/admin`), and Triage Persistent Support Inquiries (`ContactMessage`).

---

## 2. Architecture & Technology Stack

| Layer | Technologies | Implementation Highlights |
| :--- | :--- | :--- |
| **Frontend SPA** | React 19, Vite 8, React Router DOM 7 (`HashRouter`), Axios, Lucide React | `WorkspaceLayout`, Light/Dark theme tokens (`[data-theme]`), `React.lazy` code splitting, `React.memo`, `useMemo`, `useCallback`, debounced search |
| **Backend API** | Node.js v20+, Express 5, Multer 2, JWT, `bcryptjs` | Decoupled REST controllers, parameterized validators, `sendSuccess`/`sendError` envelope, PDF magic-byte inspection |
| **Database** | MongoDB Atlas, Mongoose 9 | 5 indexed models (`User`, `Job`, `Application`, `Notification`, `ContactMessage`), text & compound filter indexes |
| **Security** | Helmet, CORS, Express Rate Limit, Global Sanitizer | Fail-closed production `JWT_SECRET`, strict origin CORS, NoSQL `$`/`.` sanitization, XSS stripping, IDOR ownership checks, ReDoS escaping |

---

## 3. Quick Start & Verification Commands

### Prerequisites
- Node.js v20+ and npm
- MongoDB Atlas connection string (or local MongoDB instance)

### Installation & Local Run
```bash
# 1. Install dependencies
npm ci

# 2. Configure environment variables (never commit .env!)
cp .env.example .env

# 3. Run Express backend API (port 5000) + Vite dev server (port 5173)
npm run server
npm run dev
```

### Quality, Security & Responsive Verification
```bash
# Static lint check (oxlint across all 88 files)
npm run lint

# Vite production build + SPA fallback
npm run build

# Week 12 Backend API, RBAC, IDOR & Security E2E Suite (20/20 tests)
npm run test:e2e

# Legacy Week 11 API baseline suite
npm test
```

---

## 4. Separate Week 12 Deployment Architecture

- **Backend (`render.yaml`):** Deploy as a **new** Render Web Service named `dg-intern-hub-week-12-api` (`startCommand: npm start`, `healthCheckPath: /api/health`). Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (auto-generated), `FRONTEND_URL`, and `CORS_ORIGINS` cleanly in Render Dashboard.
- **Frontend (`vercel.json`):** Deploy to a **new** Vercel project running `npm run build` (`dist/`) with `VITE_API_BASE_URL=https://dg-intern-hub-week-12-api.onrender.com/api`.
- **Docker:** `Dockerfile` (with `/api/health` `HEALTHCHECK`) and `docker-compose.yml` (`dg-interns-hub-week12-api`) ready for containerized runs.

---

## 5. Capstone Deliverables Index

| Deliverable | Location |
| :--- | :--- |
| **REST API Reference** | [API-DOCUMENTATION.md](API-DOCUMENTATION.md) |
| **Database Schemas & Indexes** | [docs/DATABASE_DOCUMENTATION.md](docs/DATABASE_DOCUMENTATION.md) |
| **Architecture & ER Diagrams** | [docs/ARCHITECTURE_AND_ER.md](docs/ARCHITECTURE_AND_ER.md) |
| **Frontend / Backend Modules** | [frontend/README.md](frontend/README.md), [backend/README.md](backend/README.md) |
| **Postman v2.1 Collection** | [postman/DG-Interns-Hub-API.json](postman/DG-Interns-Hub-API.json) |
| **26+ Verified Test Cases** | [docs/TEST_CASES_WEEK_12.md](docs/TEST_CASES_WEEK_12.md) |
| **Verified Screenshots** | [screenshots/README.md](screenshots/README.md) & `screenshots/*.png` |
| **15–20 Page Final Report** | `docs/DG_Interns_Hub_Week12_Final_Report.pdf` (& `.md`) |
| **15-Slide Final Presentation** | `docs/DG_Interns_Hub_Week12_Presentation.pptx` |
| **7–10 Min Demo Flow** | [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) |
