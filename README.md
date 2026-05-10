# CampusConnect

CampusConnect is a full-stack MERN internship and job portal developed for a university Web Programming final project. The platform connects students with recruiters through a centralized system for job postings, applications, and recruitment management.

---

## Project Overview

CampusConnect provides dedicated workflows for:

- Students searching and applying for internships/jobs
- Recruiters managing job postings and applicants
- Admins managing the platform and monitoring activity

The project follows a MERN architecture with JWT authentication, role-based authorization, secure file uploads, and responsive frontend design.

---

## Team Members

- Fatima Khursheed (23I-0746)
- Areeba Javed (23I-0570)

Course: Web Programming

---

# Tech Stack

## Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication & Security
- JWT Authentication
- HttpOnly Cookies
- bcrypt Password Hashing
- Helmet Security Headers
- Express Rate Limiting
- Express Validator

## File Uploads
- Multer

---

# Main Features

## Authentication System
- User Registration
- User Login
- Logout
- Forgot Password
- Reset Password
- Protected Routes
- Role-Based Access Control
- Session Persistence
- Remember Me Functionality

## Student Features
- Edit Profile
- Upload Resume (PDF)
- Upload Profile Picture
- Browse Jobs
- Search & Filter Jobs
- Apply to Jobs
- Track Application Status
- Bookmark Jobs
- View Saved Jobs

## Recruiter Features
- Create Job Listings
- Edit Job Listings
- Delete Jobs
- Toggle Job Visibility
- View Applicants
- Review Uploaded Resumes
- Update Applicant Status

## Admin Features
- Dashboard Statistics
- Manage Users
- Change User Roles
- Toggle User Status
- Manage Jobs
- Moderate Platform Content

---

# Performance Optimizations

## Frontend
- React.lazy + Suspense
- Lazy Loading
- Skeleton Loaders
- Debounced Search
- React.memo Optimization

## Backend
- Compression Middleware
- Helmet Security Middleware
- Express Rate Limiting
- MongoDB Index Optimization
- Mongoose .lean() Queries

---

# Security Features

- JWT stored in HttpOnly cookies
- Password hashing using bcrypt
- Role-based middleware authorization
- Input validation and sanitization
- Secure file upload validation
- Security headers using Helmet
- Rate limiting against abuse and brute force attacks

---

# Folder Structure

```text
campusconnect/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Installation & Setup

## Prerequisites

Make sure the following are installed:

- Node.js v18+
- MongoDB (Local or Atlas)
- npm

---

## 1. Clone Repository

```bash
git clone https://github.com/Fatima-Khursheed20/campusconnect.git
cd campusconnect
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---

## 4. Configure Environment Variables

### Backend (.env inside server/)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env inside client/)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Run Backend Server

```bash
cd server
npm run dev
```

---

## 6. Run Frontend Client

```bash
cd client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# API Modules

## Authentication
- Register
- Login
- Logout
- Forgot Password
- Reset Password
- Current User Session

## Jobs
- Create Job
- Update Job
- Delete Job
- Fetch Jobs
- Search & Filter Jobs
- Toggle Job Visibility

## Applications
- Apply to Jobs
- View Applicants
- Update Application Status
- View Student Applications

## Bookmarks
- Save Jobs
- Remove Saved Jobs
- Fetch Saved Jobs

## Users
- Update Profile
- Upload Resume
- Upload Profile Picture

## Admin
- Platform Statistics
- User Management
- Job Moderation

---

# Deployment

## Frontend Deployment (Vercel)

1. Import the client project into Vercel
2. Set Build Command:

```bash
npm run build
```

3. Set Output Directory:

```text
dist
```

4. Add environment variable:

```env
VITE_API_URL=your_backend_api_url
```

---

## Backend Deployment (Render)

1. Import server project into Render
2. Build Command:

```bash
npm install
```

3. Start Command:

```bash
npm start
```

4. Configure backend environment variables
5. Configure MongoDB Atlas network access

---

# Testing Checklist

The following workflows were tested:

- User registration and login
- Session persistence
- Role-based route protection
- Resume uploads
- Profile picture uploads
- Student job applications
- Recruiter applicant review workflow
- Admin dashboard management
- Bookmark functionality
- Forgot/reset password flow
- Mobile responsive navigation

---

# Future Improvements

Possible future enhancements:

- Real-time notifications
- Interview scheduling
- Email notifications
- Resume parsing
- Chat system
- Advanced analytics

---

# License

This project is licensed under the MIT License.

---

# Repository

GitHub Repository:

```text
https://github.com/Fatima-Khursheed20/campusconnect
```

