# DG Interns Hub - REST API Documentation (Week 11 Release)

Welcome to the official REST API documentation for the **DG Interns Hub Backend Application** (Week 11 Production Release). This production-grade API powers user authentication, role-based workflows, internship listing exploration, search, filtering, pagination, sorting, persistent in-app notifications, platform analytics, CSV data export, and end-to-end application tracking.

---

## 📋 Overview & Architecture

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JSON Web Token (JWT) transmitted via HTTP header:  
  `Authorization: Bearer <your_jwt_token>`
- **Response Format**: Strict JSON format with consistent envelope:
  ```json
  // Success
  {
    "success": true,
    "message": "Operation successful description",
    "data": { ... }
  }

  // Error
  {
    "success": false,
    "message": "Specific error description"
  }
  ```
- **Security & Protection**:
  - Helmet security headers
  - Global IP Rate Limiting (300 requests / 15 mins) & Auth Limiting (50 requests / 15 mins)
  - CORS origin controls
  - Request body payload limiting (`15kb`)
  - NoSQL query sanitization
  - Role-based authorization (`candidate`, `recruiter`, `admin`)
  - Strict Public Registration Policy (clients cannot self-assign `admin`)
  - Bcrypt password hashing (10 salt rounds)

---

## 📑 Table of Endpoints

