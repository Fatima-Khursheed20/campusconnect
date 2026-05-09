import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import JobsPage from "../pages/JobsPage";
import JobDetail from "../pages/JobDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import AdminDashboard from "../pages/AdminDashboard";
import RecruiterDashboard from "../pages/RecruiterDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import JobForm from "../pages/recruiter/JobForm";
import JobApplicants from "../pages/recruiter/JobApplicants";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
      <Route path="/recruiter/jobs/new" element={<JobForm />} />
      <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
      <Route path="/recruiter/jobs/:id/applicants" element={<JobApplicants />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
