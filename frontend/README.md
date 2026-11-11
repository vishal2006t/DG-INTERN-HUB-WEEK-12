# DG Interns Hub — Frontend SPA Architecture (Week 12 Capstone)

The frontend is a responsive SaaS-grade Single Page Application built with **React 19**, **Vite 8**, **React Router DOM 7 (HashRouter)**, and **Axios**.

- **Entry Points:** `index.html`, `src/main.jsx`, `src/App.jsx`
- **Design System:** CSS variables in `src/index.css`, `src/App.css`, and unified SaaS tokens/workspace rules in `src/styles/saas-redesign.css` (Light + Dark mode via `[data-theme]`)

## 📁 Directory Structure

```
src/
├── components/
│   ├── WorkspaceLayout.jsx            # Persistent SaaS sidebar shell across Candidate/Recruiter/Admin views
│   ├── AdminDashboardView.jsx         # Platform KPIs, Users, Jobs, Applications & Contact Inquiries moderation
│   ├── RecruiterDashboardView.jsx     # Recruiter Hiring Studio, pipeline transitions, notes & CSV export
│   ├── ApplicationForm.jsx            # Validated application & PDF resume upload modal
│   ├── ConfirmDialog.jsx              # Accessible confirmation dialog replacing native alerts
│   ├── PostJobModal.jsx / EditJobModal.jsx
│   ├── JobCard.jsx                    # Memoized listing card with horizontal badges & bookmark toggle
│   ├── Navbar.jsx / Footer.jsx        # Responsive navbar with mobile drawer, theme switcher & notifications
│   ├── NotificationDropdown.jsx       # Real-time navbar bell center
│   ├── Loader.jsx                     # Accessible skeleton & spinner loaders (aria-busy="true")
│   └── Toast.jsx / Modal.jsx / InputField.jsx / SearchBar.jsx / FilterBar.jsx / ThemeToggle.jsx
├── context/
│   ├── contextObjects.js              # Decoupled React Context instances (zero circular / fast-refresh warnings)
│   ├── AuthContext.jsx                # JWT auth session, login, register & profile sync
│   ├── NotificationContext.jsx        # Notification polling & read/delete updates
│   ├── SavedJobsContext.jsx           # Saved jobs bookmarks persistence
│   ├── ThemeContext.jsx               # Light/Dark mode theme persistence (dg_theme)
│   └── ToastContext.jsx               # Global toast queue
├── hooks/
│   └── useContexts.js                 # Typed context consumer hooks
├── pages/
│   ├── Home.jsx                       # Hero, live public KPI stats, spotlight card, categories
│   ├── Jobs.jsx                       # Debounced search, live facets/experience filters, pagination
│   ├── JobDetailsPage.jsx             # Full role details, skills tags & apply workflow
│   ├── Dashboard.jsx                  # Role-aware workspace dispatcher
│   ├── Applications.jsx               # Candidate applications pipeline & status filters
│   ├── SavedJobs.jsx                  # Week 12 bookmarked roles management page
│   ├── Notifications.jsx              # Week 12 full notifications management view
│   ├── Profile.jsx                    # Profile, education, headline, skills & PDF resume management
│   ├── Settings.jsx                   # Week 12 notification preference & account settings
│   ├── Login.jsx / Register.jsx / Contact.jsx / NotFound.jsx
├── routes/ProtectedRoute.jsx
└── services/api.js                    # Centralized Axios instance with Bearer JWT interceptor
```

## ⚡ Week 12 Performance & Code Quality

- **Code Splitting (`React.lazy` + `Suspense`)**: Every major route renders on demand as a separate Vite chunk alongside `react-vendor` and `icons-vendor`.
- **Render Optimization (`React.memo`, `useMemo`, `useCallback`)**: Memoized `JobCard` items, derived dashboard filter slices, and stable callbacks.
- **Debounced Search (`350ms`) & API Pagination**: Minimizes Atlas queries during live typing on `/jobs`.
- **Zero-Warning Linting**: `npm run lint` (`oxlint`, 104 rules across 88 files) passes with `0 warnings, 0 errors`.

## 🛠️ Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run lint     # Run oxlint across src/
npm run build    # Production bundle in dist/ (+ 404.html)
npm run preview  # Preview dist/ locally
```