1. [Authentication Endpoints](#1-authentication-endpoints)
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - `POST /api/auth/logout`
2. [User Endpoints](#2-user-endpoints)
   - `GET /api/users/profile`
   - `PUT /api/users/profile`
   - `DELETE /api/users/profile`
   - `GET /api/users` *(Admin)*
   - `PUT /api/users/:id/role` *(Admin)*
   - `DELETE /api/users/:id` *(Admin)*
3. [Job & Internship Endpoints](#3-job--internship-endpoints)
   - `GET /api/jobs` (Search, Filters, Pagination, Sorting)
   - `GET /api/jobs/:id`
   - `POST /api/jobs` *(Recruiter/Admin)*
   - `PUT /api/jobs/:id` *(Job Owner/Admin)*
   - `DELETE /api/jobs/:id` *(Job Owner/Admin)*
4. [Application Endpoints](#4-application-endpoints)
   - `POST /api/applications` *(Candidate)*
   - `GET /api/applications/my` *(Candidate)*
   - `GET /api/applications/recruiter` *(Recruiter)*
   - `GET /api/applications/export/csv` *(Recruiter/Admin)*
   - `GET /api/applications/:id`
   - `PUT /api/applications/:id/status` *(Job Owner/Admin)*
   - `DELETE /api/applications/:id` *(Applicant/Job Owner/Admin)*
5. [Persistent Notifications Endpoints](#5-persistent-notifications-endpoints)
   - `GET /api/notifications`
   - `PUT /api/notifications/:id/read`
   - `PUT /api/notifications/read-all`
6. [Analytics & Insights Endpoints](#6-analytics--insights-endpoints)
   - `GET /api/analytics/admin` *(Admin)*
   - `GET /api/analytics/recruiter` *(Recruiter)*
7. [System Health Check](#7-system-health-check)
   - `GET /api/health`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Endpoint**: `/api/auth/register`
- **Method**: `POST`
- **Purpose**: Creates a new user account with hashed password and generates an initial JWT.
- **Authentication**: None (Public)
- **Required Role**: None (can specify role: `candidate` or `recruiter`, defaults to `candidate`)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "Password123!",
    "role": "candidate",
    "phone": "+91 98765 43210"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane.doe@example.com","password":"Password123!","role":"candidate"}'
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "createdAt": "2026-10-08T10:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (409 Conflict / 400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "An account with this email address already exists"
  }
  ```

---

### 1.2 User Login
- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Purpose**: Authenticates user credentials and issues a JWT token.
- **Authentication**: None (Public)
- **Required Role**: None
- **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "Password123!"
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"jane.doe@example.com","password":"Password123!"}'
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### 1.3 Get Current User (Me)
- **Endpoint**: `/api/auth/me`
- **Method**: `GET`
- **Purpose**: Retrieves currently authenticated user session details from token.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Any authenticated user
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer <your_jwt_token>"
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Current user retrieved successfully",
    "data": {
      "user": {
        "_id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "skills": ["React", "JavaScript"]
      }
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Authentication required"
  }
  ```

---

### 1.4 Logout
- **Endpoint**: `/api/auth/logout`
- **Method**: `POST`
- **Purpose**: Logs out the client session.
- **Authentication**: Optional
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. User Endpoints

### 2.1 Get User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `GET`
- **Purpose**: Retrieves the detailed profile of the authenticated user.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile fetched successfully",
    "data": {
      "user": {
        "_id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "bio": "Enthusiastic CS student",
        "skills": ["React", "CSS", "Node.js"]
      }
    }
  }
  ```

### 2.2 Update User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `PUT`
- **Purpose**: Modifies user profile fields (bio, skills, phone, companyName, password).
- **Authentication**: Required (`Bearer <token>`)
- **Request Body**:
  ```json
  {
    "bio": "Full stack enthusiast with focus on React and Node.js",
    "skills": ["React", "Node.js", "MongoDB", "Express"],
    "phone": "+91 99999 88888"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": "67a4561234bc5678ef901234",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "candidate",
        "phone": "+91 99999 88888",
        "bio": "Full stack enthusiast with focus on React and Node.js",
        "skills": ["React", "Node.js", "MongoDB", "Express"]
      }
    }
  }
  ```


### 2.3 Delete User Profile
- **Endpoint**: `/api/users/profile`
- **Method**: `DELETE`
- **Purpose**: Deletes the user account and associated applications.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile and related records deleted successfully"
  }
  ```

---

### 2.4 List All Users (Admin Directory)
- **Endpoint**: `/api/users`
- **Method**: `GET`
- **Purpose**: Search, filter by role, and paginate users across the platform.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `admin`
- **Query Parameters**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `role` | String | Filter users by role (`candidate`, `recruiter`, `admin`) |
  | `search` | String | Substring match on `name` or `email` |
  | `page` | Number | Page number (default: `1`) |
  | `limit` | Number | Users per page (default: `10`) |
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "_id": "67a4561234bc5678ef901234",
          "name": "Alex Recruiter",
          "email": "alex@company.com",
          "role": "recruiter",
          "createdAt": "2026-10-01T00:00:00.000Z"
        }
      ],
      "pagination": { "totalUsers": 25, "page": 1, "limit": 10, "totalPages": 3 }
    }
  }
  ```

---

### 2.5 Update User Role (Admin)
- **Endpoint**: `/api/users/:id/role`
- **Method**: `PUT`
- **Purpose**: Changes a user's role. Protects against demoting the sole administrator.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `admin`
- **Request Body**:
  ```json
  {
    "role": "recruiter"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User role updated to recruiter successfully",
    "data": { "user": { "_id": "...", "name": "...", "role": "recruiter" } }
  }
  ```

---

### 2.6 Delete User (Admin)
- **Endpoint**: `/api/users/:id`
- **Method**: `DELETE`
- **Purpose**: Administratively removes a user. Protects against self-deletion.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User account removed successfully"
  }
  ```

---

## 3. Job & Internship Endpoints

