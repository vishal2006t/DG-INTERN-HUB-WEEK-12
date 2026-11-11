# DG Interns Hub — Week 12 Final Capstone Technical Report

---

## 1. Cover Page

- **Project Title:** DG Interns Hub — Production Full-Stack Job & Internship Portal (Week 12 Final Capstone Upgrade)
- **Developer:** Vishal (`vishal2006t`)
- **Workspace:** `D:\DG INTERNS HUB\WEEK 12\WEB`
- **Baseline Reference:** Upgraded from DG Interns Hub Week 11 (`https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-11`) while keeping Week 11 code & cloud deployments completely isolated.
- **Tech Stack:** React 19, Vite 8, React Router 7, Express 5, Node.js, MongoDB Atlas, Mongoose 9, JWT, Helmet
- **Submission Month:** November 2026

---

## 2. Internship Information

| Attribute | Details |
| :--- | :--- |
| **Program / Track** | Full-Stack Web Development Internship — Capstone Milestone (Week 12) |
| **Project Category** | SaaS Talent Acquisition, Internship Discovery & Recruitment Management Portal |
| **Development Focus** | Complete SaaS UI/UX redesign, REST API & Mongoose indexing upgrades, security hardening, performance optimization, automated E2E + responsive testing, and isolated deployment readiness |
| **Codebase Architecture** | Decoupled React Single Page Application (SPA) + Node.js/Express REST API + MongoDB Atlas Cloud Database |

---

## 3. Abstract

**DG Interns Hub (Week 12 Capstone)** evolves the functional Week 11 internship board into a production-ready, secure, and responsive SaaS recruitment platform serving **Candidates**, **Recruiters**, and **Administrators**. Building directly atop existing authentication, database models, and Express endpoints without regressions, the upgrade introduces a cohesive Light/Dark SaaS design system, persistent sidebar workspaces (`WorkspaceLayout`), four dedicated candidate/account pages (`SavedJobs`, `Notifications`, `Settings`, enhanced `Profile`), live MongoDB homepage telemetry (`GET /api/analytics/public`), multi-facet job filtering (`GET /api/jobs/filters`), persistent `ContactMessage` inquiry workflows, PDF `%PDF-` magic-byte verification, NoSQL/XSS/ReDoS/IDOR/CSV-injection defenses, and code-split React lazy routes. Verification across `oxlint` (`0` warnings/errors), Vite production builds (`471ms`), a 20-case backend security E2E suite (`20/20 PASSED`), and a 26-check headless Google Chrome CDP responsive audit across `1920px`, `1440px`, `768px`, and `375px` confirms live cloud database execution with zero horizontal overflow or console errors.

---

## 4. Introduction

Early-career talent programs and engineering startups frequently rely on fragmented spreadsheets, unstructured email attachments, and inconsistent portals to source interns and junior engineers. **DG Interns Hub** consolidates the entire recruitment lifecycle—discovery, debounced search, validated resume submission, recruiter stage progression, notifications, support inquiries, and platform governance—inside a unified web application backed exclusively by live MongoDB Atlas records.

---

## 5. Problem Statement

Auditing the Week 11 starting codebase (`phase1_4_audit_and_plan.md`) identified critical functional, visual, and security gaps preventing production sign-off:
1. **Inconsistent SaaS UI & Missing Workspace Pages:** Pages shared mixed visual styles across Light/Dark themes, lacked a cohesive workspace sidebar shell, and omitted dedicated routes for `/saved-jobs`, `/notifications`, and `/settings`.
2. **Static Contact & Missing Facets:** Contact form inquiries lacked database persistence and admin triage, and experience-level filtering/facets relied on incomplete query criteria.
3. **Security & Authorization Vulnerabilities:** Potential cross-recruiter IDOR when passing unowned `jobId` filters, reliance on filename extensions rather than PDF `%PDF-` magic bytes, unescaped regex characters risking ReDoS, default fallback secrets if `JWT_SECRET` was omitted in production, and missing CSV formula escaping.
4. **Lint & Performance Debt:** Context/provider coupling triggered fast-refresh lint warnings, and lazy route loaders lacked `aria-busy="true"` accessibility/readiness attributes.

