# Screenshots Checklist - DG Interns Hub (Week 11 Production Release)

This directory contains visual captures and UI verification records of the **DG Interns Hub** platform across Desktop, Tablet, and Mobile breakpoints.

## 📸 Checklist & Verification Table

| Filename | Description | Route / View | Key Features Highlighted | Status |
|---|---|---|---|:---:|
| `01_homepage_portal.png` | Homepage Portal Overview | `/` | Hero section, dynamic search bar, platform stats counters, category cards | Verified |
| `02_homepage_dark.png` | Homepage (Dark Mode) | `/` | Persistent dark theme, glowing badges, high-contrast typography | Verified |
| `03_jobs_directory_filters.png` | Jobs Directory & Search | `/jobs` | Search input, filter dropdowns (category, location, type, work mode, sort), job cards grid | Verified |
| `04_debounced_search.png` | Real-time Search in Action | `/jobs?search=react` | Instant debounced filtering, active filter chips, matching results | Verified |
| `05_job_details.png` | Detailed Job Page | `/jobs/:id` | Full description, responsibilities, skills tags, stipend highlight, Apply & Bookmark buttons | Verified |
| `06_application_modal_validation.png` | Application Form Validation | Modal on `/jobs/:id` | Full name, email, phone, cover letter, PDF-only resume upload, error validation | Verified |
| `07_login_page.png` | Professional Login Form | `/login` | Form controls, demo credentials quick-fill buttons, redirect state | Verified |
| `08_registration_page.png` | Registration Form | `/register` | Candidate vs Recruiter role toggle tabs, company fields, validation | Verified |
| `09_candidate_dashboard.png` | Candidate Dashboard | `/dashboard` | Welcome banner, real calculated stats cards (Total, Pending, Shortlisted, Selected, Rejected), recent applications table | Verified |
| `10_my_applications_view.png` | Applications Tracking | `/applications` | Filter tabs by status (Pending, Shortlisted, Accepted), application details modal, withdraw action | Verified |
| `11_profile_settings.png` | Candidate Profile & Skills | `/profile` | Account overview, bio, dynamic skill tags manager (add/delete skills), danger zone | Verified |
| `12_responsive_mobile.png` | Mobile View (390px) | `/` & `/jobs` | Responsive mobile drawer menu, stacked hero layout, single-column job cards | Verified |
| `13_api_tests_passed.png` | 42/42 Backend Tests Pass | Terminal | Output of `npm test` verifying all 42+ API and security tests passing | Verified |
| `14_db_persistence_passed.png` | DB Persistence Tests Pass | Terminal | Output of `npm run test:persistence` verifying Atlas DB persistence | Verified |

## 🌟 Key Views & Workflow Demonstrations

1. **Candidate Workflow**: Account registration -> Search & filter internships -> PDF Resume upload -> Application status tracking -> Notification updates.
2. **Recruiter Workflow**: Job posting modal -> Applicant review table -> Application status updates (Shortlisted / Accepted / Rejected) -> CSV Export.
3. **Admin Workflow**: Platform KPIs analytics -> Universal User management (role elevation & deletion) -> Global job moderation.