### 3.1 Get All Jobs (Search, Filter, Pagination, Sorting)
- **Endpoint**: `/api/jobs`
- **Method**: `GET`
- **Purpose**: Returns paginated list of job and internship listings matching query parameters.
- **Authentication**: Public
- **Query Parameters**:
  | Parameter | Type | Description | Example |
  | :--- | :--- | :--- | :--- |
  | `search` | String | Keyword query matched across title, company, skills, location, description | `?search=react` |
  | `type` | String | Employment type (`internship`, `full-time`, `part-time`) | `?type=internship` |
  | `location` | String | Location substring filter | `?location=remote` |
  | `skill` | String | Specific required technology/skill | `?skill=javascript` |
  | `category` | String | Category category filter (e.g. `Web Development`, `Python & AI`) | `?category=Web%20Development` |
  | `workType` | String | Mode of work (`Remote`, `Hybrid`, `On-site`) | `?workType=Remote` |
  | `sort` | String | Sorting criteria: `newest` (default), `oldest`, `deadline`, `stipend-high` | `?sort=newest` |
  | `page` | Number | Page number (default: `1`) | `?page=1` |
  | `limit` | Number | Items per page (default: `10`, max safe limit: `100`) | `?limit=10` |

- **Combined Query Example**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs?type=internship&location=remote&skill=react&page=1&limit=10&sort=newest"
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1,
    "data": [
      {
        "_id": "67a4561234bc5678ef909999",
        "title": "Web Development Intern",
        "company": "Nexora Cloud Solutions",
        "location": "Remote (India)",
        "workType": "Remote",
        "type": "internship",
        "category": "Web Development",
        "duration": "3 Months",
        "stipend": "₹18,000 / month",
        "stipendAmount": 18000,
        "skills": ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Git", "REST APIs"],
        "description": "Build modern, accessible web interfaces...",
        "openings": 3,
        "applicantsCount": 64,
        "featured": true,
        "slug": "web-development-intern",
        "createdAt": "2026-10-08T09:00:00.000Z"
      }
    ]
  }
  ```

---

### 3.2 Get Single Job By ID or Slug
- **Endpoint**: `/api/jobs/:id`
- **Method**: `GET`
- **Purpose**: Retrieves comprehensive specifications for a job by MongoDB ObjectId or custom slug (e.g. `web-development-intern`).
- **Authentication**: Public
- **Example Request**:
  ```bash
  curl -X GET http://localhost:5000/api/jobs/web-development-intern
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job fetched successfully",
    "data": {
      "_id": "67a4561234bc5678ef909999",
      "title": "Web Development Intern",
      "company": "Nexora Cloud Solutions",
      "location": "Remote (India)",
      "workType": "Remote",
      "category": "Web Development",
      "stipend": "₹18,000 / month",
      "skills": ["HTML5", "CSS3", "JavaScript", "Git"],
      "responsibilities": [...],
      "requirements": [...],
      "learning": [...],
      "benefits": [...]
    }
  }
  ```
- **Error Response (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Job not found"
  }
  ```

---

### 3.3 Create New Job
- **Endpoint**: `/api/jobs`
- **Method**: `POST`
- **Purpose**: Creates a new job posting.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `recruiter` or `admin`
- **Request Body**:
  ```json
  {
    "title": "Backend Node.js Intern",
    "company": "Nexora Cloud Solutions",
    "location": "Remote",
    "workType": "Remote",
    "type": "internship",
    "category": "Full Stack Development",
    "duration": "3 Months",
    "stipend": "₹20,000 / month",
    "stipendAmount": 20000,
    "skills": ["Node.js", "Express", "MongoDB", "REST APIs"],
    "description": "Design and build scalable RESTful microservices...",
    "openings": 2,
    "featured": true
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": {
      "_id": "67a4561234bc5678ef908888",
      "title": "Backend Node.js Intern",
      "company": "Nexora Cloud Solutions",
      "postedBy": "67a4561234bc5678ef901234",
      "status": "open"
    }
  }
  ```
- **Error Response (403 Forbidden)**:
  ```json
  {
    "success": false,
    "message": "Access denied: role 'candidate' is not authorized to access this resource"
  }
  ```

---

### 3.4 Update Job
- **Endpoint**: `/api/jobs/:id`
- **Method**: `PUT`
- **Purpose**: Updates an existing job posting.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Request Body**:
  ```json
  {
    "openings": 5,
    "stipend": "₹22,000 / month"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job updated successfully",
    "data": { ... }
  }
  ```