---

## 6. Objectives

1. **Redesign UI/UX Platform-Wide:** Establish a cohesive Light/Dark SaaS design system across all 13 routes and modals with skeleton loaders, toasts, confirmation dialogs, and mobile navigation drawers.
2. **Preserve & Upgrade Backend APIs:** Maintain backward-compatible API contracts while adding live public stats (`/api/analytics/public`), dynamic filter facets (`/api/jobs/filters`), persistent contact inquiries (`/api/contact`), and indexed queries.
3. **Eliminate Security Gaps:** Enforce fail-closed production `JWT_SECRET`, RBAC + IDOR checks, NoSQL `$`/`.` sanitization, XSS stripping, `%PDF-` upload inspection, strict CORS, Helmet headers, and rate limits.
4. **Optimize Performance:** Apply `React.lazy` route splitting, vendor chunks, `350ms` debounced search, `React.memo`, `useMemo`, `useCallback`, server pagination, and compound MongoDB indexes.
5. **Verify Empirically & Prepare Isolated Deployment:** Document 26+ executed tests, capture 10 verified screenshots across breakpoints, and configure separate Week 12 Render (`dg-intern-hub-week-12-api`) and Vercel deployments.

---

## 7. Existing System (Week 11 Baseline)

The Week 11 project already delivered working MERN fundamentals:
- Express v5 server (`server/server.js`) with Mongoose v9 Atlas integration (`User`, `Job`, `Application`, `Notification`).
- Bcrypt password hashing (`10` salt rounds) and JWT Bearer authentication.
- Basic job CRUD, application submission/withdrawal, recruiter CSV export, and baseline responsive styles.
- A 42-test API script (`server/utils/test-apis.js`).

Every working capability from Week 11 was preserved and extended rather than discarded.

---

## 8. Proposed System (Week 12 Upgrade Architecture)

The upgraded Week 12 platform delivers:
- **Unified Workspace Shell:** `WorkspaceLayout.jsx` adapts sidebar navigation dynamically by user role (`candidate`, `recruiter`, `admin`).
- **Complete Route Suite:** Added `/saved-jobs`, `/notifications`, and `/settings`, alongside redesigned `Home`, `Jobs`, `JobDetailsPage`, `Dashboard`, `Applications`, `Profile`, `Contact`, `Login`, `Register`, and `NotFound`.
- **Upgraded Backend & Models:** Added `ContactMessage` collection, `Job.experienceLevel`, `User.notificationPreferences`, `User.isActive`, `Application.notes`, `server/config/jwt.js`, and centralized error/validation middleware.
- **Automated Quality Gates:** Added `npm run test:e2e` (`20/20`), resolved every `oxlint` warning (`0 warnings, 0 errors`), and ran a Chrome CDP responsive audit across all 4 target breakpoints.

---

## 9. Features

### 9.1 Candidate Features
- Explore live listings via keyword search (`350ms` debounce), category pills, work mode (`Remote`/`Hybrid`/`On-site`), job type, experience level, location, sorting, and pagination.
- Inspect rich role details (`/jobs/:id`), bookmark roles into `SavedJobs`, and submit applications with validated `.pdf` resume uploads (max `5MB`).
- Track status progression (`pending`, `reviewed`, `shortlisted`, `accepted`, `rejected`), withdraw pending applications, manage skills/profile readiness, and configure notification preferences.

### 9.2 Recruiter Features
- Post new opportunities (`PostJobModal`), edit/close owned listings (`EditJobModal`), and track live applicant counters in **Recruiter Hiring Studio**.
- Review applicant cover letters & resumes, record private review notes, update status with automated applicant notifications, and export safe CSV pipelines.

### 9.3 Admin Features
- Monitor live platform KPIs (`Registered Users`, `Job Listings`, `Platform Applications`, `Open Support Inquiries`), role distributions, pipeline charts, and recent activity.
- Manage user roles/account activation (`Users` tab), moderate postings (`Jobs` tab), inspect global applications (`Applications` tab), and resolve `ContactMessage` support tickets (`Inquiries` tab).

