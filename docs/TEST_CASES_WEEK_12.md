# DG Interns Hub (Week 12 Capstone) — Test Execution Matrix & QA Report

All test cases below were executed after final source code edits against the live **Node.js + Express 5** server connected to **MongoDB Atlas (`dg_interns_hub`)**, the **Vite 8** production build, `oxlint`, and **Google Chrome Headless via CDP**. Zero test mocks or fake dashboard statistics were used.

## 1. Execution Summary

| Suite / Tool | Command Executed | Scope | Result |
| :--- | :--- | :--- | :--- |
| Static Linter | `npm run lint` (`oxlint`) | 88 source files, 104 rules | **PASSED** (0 warnings, 0 errors) |
| Production Bundle | `npm run build` (`vite build`) | Lazy routes, vendor chunks, CSS/JS minification | **PASSED** (built in 471ms, 28 output assets) |
| Backend API & Security E2E Suite | `npm run test:e2e` (`server/utils/test-week12-e2e.js`) | Auth, RBAC, IDOR, CRUD, PDF magic bytes, NoSQL/XSS/ReDoS, CSV safety, Rate limit, CORS | **20 / 20 PASSED**, 0 FAILED |
| Browser UI & Responsive Audit | Headless Chrome CDP (`browser_audit.mjs`) against live backend & `dist/` | Light/Dark themes, `1920px`/`1440px`/`768px`/`375px` viewports, debounced search, filters, bookmarks, all 3 role dashboards | **26 / 26 CHECKS PASSED** (0 console errors, 0 page errors, 0 HTTP 5xx) |
| Production Startup Verification | `NODE_ENV=production` local verification script | Fail-closed missing `JWT_SECRET`, Atlas connectivity, Helmet `nosniff`, Week 12 CORS origin check | **PASSED** (`dbStatus: connected`, `403` bad origin) |

---

## 2. Documented Test Cases (26 Detailed Cases)

### A. Backend API, Security & Database E2E (`TC01`–`TC20`, `npm run test:e2e`)

| ID | Category | Test Description | Actual Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC01` | Health & DB | `GET /api/health` verifies live MongoDB Atlas connection | HTTP `200`; `database.status = "connected"`, `database.name = "dg_interns_hub"` (`63ms`) | **PASS** |
| `TC02` | Public Analytics | `GET /api/analytics/public` returns real DB counts | HTTP `200`; non-negative counts returned from Atlas (`open=16`, `candidates=38`) | **PASS** |
| `TC03` | Registration & RBAC | Candidate/Recruiter registration hashes password (`bcrypt`) and rejects self-assigned `admin` role | Candidate/Recruiter created (`201`); self-assigned `admin` rejected / disallowed (`1020ms`) | **PASS** |
| `TC04` | Authentication & Audit | Valid login returns JWT for Candidate & Admin, omits password, updates `lastLogin` | HTTP `200`; signed JWT returned without `password` field; `lastLogin` updated (`614ms`) | **PASS** |
| `TC05` | Auth Failure | Invalid password on `/api/auth/login` rejected | HTTP `401` Unauthorized returned (`196ms`) | **PASS** |
| `TC06` | JWT Guard | Requests without token or with malformed JWT rejected | HTTP `401` Unauthorized returned on protected endpoints (`13ms`) | **PASS** |
| `TC07` | Input Validation | Registration with weak password or malformed email rejected | HTTP `400` Bad Request with validation message (`4ms`) | **PASS** |
| `TC08` | NoSQL Injection | `$gt` / `$ne` query and payload operators blocked across auth, jobs, and admin users | Injection payloads neutralized / rejected without bypassing auth or leaking records (`6947ms`) | **PASS** |
| `TC09` | ReDoS & Regex Escape | Regex metacharacters (`([a+])+$` etc.) in job search safely escaped | HTTP `200` empty/safe query without HTTP `500` or regex backtracking stall (`462ms`) | **PASS** |
| `TC10` | XSS Sanitization | HTML `<script>` / event payloads stripped cleanly on `POST /api/contact` | Persisted record stripped dangerous tags before saving to `contactmessages` (`468ms`) | **PASS** |
| `TC11` | Search, Filter, Facets | `GET /api/jobs/filters`, experience filter, keyword search, sorting, and pagination | HTTP `200`; `6` live categories returned; page 1 returned `5` jobs with pagination metadata (`512ms`) | **PASS** |
| `TC12` | Recruiter CRUD & Guard | Recruiter creates & updates job; mass-assignment & cross-recruiter edits blocked | Job created (`201`) & updated; non-owner recruiter edit returned `403` (`1639ms`) | **PASS** |
| `TC13` | RBAC & IDOR | Candidate posting job (`403`), Recruiter hitting Admin analytics (`403`), Recruiter querying unowned `jobId` apps (`403`) | All unauthorized role & cross-tenant IDOR requests blocked with HTTP `403` (`2916ms`) | **PASS** |
| `TC14` | File Upload Security | `/api/applications/upload-resume` rejects non-PDF magic bytes and accepts valid `%PDF-` file | Non-PDF payload returned HTTP `400`; valid `%PDF-` payload saved cleanly and returned `200` (`2102ms`) | **PASS** |
| `TC15` | Candidate Lifecycle | Profile update (`phone`, `education`, `bio`), job application submit, duplicate apply guard (`409`), and withdraw | Profile updated; application created; duplicate blocked; withdrawal removed application cleanly (`7067ms`) | **PASS** |
| `TC16` | Recruiter Pipeline & CSV | Recruiter updates status/notes; CSV export escapes formula-injection prefixes (`=`, `+`, `-`, `@`) | Status transitioned & notes persisted; exported CSV prefixed dangerous cells safely (`3186ms`) | **PASS** |
| `TC17` | Notifications | Lists notifications, marks single/all as read, and deletes notification | Persistent notifications retrieved, updated, and deleted cleanly (`4827ms`) | **PASS** |
| `TC18` | Admin Moderation | Admin reads analytics, users, applications, updates inquiry status, and deletes test job | Admin endpoints succeeded (`200`) and cascaded test cleanup (`4983ms`) | **PASS** |
| `TC19` | CORS Policy | Disallowed origin rejected (`403`) while localhost / allowed origins pass | `Origin: https://evil...` rejected (`403`); localhost permitted (`5ms`) | **PASS** |
| `TC20` | Rate Limiting | API/Auth rate limiter emits standard `RateLimit-*` headers and enforces `429` | Standard headers verified and burst requests above threshold returned `429` (`14ms`) | **PASS** |

