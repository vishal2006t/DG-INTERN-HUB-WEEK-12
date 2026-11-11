# DG Interns Hub (Week 12 Capstone) — Database Documentation

**Database Engine:** MongoDB Atlas (Cloud Cluster `Cluster0`, database `dg_interns_hub`)  
**ODM:** Mongoose v9.x (`server/config/database.js`, `server/models/*.js`)  
**Core Principle:** Zero mock data — all portal counters, search results, dashboards, notifications, and support tickets read and write live MongoDB documents.

---

## 1. Collections Overview

| Collection (Model) | Source File | Purpose | Key Unique / Compound Indexes |
| :--- | :--- | :--- | :--- |
| `users` (`User`) | `server/models/User.js` | Accounts across `candidate`, `recruiter`, `admin` roles, profiles, skills, notification preferences | `{ email: 1 }` (`unique`) |
| `jobs` (`Job`) | `server/models/Job.js` | Internship & job postings, salary/stipend metadata, requirements, experience levels | Text index `(title, company, description, skills)`, `{ slug: 1 }` (`unique`, `sparse`), compound filter/sort indexes |
| `applications` (`Application`) | `server/models/Application.js` | Candidate job applications, PDF resume metadata, recruiter status & review notes | `{ job: 1, applicant: 1 }` (`unique`), `{ status: 1 }`, `{ job: 1 }`, `{ applicant: 1 }` |
| `notifications` (`Notification`) | `server/models/Notification.js` | Persistent in-app alerts triggered by applications and status transitions | `{ recipient: 1, createdAt: -1 }`, `{ isRead: 1 }` |
| `contactmessages` (`ContactMessage`) | `server/models/ContactMessage.js` | Week 12 persistent support & partnership inquiries managed by admins | `{ status: 1, createdAt: -1 }` |

---

## 2. Detailed Schema Definitions

### 2.1 `User` (`server/models/User.js`)

| Field | Type | Constraints / Default | Security & Usage Notes |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required, trim, length 2–60 | Display name across UI |
| `email` | `String` | Required, `unique`, lowercase, trim, regex validated | Login identifier |
| `password` | `String` | Required, min length 6, `select: false` | Hashed via `bcryptjs` (`genSalt(10)`) in `pre('save')` hook; never returned by default |
| `role` | `String` | Enum `['candidate', 'recruiter', 'admin']`, default `'candidate'` | Public registration rejects self-assigned `'admin'` (forced to `403` / validated) |
| `phone` | `String` | Trim, default `''` | Candidate/recruiter contact |
| `bio` | `String` | Trim, default `''` | Profile summary |
| `skills` | `[String]` | Default `[]` | Technical skill tags |
| `resumeUrl` | `String` | Default `''` | Validated PDF path under `/uploads/resumes/` |
| `companyName` | `String` | Trim, default `''` | Recruiter organization name |
| `location` | `String` | Trim, default `''` | City / Region |
| `education` | `String` | Trim, default `''` | Candidate academic background |
| `headline` | `String` | Trim, default `''` | Profile headline |
| `isActive` | `Boolean` | Default `true` | Checked in `authMiddleware.js`; deactivated users receive `403` |
| `lastLogin` | `Date` | Default `null` | Updated on successful `POST /api/auth/login` |
| `notificationPreferences` | `Object` | `{ emailUpdates: true, applicationAlerts: true, jobRecommendations: true }` | Persisted via Settings & Profile endpoints |
| `createdAt`, `updatedAt` | `Date` | Mongoose `timestamps: true` | Audit timestamps |

### 2.2 `Job` (`server/models/Job.js`)

| Field | Type | Constraints / Default |
| :--- | :--- | :--- |
| `title` | `String` | Required, trim, text-indexed |
| `company` | `String` | Required, trim, text-indexed |
| `location` | `String` | Required, trim |
| `type` | `String` | Required, enum `['Internship', 'Full-time', 'Part-time', 'Contract']` (validated case-insensitively on query) |
| `category` | `String` | Required, trim (e.g. `Web Development`, `Python & AI`, `Cloud Engineering`) |
| `workType` | `String` | Required, enum `['Remote', 'Hybrid', 'On-site']` |
| `experienceLevel` | `String` | Enum `['Fresher', '0-1 Years', '1-3 Years', '3+ Years']`, default `'Fresher'` |
| `stipend` / `stipendAmount` | `String` / `Number` | Formatted display stipend & numeric amount for `-stipendAmount` sorting |
| `duration` | `String` | e.g. `'3 Months'`, `'6 Months'` |
| `skills` | `[String]` | Array of skill keywords (text-indexed) |
| `description`, `shortDescription`, `about` | `String` | Detailed role overview (`description` required) |
| `responsibilities`, `requirements`, `whoCanApply`, `learning`, `benefits` | `[String]` | Structured detail sections |
| `openings` | `Number` | Min `1`, default `1` |
| `applicantsCount` | `Number` | Default `0` (incremented/decremented on application submit/withdraw) |
| `featured` | `Boolean` | Default `false` |
| `deadline` | `Date` | Default `Date.now() + 30d` |
| `status` | `String` | Enum `['open', 'closed', 'draft']`, default `'open'` |
| `postedBy` | `ObjectId -> User` | Required reference to owning Recruiter/Admin |
| `slug` | `String` | `unique`, `sparse`, trim |

