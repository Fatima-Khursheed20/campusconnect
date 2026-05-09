import Navbar from "./components/layout/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentApplications from "./pages/student/StudentApplications";
import StudentBookmarks from "./pages/student/StudentBookmarks";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import NewJob from "./pages/recruiter/NewJob";
import JobApplicants from "./pages/recruiter/JobApplicants";
import AdminSidebarLayout from "./components/admin/AdminSidebarLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageJobs from "./pages/admin/ManageJobs";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/applications" element={<StudentApplications />} />
            <Route path="/student/bookmarks" element={<StudentBookmarks />} />
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
    </div>
  );
}

export default App;
