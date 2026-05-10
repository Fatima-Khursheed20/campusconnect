🧠 CampusConnect — FINAL STABLE DEBUG & DEPLOYMENT CONTEXT
📌 Project Status (FINAL PHASE)

CampusConnect is a fully implemented MERN stack internship/job portal for a university Web Programming final project.

All major features, performance optimizations, and known bugs have been resolved.

We are now in FINAL QA + DEPLOYMENT VALIDATION ONLY phase.

👉 DO NOT suggest new features
👉 DO NOT redesign architecture
👉 ONLY detect remaining bugs or missed edge cases

👥 Team
Fatima Khursheed (23I-0746)
Areeba Javed (23I-0570)
⚙️ Tech Stack
Frontend
React.js (Vite)
Tailwind CSS
React Router DOM v6
Axios
Backend
Node.js
Express.js
MongoDB + Mongoose
Auth System
JWT authentication
bcrypt hashing
httpOnly cookies ONLY
File Upload System
Multer
uploads/profile-pictures/
uploads/resumes/
🚨 STRICT RULES (DO NOT CHANGE)
🔐 Authentication
JWT stored ONLY in httpOnly cookies
NO localStorage auth
Axios uses withCredentials: true
Auth must persist on refresh
🎨 Frontend Rules
Tailwind CSS only
Fully responsive UI required
No UI framework replacement
🌐 API Rules
RESTful API structure
Controller + route separation
No endpoint redesign unless broken
✅ FULLY IMPLEMENTED FEATURES
🔐 Authentication System
Login / Register / Logout
Forgot / Reset Password
Protected Routes
Role-based access control
Remember Me session handling
Idle timeout auto logout
JWT refresh middleware
👤 Roles
student
recruiter
admin
🎓 Student Features
Dashboard (stats + recent applications)
Profile management
Skills + education system
Resume upload
Profile picture upload
Applications tracking
Bookmarks system
🧑‍💼 Recruiter Features
Job CRUD (create/edit/delete)
View applicants
View resumes (PDF open/download)
Cover letter modal
Job management dashboard
🛠 Admin Features
User management
Job management
Role changes
Activation/deactivation
Admin dashboard
🌍 Public Features
Home page (landing page with animations)
Jobs listing with filters
Job details page
About page
Contact form
Navbar + Footer
⚡ PERFORMANCE OPTIMIZATIONS (DONE)
Frontend
React.lazy + Suspense (route splitting)
Image lazy loading
Skeleton loaders
Debounced search (300ms)
React.memo optimization
Backend
compression middleware
helmet security headers
express-rate-limit
MongoDB indexes
.lean() optimization
🔁 SESSION MANAGEMENT (DONE)
Remember Me login
Idle timeout auto logout
JWT refresh middleware
Auth persistence on refresh
📁 PROJECT STRUCTURE
Backend

server/

config/
controllers/
middleware/
models/
routes/
utils/
uploads/
server.js
Frontend

client/src/

components/
hooks/
pages/
context/
utils/
App.jsx
🧪 CURRENT VALIDATION GOAL (IMPORTANT)

You are now ONLY validating system correctness.

Check for:

AUTH FLOW
login/logout stability
token refresh working
protected routes correct
session persistence after refresh
no infinite redirects
API INTEGRITY
all endpoints return correct status codes
no missing routes
no broken axios calls
no inconsistent responses
FILE UPLOADS
profile pictures load correctly
resumes open in new tab or download properly
correct URL generation
no broken paths
RECRUITER FLOW
applicants list works
resume opens correctly
cover letter modal works
no wrong redirects
STUDENT FLOW
dashboard loads correctly
applications list correct
bookmarks working
profile updates persist
FRONTEND STABILITY
no console errors
no broken routes
no UI crashes
no missing components
correct navigation behavior
BACKEND STABILITY
no runtime crashes
no middleware conflicts
no auth bypass issues
no duplicate mongoose indexes causing issues
clean logs
🚨 KNOWN FIXED ISSUES (DO NOT RE-REPORT)

These are already resolved and should NOT be flagged again:

Static upload serving (CORP/CSP fixed)
Idle timer JSX parsing error fixed
Resume/profile picture access fixed
MongoDB connection issue resolved
Axios auth behavior stabilized
🎯 FINAL OBJECTIVE

System must be:

✔ fully stable
✔ deployment-ready
✔ error-free in normal flows
✔ consistent across roles
✔ secure and production-safe

🧠 AI INSTRUCTIONS (CRITICAL)

When debugging:

DO NOT suggest rewrites
DO NOT reintroduce solved issues
ONLY find NEW or MISSED bugs
ALWAYS give minimal safe fix
Focus on runtime + edge cases only
Preserve architecture fully
Prioritize production readiness