**Indexes on `jobs`:**
- Full-text index: `{ title: 'text', company: 'text', description: 'text', skills: 'text' }`
- `{ category: 1, workType: 1, createdAt: -1 }`
- `{ type: 1, location: 1 }`
- `{ deadline: 1 }`, `{ stipendAmount: -1 }`
- `{ status: 1, experienceLevel: 1 }`
- `{ status: 1, featured: -1, createdAt: -1 }`
- `{ postedBy: 1, status: 1 }`

### 2.3 `Application` (`server/models/Application.js`)

| Field | Type | Constraints / Default |
| :--- | :--- | :--- |
| `job` | `ObjectId -> Job` | Required, indexed |
| `applicant` | `ObjectId -> User` | Required, indexed |
| `fullName` | `String` | Required, trim |
| `email` | `String` | Required, lowercase, trim |
| `phone` | `String` | Required, trim |
| `whyInterested` | `String` | Required, trim (cover statement) |
| `resumeFileName` | `String` | Default `'resume.pdf'` |
| `resumeUrl` | `String` | Default `''` |
| `status` | `String` | Enum `['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']`, default `'pending'`, indexed |
| `reviewedBy` | `ObjectId -> User` | Set when recruiter/admin transitions status |
| `notes` | `String` | Trim, default `''` (Recruiter internal review notes added in Week 12) |

**Unique Constraint:** `{ job: 1, applicant: 1 }` prevents duplicate applications (enforced with HTTP `409 Conflict`).

### 2.4 `Notification` (`server/models/Notification.js`)

| Field | Type | Constraints / Default |
| :--- | :--- | :--- |
| `recipient` | `ObjectId -> User` | Required, indexed |
| `sender` | `ObjectId -> User` | Nullable reference |
| `title` | `String` | Required, max 150 chars |
| `message` | `String` | Required, max 500 chars |
| `type` | `String` | Enum `['application_received', 'status_updated', 'job_posted', 'system']`, default `'system'` |
| `link` | `String` | Default `'/dashboard'` |
| `isRead` | `Boolean` | Default `false`, indexed |

**Compound Index:** `{ recipient: 1, createdAt: -1 }`.

### 2.5 `ContactMessage` (`server/models/ContactMessage.js`)

Added in Week 12 so the public Contact form persists directly to MongoDB and feeds the Admin Control Center Inquiries tab & KPI card.

| Field | Type | Constraints / Default |
| :--- | :--- | :--- |
| `name` | `String` | Required, trim, max 100 chars |
| `email` | `String` | Required, lowercase, trim, regex validated |
| `subject` | `String` | Required, trim, max 180 chars |
| `message` | `String` | Required, trim, max 2000 chars (XSS-sanitized) |
| `status` | `String` | Enum `['new', 'in_progress', 'resolved']`, default `'new'` |
| `reviewedBy` | `ObjectId -> User` | Nullable admin reviewer reference |

**Compound Index:** `{ status: 1, createdAt: -1 }`.

---

## 3. Relationships & Data Integrity Rules

1. **Recruiter Ownership & Cascading Integrity:** `Job.postedBy -> User._id`. Recruiters may only update/delete their own jobs or inspect applications for jobs they posted (`403` IDOR guard verified in `TC13`). Deleting a job removes associated applications.
2. **One Application per Candidate per Job:** Compound unique index `{ job: 1, applicant: 1 }` guarantees database-level idempotency (`409` on duplicate submit).
3. **Query Optimization (`Promise.all` + Facet Aggregation):**
   - `GET /api/analytics/public` runs four parallel count/distinct queries (`Job.countDocuments`, `User.countDocuments`, `Job.distinct`, `Application.countDocuments`).
   - `GET /api/jobs` executes paginated `.find().select().sort().skip().limit().lean()` concurrently with `.countDocuments()` using indexed filter paths.
   - `GET /api/jobs/filters` aggregates distinct open categories, locations, work modes, and experience levels from live records.
4. **Connection Tuning (`server/config/database.js`):** Configured with `serverSelectionTimeoutMS: 30000` and `socketTimeoutMS: 45000` plus URI password masking in logs.

