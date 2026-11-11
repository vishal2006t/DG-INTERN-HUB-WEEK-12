# DG Interns Hub — Week 12 Final Full-Stack Capstone Application

**GitHub Repository:** [DG-INTERN-HUB-WEEK-12](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-12)

![React](https://img.shields.io/badge/React-19.x-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)
![Express](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)
![Tests](https://img.shields.io/badge/Week12_E2E-20%2F20_Passed-success.svg)
![Lint](https://img.shields.io/badge/Oxlint-0_Warnings-success.svg)

## Project Overview

**DG Interns Hub — Week 12** is a full-stack job and internship recruitment platform developed as a final capstone upgrade of the Week 11 MERN application.

The platform introduces a modern SaaS interface with Light and Dark themes, role-based workspaces, secure authentication, real-time database integration, advanced job discovery, application management, and administrative controls.

The application supports three primary roles:

- **Candidate:** Explore jobs, apply for internships, manage applications, save jobs, and update profiles.
- **Recruiter:** Publish job listings, manage applicants, review resumes, and track recruitment activity.
- **Admin:** Manage users, moderate listings, monitor platform analytics, and handle support inquiries.

> **Week 11 Preservation:** Week 12 is maintained as a separate project with independent GitHub and deployment configurations. The original Week 11 project and its deployments remain untouched.

---

## 1. Key Features

### Candidate Workspace

- Browse and search job and internship listings.
- Filter by location, work mode, job type, and experience.
- Sort and paginate job results.
- View detailed job descriptions.
- Save and bookmark jobs.
- Apply with PDF resume uploads.
- Track application status.
- Withdraw applications.
- Manage profile and notification preferences.
- Access a personalized dashboard.

### Recruiter Workspace

- Recruiter dashboard with live statistics.
- Create, edit, and manage job listings.
- Review candidate applications.
- View resumes and cover statements.
- Maintain internal applicant review notes.
- Update application statuses.
- Export applicant information as CSV.

### Admin Workspace

- Monitor platform analytics.
- Manage users and roles.
- Moderate job listings.
- Oversee global applications.
- Manage support inquiries.
- Review platform activity.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, React Router DOM 7 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Authentication | JWT, bcryptjs |
| API | REST API, Axios |
| Security | Helmet, CORS, Express Rate Limit |
| File Upload | Multer, PDF validation |
| UI | Responsive CSS, Lucide React |
| Testing | Custom E2E suite, Chrome browser audit |
| Deployment | Render, Vercel, Docker |

---

## 3. Security Implementation

The application includes:

- Password hashing using bcryptjs.
- JWT-based authentication.
- Protected API routes.
- Role-based access control.
- Input validation and sanitization.
- NoSQL injection protection.
- XSS sanitization.
- IDOR ownership checks.
- PDF magic-byte validation.
- File upload size restrictions.
- CORS origin restrictions.
- Helmet security headers.
- API rate limiting.
- Environment-based secret management.
- Production fail-closed JWT configuration.

Sensitive environment variables are excluded from version control.

---

## 4. Application Architecture

The application follows a modular full-stack architecture:

```text
DG-INTERN-HUB-WEEK-12/
│
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── styles/
│   └── App.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── docs/
├── postman/
├── screenshots/
│
├── public/
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── vercel.json
├── package.json
└── README.md
```

---

## 5. Installation and Local Setup

### Prerequisites

- Node.js 20 or higher
- npm
- MongoDB Atlas account or local MongoDB

### Clone Repository

```bash
git clone https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-12.git

cd DG-INTERN-HUB-WEEK-12
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create your local `.env` file using `.env.example`.

```bash
copy .env.example .env
```

Configure the required environment variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
```

Use your own valid credentials. Never commit `.env` or expose production secrets.

### Start Backend

```bash
npm run server
```

### Start Frontend

Open another terminal:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

---

## 6. Testing and Quality Verification

The following checks were reported during final project validation.

| Verification | Reported Result |
|---|---|
| Oxlint | 0 errors, 0 warnings |
| Production Build | Passed |
| Week 12 Backend E2E | 20/20 passed |
| Week 11 Baseline API | 42+ assertions passed |
| Chrome UI Audit | 26 checks passed |
| Browser Console Errors | 0 |
| HTTP 500+ Responses | 0 |
| Responsive Overflow | No overflow reported |
| Test Database Cleanup | Verified |

### Run Verification Commands

```bash
npm run lint
npm run build
npm run test:e2e
npm test
```

---

## 7. Responsive Design

The application was tested at the following viewport widths:

- Desktop: 1920px
- Desktop: 1440px
- Tablet: 768px
- Mobile: 375px

Additional UI checks covered:

- Light and Dark themes.
- Mobile navigation drawer.
- Job search and filtering.
- Candidate dashboard.
- Recruiter dashboard.
- Admin dashboard.
- Job details and contact pages.

---

## 8. Deployment Configuration

Week 12 includes separate deployment configurations.

### Backend — Render

Configuration: `render.yaml`

Suggested service name:

`dg-intern-hub-week-12-api`

Health check:

`/api/health`

Configure the production environment variables in Render.

### Frontend — Vercel

Configuration: `vercel.json`

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Configure:

```env
VITE_API_BASE_URL=https://your-week-12-backend-url/api
```

Deploy as a separate Vercel project. Do not reuse the Week 11 deployment.

---

## 9. Documentation and Deliverables

| Deliverable | Location |
|---|---|
| API Documentation | `API-DOCUMENTATION.md` |
| Database Documentation | `docs/DATABASE_DOCUMENTATION.md` |
| Architecture and ER Diagrams | `docs/ARCHITECTURE_AND_ER.md` |
| Test Cases | `docs/TEST_CASES_WEEK_12.md` |
| Demo Script | `docs/DEMO_SCRIPT.md` |
| Postman Collection | `postman/DG-Interns-Hub-API.json` |
| Screenshots | `screenshots/` |
| Final Project Report | `docs/DG_Interns_Hub_Week12_Final_Report.pdf` |
| Report Source | `docs/DG_Interns_Hub_Week12_Final_Report.md` |
| Final Presentation | `docs/DG_Interns_Hub_Week12_Presentation.pptx` |

---

## 10. Project Goals

The main objectives of this capstone project are:

1. Build a complete full-stack recruitment platform.
2. Implement secure authentication and authorization.
3. Develop role-based dashboards.
4. Create scalable REST APIs.
5. Integrate MongoDB Atlas.
6. Improve application performance and usability.
7. Implement responsive UI design.
8. Perform security and functional testing.
9. Prepare professional technical documentation.
10. Maintain independent Week 12 project version control and deployment.

---

## Author

**Vishal T**

Computer Science and Engineering Student

GitHub: [@vishal2006t](https://github.com/vishal2006t)

Project Repository: [DG-INTERN-HUB-WEEK-12](https://github.com/vishal2006t/DG-INTERN-HUB-WEEK-12)

---

*DG Interns Hub — Week 12 Final Full-Stack Capstone Project.*