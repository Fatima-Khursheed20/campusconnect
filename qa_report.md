# CampusConnect — Full-Stack QA Report

**Date:** 2026-05-10  
**Phase:** Final QA + Pre-Deployment  
**Scope:** Complete end-to-end audit of all workflows

---

## Issues Found

---

### 🔴 Issue #1 — CRITICAL: `sameSite: "strict"` Blocks Cookies on Cross-Origin Deployment

**Problem:**  
Cookie `sameSite` is hardcoded to `"strict"` in both [authController.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/authController.js#L18) and [sessionCheck.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/middleware/sessionCheck.js#L16). When deploying the frontend (Vercel) and backend (Render) on **different domains**, `sameSite: "strict"` will prevent cookies from being sent on ANY cross-site request. **Login will completely stop working in production.**

**Root Cause:**  
`sameSite: "strict"` rejects cookies on any cross-origin navigation or request. The frontend and backend are on different origins in production (e.g., `campusconnect.vercel.app` vs `campusconnect-api.onrender.com`).

**Exact Minimal Fix:**

Change `sameSite` from `"strict"` to `"none"` in production (which requires `secure: true`), and keep `"lax"` for development.

#### [authController.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/authController.js) — lines 10–21

```diff
 const getCookieOptions = (rememberMe = false) => {
+  const isProduction = process.env.NODE_ENV === "production";
   const maxAge = rememberMe
     ? 7 * 24 * 60 * 60 * 1000
     : 24 * 60 * 60 * 1000;

   return {
     httpOnly: true,
-    secure: process.env.NODE_ENV === "production",
-    sameSite: "strict",
+    secure: isProduction,
+    sameSite: isProduction ? "none" : "lax",
     maxAge,
   };
 };
```

#### [authController.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/authController.js) — lines 97–101 (logout)

```diff
 res.clearCookie("token", {
     httpOnly: true,
-    secure: process.env.NODE_ENV === "production",
-    sameSite: "strict",
+    secure: process.env.NODE_ENV === "production",
+    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
   });
```

#### [sessionCheck.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/middleware/sessionCheck.js) — lines 8–19

```diff
 const getCookieOptions = (rememberMe = false) => {
+    const isProduction = process.env.NODE_ENV === "production";
     const maxAge = rememberMe
       ? 7 * 24 * 60 * 60 * 1000
       : 24 * 60 * 60 * 1000;

     return {
       httpOnly: true,
-      secure: process.env.NODE_ENV === "production",
-      sameSite: "strict",
+      secure: isProduction,
+      sameSite: isProduction ? "none" : "lax",
       maxAge,
     };
   };
```

**Affected Files:**  
- `server/controllers/authController.js`
- `server/middleware/sessionCheck.js`

**Testing Steps:**  
1. Set `NODE_ENV=production` and deploy backend to Render, frontend to Vercel
2. Open the login page and sign in
3. Verify the `Set-Cookie` header has `SameSite=None; Secure`
4. Verify protected routes load (cookie is sent with cross-origin requests)
5. Verify logout clears the cookie correctly

---

### 🔴 Issue #2 — CRITICAL: Missing Edit Job Route in Frontend Router

**Problem:**  
The RecruiterDashboard renders an "Edit" link pointing to `/recruiter/jobs/:id/edit` ([RecruiterDashboard.jsx line 355](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/RecruiterDashboard.jsx#L355)), but **no matching route exists** in [App.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/App.jsx). Clicking "Edit" silently redirects to `/` via the catch-all route.

> [!NOTE]
> The route IS defined in `routes/AppRoutes.jsx` (line 71), but `App.jsx` (which is actually used in `main.jsx`) does NOT include it. `AppRoutes.jsx` appears to be an unused/stale file.

**Root Cause:**  
`App.jsx` is missing the edit route. The `NewJob.jsx` component already supports editing mode (it reads `useParams().id`), so the component is ready — only the route declaration is missing.

**Exact Minimal Fix:**

#### [App.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/App.jsx) — add after line 88

```diff
             <Route path="/recruiter/jobs/new" element={<NewJob />} />
+            <Route path="/recruiter/jobs/:id/edit" element={<NewJob />} />
             <Route path="/recruiter/jobs/:id/applicants" element={<JobApplicants />} />
```

**Affected Files:**  
- `client/src/App.jsx`

**Testing Steps:**  
1. Log in as recruiter
2. Navigate to dashboard
3. Click "Edit" on any job
4. Verify the edit form loads pre-populated with the job data
5. Submit changes and verify they persist

---

### 🟡 Issue #3 — HIGH: `Object.assign(job, req.body)` Allows Mass Assignment

**Problem:**  
In [jobController.js line 131](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/jobController.js#L131), `Object.assign(job, req.body)` copies ALL body fields onto the job document. A malicious recruiter could send `{ "postedBy": "<another_user_id>" }` or `{ "applicants": [] }` to tamper with ownership or clear all applicants.

**Root Cause:**  
No field whitelist on the update operation.

**Exact Minimal Fix:**

#### [jobController.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/jobController.js) — replace line 131

```diff
-    Object.assign(job, req.body);
+    const allowed = ["title", "description", "requirements", "type", "location", "salary", "deadline", "isActive"];
+    allowed.forEach((field) => {
+      if (req.body[field] !== undefined) job[field] = req.body[field];
+    });
```

**Affected Files:**  
- `server/controllers/jobController.js`

**Testing Steps:**  
1. Log in as recruiter, edit a job via the UI — works normally
2. Try a manual API call: `PUT /api/jobs/:id` with `{ "postedBy": "<other_id>" }` — verify it's ignored
3. Verify applicants array is not clearable via `{ "applicants": [] }`

---

### 🟡 Issue #4 — HIGH: `Application.create({ ...req.body })` Allows Field Injection

**Problem:**  
In [applicationController.js line 48–52](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/applicationController.js#L48-L52), using `...req.body` spread means a malicious user can inject `{ "status": "shortlisted" }` to bypass the default `"pending"` status.

**Root Cause:**  
Uncontrolled spread of user-supplied body into `Application.create()`.

**Exact Minimal Fix:**

#### [applicationController.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/controllers/applicationController.js) — replace lines 48–52

```diff
     const application = await Application.create({
       job: jobId,
       applicant: req.user._id,
-      ...req.body,
+      coverLetter: req.body.coverLetter,
+      resumeUrl: req.body.resumeUrl,
     });
```

**Affected Files:**  
- `server/controllers/applicationController.js`

**Testing Steps:**  
1. Apply to a job normally — still works
2. Try sending `{ "status": "shortlisted" }` in the apply request body
3. Verify the created application has status `"pending"` regardless

---

### 🟠 Issue #5 — MEDIUM: Rate Limiter Blocks Uploads and Normal Browsing

**Problem:**  
The global rate limiter in [server.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/server.js#L25-L31) is set to `max: 100` requests per 15 minutes for ALL routes, including static file requests (`/uploads/*`). A student browsing jobs (each page loads images, CSS, JS) can easily exhaust this limit and get locked out.

**Root Cause:**  
Rate limiter is applied globally before static file middleware.

**Exact Minimal Fix:**

#### [server.js](file:///c:/Users/areeb/Documents/GitHub/campusconnect/server/server.js) — swap the order so static files aren't rate-limited

```diff
 app.use(express.json());
 app.use(cookieParser());
 app.use("/uploads", express.static(path.join(__dirname, "uploads")));

-app.use(limiter);
```

And move `app.use(limiter)` to apply only to API routes:

```diff
-app.use(limiter);

 app.use(
   cors({ ... })
 );
 app.use(express.json());
 app.use(cookieParser());
 app.use("/uploads", express.static(path.join(__dirname, "uploads")));

 app.get("/", (req, res) => { ... });
-app.use("/api", apiRoutes);
+app.use("/api", limiter, apiRoutes);
```

**Affected Files:**  
- `server/server.js`

**Testing Steps:**  
1. Browse jobs page with many images — no 429 errors
2. Make 101+ API calls in 15 min — verify rate limit triggers on API routes
3. Verify static files at `/uploads/...` are still served after 100 API calls

---

### 🟠 Issue #6 — MEDIUM: Unhandled Errors in Admin Actions (ManageUsers/ManageJobs)

**Problem:**  
In [ManageUsers.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/admin/ManageUsers.jsx#L57-L70), the `handleToggleStatus`, `handleRoleChange`, and `handleDelete` functions have no `try/catch`. If any API call fails (e.g., toggling an admin's own status, network error), the error is completely swallowed and the user sees no feedback. Same issue in [ManageJobs.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/admin/ManageJobs.jsx#L39-L47).

**Root Cause:**  
Missing error handling on `await api.patch(...)` and `await api.delete(...)` calls.

**Exact Minimal Fix:**

#### [ManageUsers.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/admin/ManageUsers.jsx) — wrap handlers

```diff
   const handleToggleStatus = async (id) => {
+    try {
       await api.patch(`/admin/users/${id}/toggle-status`);
       fetchUsers(searchTerm.trim());
+    } catch (err) {
+      setError(err.response?.data?.message || "Failed to update user status");
+    }
   };

   const handleRoleChange = async (id, role) => {
+    try {
       await api.patch(`/admin/users/${id}/role`, { role });
       fetchUsers(searchTerm.trim());
+    } catch (err) {
+      setError(err.response?.data?.message || "Failed to update user role");
+    }
   };

   const handleDelete = async (id) => {
+    try {
       await api.delete(`/admin/users/${id}`);
       fetchUsers(searchTerm.trim());
+    } catch (err) {
+      setError(err.response?.data?.message || "Failed to delete user");
+    }
   };
```

#### [ManageJobs.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/admin/ManageJobs.jsx) — same pattern

```diff
   const toggleJob = async (id) => {
+    try {
       await api.patch(`/admin/jobs/${id}/toggle`);
       fetchJobs();
+    } catch (err) {
+      setError(err.response?.data?.message || "Failed to toggle job status");
+    }
   };

   const deleteJob = async (id) => {
+    try {
       await api.delete(`/admin/jobs/${id}`);
       fetchJobs();
+    } catch (err) {
+      setError(err.response?.data?.message || "Failed to delete job");
+    }
   };
```

**Affected Files:**  
- `client/src/pages/admin/ManageUsers.jsx`
- `client/src/pages/admin/ManageJobs.jsx`

**Testing Steps:**  
1. With no network / wrong token, try toggling a user's status
2. Verify the red error banner appears instead of a silent failure
3. Test same for role change, delete user, toggle job, delete job

---

### 🟢 Issue #7 — LOW: Stale `AppRoutes.jsx` / Unused `LoginPage.jsx` / `AdminDashboard.jsx` (12-line duplicate)

**Problem:**  
Several files exist but are NOT imported or used anywhere:
- [routes/AppRoutes.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/routes/AppRoutes.jsx) — a duplicate router that defines routes differently from `App.jsx` (the one actually used). This can cause confusion and drift.
- [pages/LoginPage.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/LoginPage.jsx) — a 331-byte stub that isn't imported anywhere.
- [pages/AdminDashboard.jsx](file:///c:/Users/areeb/Documents/GitHub/campusconnect/client/src/pages/AdminDashboard.jsx) — a 354-byte stub at the `pages/` root level, distinct from the real one at `pages/admin/AdminDashboard.jsx`.

**Root Cause:**  
Leftover files from earlier development phases.

**Exact Minimal Fix:**  
Delete the following files (or leave them if they don't impact runtime — they won't cause bugs, just bloat the bundle and confuse developers):

```
client/src/routes/AppRoutes.jsx         ← unused, stale route definitions
client/src/pages/LoginPage.jsx          ← unused stub
client/src/pages/AdminDashboard.jsx     ← unused 12-line stub (real one is in pages/admin/)
```

**Affected Files:**  
- `client/src/routes/AppRoutes.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/AdminDashboard.jsx` (root-level stub)

**Testing Steps:**  
1. Delete the files
2. Run `npm run build` in `/client` — verify no import errors
3. All routes still work

---

## Already Production-Ready Areas ✅

| Area | Status | Notes |
|------|--------|-------|
| **Auth flow** (login, register, logout, forgot/reset password) | ✅ Solid | JWT in httpOnly cookies, bcrypt, proper validation |
| **Protected routes + role guards** | ✅ Solid | `ProtectedRoute` with `Outlet`, role-based nav |
| **Student profile editing** | ✅ Solid | Upload + save cycle works cleanly |
| **Resume/profile picture upload pipeline** | ✅ Solid | Multer + sanitized filenames + proper mime filtering |
| **`resolveUploadUrl` utility** | ✅ Solid | Correct base URL stripping, used consistently |
| **Bookmark toggle** | ✅ Solid | Idempotent with 11000 duplicate handling |
| **Admin dashboard + stats** | ✅ Solid | Proper aggregations with error states |
| **Job CRUD (create, read, delete, toggle)** | ✅ Solid | Ownership checks in place |
| **Application workflow** | ✅ Solid | Duplicate-apply prevention, status updates |
| **Idle timeout + auto-logout** | ✅ Solid | Correct timer cleanup, countdown UI |
| **Session refresh** | ✅ Solid | `req.cookies.token` updated for downstream middleware (previously fixed) |
| **Helmet CORP** | ✅ Solid | `crossOriginResourcePolicy: "cross-origin"` (previously fixed) |
| **Duplicate Mongoose index** | ✅ Fixed | `userSchema.index({ email: 1 })` removed (previously fixed) |
| **Recruiter resume viewing** | ✅ Fixed | `resolveUploadUrl()` applied (previously fixed) |
| **Contact form** | ✅ Solid | Validation + safe logging |
| **Responsive nav (mobile hamburger)** | ✅ Solid | Complete mobile menu with role-based links |
| **MongoDB indexes** | ✅ Solid | Strategic compound/text indexes on Job, Application, Bookmark |

---

## Safe To Deploy?

> [!WARNING]
> **Not yet.** Issue #1 (sameSite cookie) is a **production login-breaker**. Issue #2 (missing edit route) is a broken recruiter workflow. Both must be fixed before deployment.

After fixing Issues #1 and #2, the application is **deployable** for a university submission. Issues #3–#4 (mass assignment) are security hardening — strongly recommended but won't crash the app. Issues #5–#7 are quality-of-life improvements.

**Priority order for fixes:**
1. 🔴 Issue #1 — sameSite cookie (blocks login in production)
2. 🔴 Issue #2 — Missing edit route (broken recruiter feature)
3. 🟡 Issue #3 — Job mass assignment (security)
4. 🟡 Issue #4 — Application status injection (security)
5. 🟠 Issue #5 — Rate limiter scope (usability)
6. 🟠 Issue #6 — Admin error handling (UX)
7. 🟢 Issue #7 — Dead files (cleanup)

---

## Recommended Final Manual Tests

After applying fixes, run through these workflows:

| # | Test | What to verify |
|---|------|---------------|
| 1 | **Register → Login → Refresh page** | Session persists, no 401 |
| 2 | **Login with Remember Me off → wait 25min → interact** | Idle prompt appears at 25min, auto-logout at 30min |
| 3 | **Student: Upload resume → view in profile → apply to job** | Resume URL resolves correctly in both profile and application |
| 4 | **Student: Upload profile picture → check Navbar avatar** | Image loads in nav (both desktop avatar dropdown and mobile) |
| 5 | **Student: Apply to a job → re-visit same job** | "Application Submitted" shown, Apply button gone |
| 6 | **Student: Bookmark → go to Bookmarks page → Remove** | Toggle works, card disappears |
| 7 | **Recruiter: Create job → Edit job → View applicants** | Full CRUD cycle completes |
| 8 | **Recruiter: Click "View Resume" on applicant** | Opens PDF in new tab at backend URL |
| 9 | **Admin: Toggle user status → change role → delete user** | All actions complete with feedback |
| 10 | **Admin: Toggle job active/inactive → delete job** | UI updates immediately |
| 11 | **Public: Browse /jobs with filters + pagination** | Results filter correctly, page navigation works |
| 12 | **Public: Submit contact form** | Success message shown |
| 13 | **Forgot password → reset password** | Token email flow (or console log in dev) |
| 14 | **Mobile: Full nav menu for each role** | All links present and functional |
| 15 | **Deploy to Render+Vercel → repeat tests 1–3** | Cookie cross-origin fix verified |