### B. Browser UI, Workflow & Responsive Breakpoint Audit (`TC21`–`TC26`, Headless Chrome CDP)

| ID | View / Flow | Tested Breakpoints & Themes | Actual Observed Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| `TC21` | Homepage & Theme Engine | `1920x1080`, `1440x900`, `768x1024`, `375x812`; Light & Dark toggle; Mobile Drawer | `overflow=false` at all 4 widths (`scrollWidth <= innerWidth`), theme toggle `light <-> dark` verified, mobile drawer opened cleanly | **PASS** |
| `TC22` | Jobs Search, Filters & Bookmark | `1440x900`, `375x812` (`/jobs`, `/jobs/:id`) | Initial page showed `9` cards; debounced `"Python"` search narrowed to `2` cards; `"Remote"` Work Mode filter narrowed to `4` cards; bookmark saved; Job Details rendered full title, skills & metrics | **PASS** |
| `TC23` | Auth & Contact Alignment | `1440x900`, `375x812` (`/login`, `/register`, `/contact`) | All auth forms and left-aligned Contact layout rendered without horizontal overflow (`overflow=false`) | **PASS** |
| `TC24` | Candidate Workspace UI | `1440x900` Light/Dark, `375x812`; `/dashboard`, `/applications`, `/saved-jobs`, `/notifications`, `/profile`, `/settings` | Zero console/page errors; sidebar navigation and all 6 workspace routes rendered live data (`overflow=false`) | **PASS** |
| `TC25` | Recruiter Hiring Studio UI | `1440x900`, `375x812` (`/dashboard`) | Login routed to Recruiter Hiring Studio displaying live KPI metrics (`16` open jobs, `13` applicants) & table with zero overflow | **PASS** |
| `TC26` | Admin Control Center UI | `1920x1080`, `1440x900`, `768x1024`, `375x812` (`/dashboard`) | Login routed to Admin Control Center displaying live totals (`40` users, `16` jobs, `13` apps) across all 4 viewports (`overflow=false`) | **PASS** |

