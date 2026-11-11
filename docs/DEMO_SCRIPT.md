# DG Interns Hub (Week 12 Capstone) — Live Demonstration Script (7–10 Minutes)

**Target Duration:** ~8–9 minutes  
**Pre-Demo Checklist:** Ensure MongoDB Atlas IP access is active, `.env` has valid secrets, and both backend (`npm run server`) and frontend (`npm run dev` or Week 12 deployed URLs) are running cleanly.

---

## Segment 1: Homepage & Live Metrics (0:00 – 0:45)
1. Open the Landing Page (`/`).
2. Point out the SaaS visual redesign, **Light / Dark theme toggle** in the navbar, and the **4 live KPI cards** (`Active Internships`, `Registered Candidates`, `Partner Companies`, `Applications Processed`) queried live via `GET /api/analytics/public`.
3. Click through a quick featured category or hero CTA into `/jobs`.

## Segment 2: Candidate Registration (0:45 – 1:30)
1. Navigate to `/register`.
2. Switch between **Candidate** and **Recruiter** role toggles; explain that `admin` role self-registration is strictly disabled on both frontend UI and backend `POST /api/auth/register`.
3. Register a fresh candidate account (showing inline field validation + password strength check + instant JWT login).

## Segment 3: Login & Session Flow (1:30 – 2:10)
1. Sign out and navigate to `/login`.
2. Demonstrate invalid credential handling (`401`) vs valid login (`candidate@example.com` or newly created account).
3. Show destination memory / automatic role redirect to `/dashboard`.

## Segment 4: Search & Multi-Facet Filters (2:10 – 3:10)
1. Open `/jobs` (`Explore Internships`).
2. Type `"Python"` into the search bar to show the **350ms debounced API search** updating live cards from MongoDB.
3. Combine dropdown filters (**Work Mode: Remote**, **Job Type**, **Experience Level**, **Location**, **Sort By: Highest Stipend**) powered by `GET /api/jobs/filters` + compound database indexes.
4. Bookmark a listing into **Saved Jobs**.

## Segment 5: Candidate Functionality & CRUD (3:10 – 4:15)
1. Open **Job Details** (`/jobs/:id`) and click **Apply For This Role**.
2. Upload a real `.pdf` resume (highlight client + server **PDF magic-byte `%PDF-` validation** & 5MB size cap).
3. Visit **Candidate Dashboard** (`/dashboard`), **My Applications** (`/applications`), **Profile & Resume** (`/profile`), **Notifications** (`/notifications`), and **Settings** (`/settings`) via the persistent SaaS workspace sidebar.
4. Withdraw a test application or update profile skills to demonstrate live Candidate CRUD persistence.

## Segment 6: Recruiter Functionality & Pipeline CRUD (4:15 – 5:30)
1. Sign in as Recruiter (`recruiter@nexoracloud.com`).
2. In **Recruiter Hiring Studio** (`/dashboard`), open **Post Internship** modal (`POST /api/jobs`), create a listing, edit it (`PUT /api/jobs/:id`), and verify it appears live.
3. Switch to **Applicants Pipeline**, filter applicants, review the candidate profile/resume, add **Recruiter Notes**, transition status to **Shortlisted** (`PUT /api/applications/:id/status`), and export the CSV pipeline (**CSV formula-injection neutralized**).

## Segment 7: Admin Functionality & Live Contact Inquiries (5:30 – 6:30)
1. Submit an inquiry on `/contact` (backed by `POST /api/contact` + XSS sanitization).
2. Sign in as Admin (`admin@dginternshub.com`).
3. Explore **Admin Control Center**:
   - **Overview:** Live role distribution (`Users by Role`), `Applications Pipeline`, `Recent Platform Activity`.
   - **Users Tab:** Change roles / inspect user accounts (excluding passwords).
   - **Jobs, Applications & Inquiries Tabs:** Moderate listings, review platform-wide applications (`GET /api/applications/admin`), and transition the support inquiry from `new` -> `in_progress` -> `resolved` (`PATCH /api/contact/:id/status`).

## Segment 8: API & Database Demonstration (6:30 – 7:20)
1. Briefly display `API-DOCUMENTATION.md` / Postman collection (`postman/DG-Interns-Hub-API.json`).
2. Show `/api/health` returning live MongoDB Atlas host & connection state (`GET /api/analytics/public` vs authenticated endpoints).

## Segment 9: Security & Role Access Proof (7:20 – 8:10)
1. Summarize & demonstrate test results (`npm run test:e2e` — `20/20 PASSED`):
   - Unauthenticated / forged JWT rejected with `401`.
   - Wrong-role access & cross-recruiter IDOR blocked with `403`.
   - NoSQL `$ne/$gt`, XSS `<script>`, ReDoS patterns, and non-PDF uploads blocked (`400`/`403`).

## Segment 10: Responsive Mobile Layout & Separate Week 12 Deployment (8:10 – 9:00)
1. Toggle DevTools / mobile viewport to **375px** (`Mobile`) and **768px** (`Tablet`).
2. Open the responsive navigation drawer cleanly and confirm zero horizontal scroll across Hero, Jobs Grid, Forms, and Workspaces.
3. Conclude by showing the **isolated Week 12 deployment configurations** (`render.yaml`, `vercel.json`, `Dockerfile`, `.env.example`) ensuring zero impact on Week 11 production deployments.
