import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/student/Profile";
import Applications from "./pages/student/Applications";
import Bookmarks from "./pages/student/Bookmarks";
import JobDetail from "./pages/JobDetail";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import NewJob from "./pages/recruiter/NewJob";
import JobApplicants from "./pages/recruiter/JobApplicants";
import AdminSidebarLayout from "./components/admin/AdminSidebarLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";

const fullBleedPaths = new Set(["/", "/about", "/contact"]);

function AppContent() {
  const { pathname } = useLocation();
  const fullBleed = fullBleedPaths.has(pathname);

  return (
    <>
      <Navbar />

      <main
        className={
          fullBleed
            ? "mx-auto w-full flex-1 max-w-none px-0 py-0"
            : "mx-auto w-full flex-1 max-w-6xl px-4 py-8"
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            element={<ProtectedRoute allowedRoles={["student", "recruiter", "admin"]} />}
          >
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/bookmarks" element={<Bookmarks />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/jobs/new" element={<NewJob />} />
            <Route
              path="/recruiter/jobs/:id/applicants"
              element={<JobApplicants />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminSidebarLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="jobs" element={<ManageJobs />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppContent />
    </div>
  );
}

export default App;