---

### 3.5 Delete Job
- **Endpoint**: `/api/jobs/:id`
- **Method**: `DELETE`
- **Purpose**: Deletes a job posting and its related applications.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```

---

## 4. Application Endpoints

### 4.1 Apply for a Job
- **Endpoint**: `/api/applications`
- **Method**: `POST`
- **Purpose**: Submits an application for a specific job/internship. Automatically prevents duplicate applications by the same user for the same job.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `candidate` or `admin`
- **Request Body**:
  ```json
  {
    "jobId": "67a4561234bc5678ef909999",
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+91 98765 43210",
    "whyInterested": "I have solid foundation in React and want to learn enterprise workflows.",
    "resumeFileName": "Jane_Doe_Resume.pdf"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Application submitted successfully",
    "data": {
      "_id": "67a4561234bc5678ef907777",
      "job": {
        "title": "Web Development Intern",
        "company": "Nexora Cloud Solutions"
      },
      "status": "pending",
      "fullName": "Jane Doe",
      "createdAt": "2026-10-08T10:15:00.000Z"
    }
  }
  ```
- **Error Response (409 Conflict - Duplicate)**:
  ```json
  {
    "success": false,
    "message": "You have already submitted an application for this position"
  }
  ```

---

### 4.2 Get My Applications
- **Endpoint**: `/api/applications/my`
- **Method**: `GET`
- **Purpose**: Retrieves all applications submitted by the logged-in candidate with populated job info.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Applications retrieved successfully",
    "data": [
      {
        "_id": "67a4561234bc5678ef907777",
        "job": {
          "title": "Web Development Intern",
          "company": "Nexora Cloud Solutions",
          "location": "Remote",
          "stipend": "₹18,000 / month"
        },
        "status": "pending",
        "createdAt": "2026-10-08T10:15:00.000Z"
      }
    ]
  }
  ```

---

### 4.3 Get Recruiter Applications
- **Endpoint**: `/api/applications/recruiter`
- **Method**: `GET`
- **Purpose**: Retrieves applications submitted exclusively for jobs posted by the authenticated recruiter.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `recruiter` or `admin`
- **Query Parameters**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `jobId` | String | Filter applications by specific job ID |
  | `status` | String | Filter by status (`pending`, `shortlisted`, `accepted`, `rejected`) |
  | `page` | Number | Pagination page (default: `1`) |
  | `limit` | Number | Items per page (default: `20`) |
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Recruiter applications fetched successfully",
    "data": [
      {
        "_id": "67a4561234bc5678ef908888",
        "job": { "_id": "...", "title": "Frontend React Intern", "company": "TechCorp" },
        "applicant": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "phone": "..." },
        "status": "pending",
        "createdAt": "2026-10-10T12:00:00.000Z"
      }
    ],
    "pagination": { "totalApplications": 12, "page": 1, "limit": 20, "totalPages": 1 }
  }
  ```

---

### 4.4 Export Applications CSV (Advanced Challenge)
- **Endpoint**: `/api/applications/export/csv`
- **Method**: `GET`
- **Purpose**: Streams application records as a sanitized, RFC-compliant CSV file attachment. Recruiters export only their own candidates; Admins export platform-wide applications.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `recruiter` or `admin`
- **Query Parameters**:
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `jobId` | String | Optional filter by specific job |
- **Response Headers**:
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="applications-export-<date>.csv"`

---

