# DG Interns Hub (Week 12 Capstone) — Architecture & Entity-Relationship Diagrams

## 1. High-Level Full-Stack System Architecture

The Week 12 platform uses a decoupled **React 19 + Vite 8** SPA frontend communicating over HTTPS/REST JSON with a **Node.js + Express 5** API backend persisted to **MongoDB Atlas**.

```mermaid
flowchart TD
    Browser["Client Browser (Desktop / Tablet / Mobile SPA)"] -->|"HashRouter + Lazy Chunks"| Frontend["React 19 + Vite 8 Frontend (Vercel / Static)"]
    Frontend -->|"Axios JSON + Bearer JWT + Multipart PDF"| Security["Express Security Layer (Helmet, CORS, Rate Limit, Sanitizer)"]
    Security -->|"Route Validation & Auth/RBAC Middleware"| Controllers["REST Controllers (Auth, Jobs, Applications, Users, Notifications, Analytics, Contact)"]
    Controllers -->|"Multer PDF Magic-Byte Check"| Uploads["Disk /uploads/resumes/*.pdf"]
    Controllers -->|"Mongoose v9 Indexed Queries & Aggregations"| DB["MongoDB Atlas (dg_interns_hub)"]
```

---

## 2. Database Entity-Relationship Diagram (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ JOB : "posts (postedBy)"
    USER ||--o{ APPLICATION : "submits (applicant)"
    USER ||--o{ APPLICATION : "reviews (reviewedBy)"
    USER ||--o{ NOTIFICATION : "receives (recipient)"
    USER ||--o{ CONTACTMESSAGE : "moderates (reviewedBy)"
    JOB ||--o{ APPLICATION : "receives (job)"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role
        Boolean isActive
        String phone
        String bio
        Array skills
        String resumeUrl
        String companyName
        String location
        String education
        String headline
        Date lastLogin
    }

    JOB {
        ObjectId _id PK
        String title
        String company
        String location
        String type
        String category
        String workType
        String experienceLevel
        Number stipendAmount
        Number openings
        Number applicantsCount
        String status
        Date deadline
        String slug UK
        ObjectId postedBy FK
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId job FK
        ObjectId applicant FK
        ObjectId reviewedBy FK
        String fullName
        String email
        String phone
        String whyInterested
        String resumeUrl
        String status
        String notes
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        ObjectId sender FK
        String title
        String message
        String type
        String link
        Boolean isRead
    }

    CONTACTMESSAGE {
        ObjectId _id PK
        String name
        String email
        String subject
        String message
        String status
        ObjectId reviewedBy FK
    }
```

---

## 3. Request Security & Authorization Flow

```mermaid
flowchart LR
    Req["Incoming HTTP Request"] --> Cors["Strict Origin CORS Check"]
    Cors -->|"Allowed Origin"| Helmet["Helmet Headers + Rate Limiter + Size Limit"]
    Cors -->|"Disallowed Origin"| Reject403["HTTP 403 CORS Blocked"]
    Helmet --> Sanitize["Global Sanitizer (Strip $ / . Operators & XSS Tags)"]
    Sanitize --> Validate["ObjectId & Schema Validators"]
    Validate --> Auth["JWT Verification & isActive Check"]
    Auth -->|"Invalid / Missing Token"| Reject401["HTTP 401 Unauthorized"]
    Auth -->|"Valid User"| RBAC["Role & Ownership Check (Candidate / Recruiter / Admin)"]
    RBAC -->|"Forbidden Role / IDOR"| Err403["HTTP 403 Forbidden"]
    RBAC -->|"Authorized"| Ctrl["Controller + Indexed Mongoose Query"]
```

