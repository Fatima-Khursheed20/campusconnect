# CampusConnect — Project Context (Phase 5+)

Continue development strictly from **Phase 5 onward** without rebuilding earlier phases unless bug fixes are needed.

---

## Project Overview

CampusConnect is a MERN-stack university internship and job portal built for a Web Programming final project.

### Team Members

- Fatima Khursheed (23I-0746)
- Areeba Javed (23I-0570)

### Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **File Uploads:** Multer
- **API Calls:** Axios
- **Routing:** React Router DOM v6
- **Deployment:** Render (backend), Vercel (frontend)

---

## Progress Status — Completed Through Phase 4

### Phase 0 — Project Initialization

- Full MERN folder structure
- Express server setup
- MongoDB connection
- React + Vite frontend
- Tailwind configuration
- Axios + React Router setup
- README + .gitignore

### Phase 1 — Database Models

Mongoose models: User, Job, Application, Bookmark

### Phase 2 — Authentication System

- JWT via httpOnly cookies
- bcrypt password hashing
- Login / Register / Logout
- Forgot password + reset password
- Auth middleware
- Role checking middleware
- AuthContext frontend state
- Login / Register / Forgot / Reset pages

### Phase 3 — Role-Based Access Control

- ProtectedRoute component
- Unauthorized page
- Route protection by role
- Admin dashboard
- User management
- Job management for admin

### Phase 4 — Job Management

- Job CRUD backend APIs
- Job filters + pagination
- Recruiter dashboard
- Job posting/edit forms
- Job listing pages
- Applicant viewing system

---

## Architecture

### Backend (`server/`)

- `config/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `utils/`
- `uploads/`
- `server.js`

### Frontend (`client/src/`)

- `components/`
- `context/`
- `hooks/`
- `pages/`
- `utils/`
- `App.jsx`

---

## Authentication & Security (Existing)

- JWT in **httpOnly cookies** only (not localStorage)
- bcrypt with saltRounds=12
- Role-based authorization
- Protected routes
- Password reset flow
- express-validator validation
- CORS configured
- Axios frontend API integration

---

## Roles

1. **student**
2. **recruiter**
3. **admin**

---

## Existing Feature Summary

### Recruiter

- Create / edit / delete jobs
- Toggle job visibility
- View applicants

### Admin

- Manage users, change roles
- Activate/deactivate users
- Remove jobs
- Dashboard stats

### Public

- Browse jobs, view job details
- Authentication pages

---

## Non-Negotiable Rules

### Authentication

- JWT is **not** stored in localStorage
- JWT is stored **only** in httpOnly cookies

### Backend Validation

- Use express-validator (already in use)

### Frontend Styling

- Tailwind CSS only
- Responsive, mobile-first

### API Style

- RESTful endpoints
- Axios on the frontend

---

## Phase 5 — Student Features (NEXT)

### Student Dashboard

- Welcome section
- Stats cards
- Recent applications

### Student Profile

- Edit profile
- Skills tag input
- Education entries
- Resume upload
- Profile picture upload

### Applications Page

- List student applications
- Status filters
- Color-coded badges

### Bookmarks

- Save jobs
- Remove bookmarks
- View saved jobs

### Backend APIs to Implement / Wire

- `PUT /api/users/profile`
- `POST /api/users/upload-resume`
- `GET /api/users/applications`
- `POST /api/applications/:jobId`
- `GET /api/users/bookmarks`
- `POST /api/bookmarks/:jobId`

### File Upload

- Multer; store resumes under `uploads/resumes/`

---

## Future Phases (After Phase 5)

| Phase | Focus |
|-------|--------|
| 6 | Navbar + Footer + Shared UI |
| 7 | Landing Page + About + Contact + animations |
| 8 | Reusable validation system + custom form hook |
| 9 | Session management + remember me + idle logout |
| 10 | Performance optimization + deployment |
| 11 | Professional README / documentation |

---

## Coding Expectations

- Maintain current MERN architecture
- Keep code modular
- Tailwind for all styling
- Responsive pages
- Follow existing route structure
- Preserve role-based authorization
- Clean, modern UI patterns
- Consistent API naming

---

## Rubric Alignment (Target)

Satisfy all **35** Web Programming final project criteria, including: full authentication, CRUD, role-based systems, responsive UI, security practices, performance, deployment, and professional documentation.