### 4.5 Get Application By ID
- **Endpoint**: `/api/applications/:id`
- **Method**: `GET`
- **Purpose**: Returns single application details.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Applicant (`candidate`), Job Poster (`recruiter`), or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application retrieved successfully",
    "data": { ... }
  }
  ```

---

### 4.6 Update Application Status
- **Endpoint**: `/api/applications/:id/status`
- **Method**: `PUT`
- **Purpose**: Updates an applicant's evaluation status. Automatically sends a persistent in-app notification to the candidate.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Job owner (`recruiter`) or `admin`
- **Request Body**:
  ```json
  {
    "status": "shortlisted",
    "notes": "Selected for interview stage 1."
  }
  ```
  *(Valid status values: `pending`, `reviewed`, `shortlisted`, `rejected`, `accepted`)*
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application status updated to shortlisted",
    "data": { ... }
  }
  ```

---

### 4.7 Delete Application
- **Endpoint**: `/api/applications/:id`
- **Method**: `DELETE`
- **Purpose**: Withdraws or deletes an application.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Applicant (`candidate`), Job Poster (`recruiter`), or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Application removed successfully"
  }
  ```

---

## 5. Persistent Notifications Endpoints

### 5.1 Get User Notifications
- **Endpoint**: `/api/notifications`
- **Method**: `GET`
- **Purpose**: Retrieves persistent notifications targeted specifically to the authenticated user, along with unread count.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: Any authenticated user
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Notifications fetched successfully",
    "data": [
      {
        "_id": "67a4561234bc5678ef909999",
        "recipient": "67a4561234bc5678ef901234",
        "title": "Application Update",
        "message": "Your application for Frontend React Intern was updated to shortlisted.",
        "type": "status_update",
        "link": "/dashboard",
        "isRead": false,
        "createdAt": "2026-10-24T12:00:00.000Z"
      }
    ],
    "unreadCount": 1
  }
  ```

---

### 5.2 Mark Notification as Read
- **Endpoint**: `/api/notifications/:id/read`
- **Method**: `PUT`
- **Purpose**: Marks a specific notification as read. Validates recipient ownership.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": { "_id": "...", "isRead": true }
  }
  ```

---

### 5.3 Mark All Notifications as Read
- **Endpoint**: `/api/notifications/read-all`
- **Method**: `PUT`
- **Purpose**: Marks all unread notifications for the authenticated user as read in a single batch operation.
- **Authentication**: Required (`Bearer <token>`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```

---

## 6. Analytics & Insights Endpoints

### 6.1 Get Admin Analytics
- **Endpoint**: `/api/analytics/admin`
- **Method**: `GET`
- **Purpose**: Aggregates platform-wide metrics directly from database collections (total users, candidates, recruiters, jobs, applications, status breakdown, recent signups).
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "counts": {
        "totalUsers": 48,
        "totalCandidates": 34,
        "totalRecruiters": 12,
        "totalAdmins": 2,
        "totalJobs": 18,
        "activeJobs": 16,
        "totalApplications": 75
      },
      "applicationStatusBreakdown": {
        "pending": 30,
        "shortlisted": 15,
        "accepted": 10,
        "rejected": 20
      },
      "recentUsers": [ ... ],
      "recentJobs": [ ... ]
    }
  }
  ```

---

### 6.2 Get Recruiter Analytics
- **Endpoint**: `/api/analytics/recruiter`
- **Method**: `GET`
- **Purpose**: Aggregates recruiter-specific metrics for their own posted listings and incoming candidate applications.
- **Authentication**: Required (`Bearer <token>`)
- **Required Role**: `recruiter` or `admin`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalJobs": 5,
      "activeJobs": 4,
      "totalApplications": 28,
      "statusBreakdown": {
        "pending": 12,
        "shortlisted": 8,
        "accepted": 4,
        "rejected": 4
      }
    }
  }
  ```

---

## 7. System Health Check

### 7.1 Health Check
- **Endpoint**: `/api/health`
- **Method**: `GET`
- **Purpose**: Quick diagnostics to verify backend server status.
- **Authentication**: Public
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "DG Interns Hub Backend API is running smoothly",
    "timestamp": "2026-10-24T10:30:00.000Z",
    "environment": "development"
  }
  ```
