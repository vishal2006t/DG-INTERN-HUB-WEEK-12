# Screenshots & Responsive UI Verification — DG Interns Hub (Week 12 Capstone)

This directory contains verified **Google Chrome Headless CDP** screenshots captured directly from the live production `dist/` SPA connected to the local Express API + **MongoDB Atlas (`dg_interns_hub`)**. Zero mocked statistics were used.

## 📸 Screenshot Index

| File | Route / Context | Viewport & Theme | Key Verified Highlights |
| :--- | :--- | :--- | :--- |
| `01-home-light-1440.png` | Homepage (`/#/`) | `1440x900` Light | SaaS hero redesign, live DB counters (`16`, `7`, `38`, `13`), featured spotlight card |
| `02-home-dark-1440.png` | Homepage (`/#/`) | `1440x900` Dark | Theme toggle persistence (`data-theme="dark"`), slate palette contrast |
| `03-home-mobile-375.png` | Homepage + Drawer (`/#/`) | `375x812` Mobile | Responsive mobile drawer open cleanly, zero horizontal overflow |
| `04-jobs-directory-1440.png` | Jobs Directory (`/#/jobs`) | `1440x900` Light | Debounced search, dynamic facet filters, aligned horizontal pill badges |
| `05-job-details-1440.png` | Job Details (`/#/jobs/:id`) | `1440x900` Light | Breadcrumb navigation, stipend card, skill tags, Apply & Bookmark actions |
| `06-candidate-dashboard-1440.png` | Candidate Workspace (`/#/dashboard`) | `1440x900` Light | Persistent SaaS sidebar, live KPI cards, readiness meter, recent applications |
| `07-recruiter-dashboard-1440.png` | Recruiter Hiring Studio (`/#/dashboard`) | `1440x900` Light | Company internship table, live applicant counts, Export CSV, Post Internship CTA |
| `08-admin-dashboard-1440.png` | Admin Control Center (`/#/dashboard`) | `1440x900` Light | Platform KPI cards, Overview / Users / Jobs / Applications / Inquiries tabs |
| `09-contact-1440.png` | Contact & Support (`/#/contact`) | `1440x900` Light | Aligned hero header, channel cards, XSS-sanitized inquiry form backed by MongoDB |
| `10-candidate-dashboard-dark-1440.png` | Candidate Workspace Dark (`/#/dashboard`) | `1440x900` Dark | Workspace sidebar + cards + recent applications in verified Dark Mode |

## Verified Responsive Matrix
All checked routes across `1920px`, `1440px`, `768px`, and `375px` recorded `scrollWidth <= innerWidth` (`overflow=false`), **0 console errors**, **0 page errors**, and **0 HTTP >= 500 responses**.