---

## 10. Technology Stack

| Layer | Technology | Version / Role |
| :--- | :--- | :--- |
| **UI Library** | React (`react`, `react-dom`) | v19 SPA with Hooks, Context & Suspense |
| **Build & Bundling** | Vite + Rolldown | v8.x ESM bundler, code-splitting (`react-vendor`, `icons-vendor`, per-route lazy chunks) |
| **Routing & Networking** | React Router DOM 7 + Axios 1 | HashRouter client navigation + centralized JWT interceptors |
| **Icons & Styling** | Lucide React + Custom CSS Tokens | Accessible SVGs, `[data-theme="dark"]` & responsive CSS grid/flexbox |
| **API Runtime** | Node.js v20+ & Express.js 5 | Layered routes, controllers, middleware & validators |
| **Database** | MongoDB Atlas & Mongoose 9 | Managed cloud cluster (`dg_interns_hub`), 5 indexed schemas |
| **Security Middleware** | `helmet`, `cors`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`, `multer` | Defense-in-depth across transport, headers, payloads & storage |
| **QA Tooling** | `oxlint`, Node E2E runner, Google Chrome CDP, `python-pptx`, `pypdf` | Linting, security testing, layout verification & deliverable generation |

---

## 11. System Architecture

DG Interns Hub separates presentation (React SPA) from stateless REST business logic (Express API) and cloud persistence (MongoDB Atlas):
1. **Presentation Tier:** Static optimized assets served cleanly by Vercel (`vercel.json`) communicating via HTTPS REST requests (`VITE_API_BASE_URL`).
2. **API Gateway & Security Tier:** Strict CORS origin check -> Helmet security headers -> Rate limiters -> `15kb` body limit -> Global NoSQL/XSS payload sanitizer -> Parameter validation.
3. **Domain Controller & Storage Tier:** Modular controllers execute lean indexed Mongoose queries and Multer disk uploads (`/uploads/resumes/*.pdf`) after verifying `%PDF-` magic bytes.

---

## 12. Database Design

Five core collections normalize entities cleanly while leveraging strategic denormalized counters and compound indexes (`docs/DATABASE_DOCUMENTATION.md`):
- **`User` (`users`):** Unique email index, `select: false` bcrypt password hash (`10` rounds), role enum, `isActive`, `lastLogin`, profile attributes, and `notificationPreferences`.
- **`Job` (`jobs`):** Text index `(title, company, description, skills)` plus compound indexes on `(category, workType, createdAt)`, `(status, experienceLevel)`, `(postedBy, status)`, `(stipendAmount)`, and `(deadline)`.
- **`Application` (`applications`):** Compound unique index `{ job: 1, applicant: 1 }` preventing duplicate applications (`409 Conflict`), plus indexed `status`, `job`, `applicant`, and `notes`.
- **`Notification` (`notifications`):** Compound index `{ recipient: 1, createdAt: -1 }` and `isRead` index.
- **`ContactMessage` (`contactmessages`):** Added in Week 12 with `{ status: 1, createdAt: -1 }` index and `reviewedBy -> User._id`.

---

## 13. UI/UX Design & Responsive Engineering

The Week 12 UI overhaul replaced fragmented stylesheets with a coherent SaaS system in `src/styles/saas-redesign.css` and `src/index.css`:
- **Consistent Theme Tokens:** Light (`#F8FAFC` background, `#0F172A` text, `#2563EB` primary accent) and Dark (`#0B0F19` background, `#F8FAFC` text, high-contrast slate surfaces) themes toggle cleanly without page reload and persist in `localStorage`.
- **Feedback & States:** Reusable `Loader` (shimmer skeletons + `aria-busy="true"` spinners), `Toast` notifications, empty states, retry error banners, and `ConfirmDialog` modals for destructive actions.
- **Verified Breakpoints:** Tested at `1920x1080`, `1440x900`, `768x1024`, and `375x812`, confirming zero horizontal scroll (`scrollWidth <= innerWidth`), stacked responsive forms, scrollable tables, and working mobile navigation drawer.

---

## 14. Authentication & Role-Based Access Control

- **Password Security:** `User.pre('save')` hashes passwords using `bcryptjs.genSalt(10)`. `password` is excluded from default queries (`select: false`).
- **JWT Session Architecture (`server/config/jwt.js`):** Signs user ID and role into Bearer tokens; fails closed immediately in `NODE_ENV=production` when `JWT_SECRET` is absent or left empty.
- **Active Account Enforcement (`server/middleware/authMiddleware.js`):** Queries current user status and rejects deactivated accounts (`isActive === false -> 403`) alongside expired/malformed JWTs (`401`).
- **Frontend `ProtectedRoute.jsx`:** Guards private and role-specific views while remembering intended URLs (`state.from`) during login redirect.

---

## 15. REST API Development

All controllers serialize consistent JSON responses via `sendSuccess()` and `sendError()` (`server/utils/helpers.js`). Key Week 12 additions documented in `API-DOCUMENTATION.md` and `postman/DG-Interns-Hub-API.json` include:
- `GET /api/analytics/public` (4 parallel live DB aggregations for Homepage cards)
- `GET /api/jobs/filters` (live open-job categories, locations, work modes, experience facets)
- `POST /api/applications/upload-resume` (magic-byte verified PDF uploads)
- `GET /api/applications/admin` (Admin global pipeline overview)
- `POST /api/contact`, `GET /api/contact`, `PATCH /api/contact/:id/status` (Support ticket CRUD)
- `DELETE /api/notifications/:id` (Single notification removal)

---

## 16. Security Hardening & Performance Optimizations

### Security Controls Verified
1. **NoSQL Operator Injection Defense:** Global sanitizer strips keys starting with `$` or containing `.` without mutating user password strings; controllers validate string types and allowlisted enums on query strings (`?type[$ne]=...` blocked).
2. **XSS & ReDoS Mitigation:** Stripped `<script>`/HTML tags from text payloads (`TC10` verified) and escaped RegExp metacharacters (`escapeRegExp`) prior to `$regex` search (`TC09` verified).
3. **IDOR & RBAC Segregation:** Enforced Recruiter ownership on `jobId` filter queries, job edits, and application status updates (`403` verified in `TC13`), plus strict block against public `admin` registration (`TC03`).
4. **File & CSV Hardening:** Verified `%PDF-` header bytes (`TC14`) and neutralized CSV formula injection prefixes (`=`, `+`, `-`, `@`) during exports (`TC16`).
5. **Transport & Burst Protection:** Strict CORS allowlist (`403` disallowed origin `TC19`), Helmet (`nosniff`, `crossOriginResourcePolicy: cross-origin`), and dual-tier `express-rate-limit` (`429` verified in `TC20`).

### Meaningful Performance Optimizations Implemented
1. **`React.lazy` + `Suspense` Code Splitting** across 15+ routes & modals cleanly isolating `react-vendor.js` and `icons-vendor.js`.
2. **350ms Debounced Job Search** preventing redundant network/database roundtrips while typing.
3. **`React.memo`, `useMemo`, and `useCallback`** reducing unnecessary re-renders on `JobCard` grids and dashboard filter states.
4. **MongoDB Text & Compound Indexes** + `.lean()` read queries + parallel `Promise.all` facets & analytics.
5. **Server-Side Pagination (`page`, `limit`)** bounding payload sizes on directory and pipeline views.

---

## 17. Testing & QA Results

All suites passed cleanly after final edits:
- **`npm run lint` (`oxlint`):** `0 warnings, 0 errors` across 88 files (104 rules, `87ms`).
- **`npm run build` (`vite build`):** Completed cleanly in `471ms` with optimized route chunks.
- **`npm run test:e2e` (`server/utils/test-week12-e2e.js`):** **`20 / 20 PASSED, 0 FAILED`** (live MongoDB Atlas CRUD, RBAC, IDOR, NoSQL/XSS/ReDoS, PDF magic bytes, CSV injection, CORS, Rate limiting; zero leftover test records).
- **Headless Chrome CDP Browser Audit (`browser_audit.mjs`):** **`26 / 26 PASSED`** (`overflow=false` across `1920px`, `1440px`, `768px`, `375px`; Light/Dark toggles; debounced `"Python"` filter `9 -> 2`; `"Remote"` filter `9 -> 4`; Candidate/Recruiter/Admin dashboards; **0** console errors, **0** page errors, **0** HTTP `>=500` responses).

---

## 18. Deployment Strategy (Isolated Week 12 Configuration)

Week 12 is strictly isolated from Week 11 (`dg-intern-hub-week-11-api.onrender.com`, `dghubintern.vercel.app`, GitHub Week 11 repo):
- **Backend (`render.yaml`):** Separate service `dg-intern-hub-week-12-api` with `/api/health` readiness check, `NODE_ENV=production`, auto-generated `JWT_SECRET`, and secretless templates in `.env.example`.
- **Frontend (`vercel.json`):** Separate Vercel project building `dist/` via `npm run build` with security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`) and SPA rewrites.
- **Containers:** Updated `Dockerfile` (with `/api/health` `HEALTHCHECK`) and `docker-compose.yml` (`dg-interns-hub-week12-api`).
- **Verified Production Smoke Test:** Running `server/server.js` under `NODE_ENV=production` confirmed fail-closed missing `JWT_SECRET` rejection, healthy Atlas connection (`connected`), Helmet `nosniff`, permitted Week 12 CORS origin, and `403` on unauthorized origins.

---

## 19. Verified Application Screenshots

Ten verified captures in `screenshots/01`–`10.png` showcase:
- Public Homepage in Light & Dark modes (`1440px`) and Mobile Drawer (`375px`).
- Live Jobs Directory (`1440px`) and Job Details (`1440px`).
- Candidate Workspace in Light & Dark modes, Recruiter Hiring Studio, Admin Control Center, and Contact Support (`1440px`).

---

## 20. Challenges and Solutions

| Challenge Encountered | Root Cause Diagnosed | Verified Solution |
| :--- | :--- | :--- |
| Vertical / shifted pill tags inside upgraded `.job-card` | Legacy `src/App.css` `.job-card-pills` rule aligned pills right/columnar with higher selector cascade | Overrode `.job-card-pills` cleanly inside `src/styles/saas-redesign.css` as horizontal flex wrap |
| Mobile navbar auth button crowding at `375px` | `.brand-title` wrapped and desktop auth controls remained partially visible | Hid `.desktop-only-auth` under `@media (max-width: 640px)` and set `white-space: nowrap` on `.brand-title` |
| Potential cross-recruiter IDOR on `?jobId=` queries | Recruiter `/api/applications/recruiter` filtered directly on `req.query.jobId` without verifying ownership | Verified `job.postedBy === req.user.id` before filtering, returning `403` on unowned IDs |
| Lazy route readiness & Contact subtitle indentation | `<Loader>` spinner lacked `aria-busy="true"` and `.contact-subtitle` inherited `margin: 0 auto` | Added `aria-busy="true"` in `Loader.jsx` and `margin: 0 !important` override on `.contact-subtitle` |
| React Fast Refresh / `oxlint` warnings | Mixing `createContext` exports with JSX components triggered lint warnings | Extracted `src/context/contextObjects.js` & `src/hooks/useContexts.js` (`0` warnings/errors) |

---

## 21. Future Scope

1. Cloud object storage (AWS S3 / Cloudinary) for multi-instance stateless resume storage.
2. Transactional email dispatch (SMTP/Resend) triggered by application milestones & inquiry replies.
3. Two-factor authentication (TOTP) and OAuth social sign-on for candidates and recruiters.
4. Candidate resume skill extraction and automated job-matching scoring.

---

## 22. Conclusion

The **DG Interns Hub Week 12 Final Capstone** successfully transforms the baseline Week 11 codebase into a cohesive, secure, performant, and thoroughly documented full-stack SaaS recruitment platform. All three role workspaces, API endpoints, security controls, responsive layouts across desktop/tablet/mobile, and deployment templates have been verified end-to-end against live MongoDB Atlas data with zero mock statistics and full isolation from prior Week 11 deployments.

