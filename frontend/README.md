# DG Interns Hub - Frontend SPA Architecture (Week 11)

Welcome to the frontend application of **DG Interns Hub**.

## 🏗️ Architecture Overview

The frontend is a modern, responsive Single Page Application (SPA) built with **React 19**, **Vite 8**, and **React Router DOM 7**.

- **Source Code:** `src/`
- **HTML Entry:** `index.html`
- **Vite Configuration:** `vite.config.js`
- **Live Deployment:** [GitHub Pages](https://vishal2006t.github.io/DG-INTERN-HUB-WEEK-11/)

## 📁 Directory Structure

```
src/
├── assets/                # Logos, SVG icons, and hero illustrations
├── components/            # Reusable UI & compound view components
│   ├── AdminDashboardView.jsx       # Admin analytics & user management
│   ├── ApplicationForm.jsx          # Validated PDF resume upload modal
│   ├── AuthModal.jsx                # Login / Registration modal dialog
│   ├── Button.jsx                   # Atomic button with variants & loading state
│   ├── EditJobModal.jsx             # Recruiter job editor
│   ├── ErrorMessage.jsx             # Accessible error banner with retry trigger
│   ├── FilterBar.jsx                # Multi-criteria filter controls
│   ├── Footer.jsx                   # Platform footer
│   ├── InputField.jsx               # Form input with validation states
│   ├── JobCard.jsx                  # Job card with bookmarking & badges
│   ├── Loader.jsx                   # Spinner & skeleton card loaders
│   ├── Modal.jsx                    # Accessible modal dialog
│   ├── Navbar.jsx                   # Navigation bar with dark mode & mobile drawer
│   ├── NotificationDropdown.jsx     # In-app notifications center
│   ├── PostJobModal.jsx             # Recruiter job creation modal
│   ├── RecruiterDashboardView.jsx   # Recruiter job & applicant management
│   ├── SearchBar.jsx                # Debounced search input
│   ├── ThemeToggle.jsx              # Light / Dark mode switcher
│   └── Toast.jsx                    # Floating toast portal
├── context/               # React Context Providers
│   ├── AuthContext.jsx              # JWT auth state & user session
│   ├── NotificationContext.jsx      # In-app notification polling & updates
│   ├── SavedJobsContext.jsx         # Bookmarked jobs in localStorage
│   ├── ThemeContext.jsx             # Theme state (dark / light)
│   └── ToastContext.jsx             # Toast notification dispatcher
├── data/
│   └── jobs.js                      # Curated baseline jobs
├── pages/
│   ├── Home.jsx                     # Landing page with hero & categories
│   ├── Jobs.jsx                     # Job directory with search & pagination
│   ├── JobDetailsPage.jsx           # Detailed job view & application trigger
│   ├── Dashboard.jsx                # Role-aware dashboard dispatcher
│   ├── Applications.jsx             # Candidate application tracking
│   ├── Profile.jsx                  # Candidate profile & skills tags
│   ├── Login.jsx                    # Login page with 1-click demo pills
│   ├── Register.jsx                 # Registration with role toggle
│   ├── Contact.jsx                  # Contact & support page
│   └── NotFound.jsx                 # Custom 404 Not Found page
├── routes/
│   └── ProtectedRoute.jsx           # Authentication & role guard with redirect memory
├── services/
│   └── api.js                       # Centralized Axios client with JWT interceptors
├── styles/
│   └── week9-pages.css              # Page layout styles
├── App.css                          # Complete design system & responsive rules
├── index.css                        # CSS tokens, theme variables & typography
└── main.jsx                         # Application entrypoint
```

## 🚀 Key Features

1. **Role-Based Views**: Tailored dashboards for Candidate, Recruiter, and Admin.
2. **Persistent In-App Notifications**: Real-time status update notifications.
3. **Debounced Search & Filtering**: 350ms debounced text queries across Title, Company, Skills, and Description.
4. **Secure Resume Upload**: Client-side validation enforcing PDF format and 5MB size limit.
5. **Theme Switcher**: Persistent dark/light theme synchronized with local storage.
6. **Code Splitting**: Rollup manual chunks for `react-vendor` and `icons-vendor`.
7. **Mobile Responsiveness**: Adaptive layouts optimized for 390px mobile, 768px tablet, and 1920px desktop.

## 🛠️ Build & Deployment

```bash
# Start development server
npm run dev

# Production build (outputs to dist/ and mirrors to docs/ for GitHub Pages)
npm run build

# Preview production build locally
npm run preview
```
