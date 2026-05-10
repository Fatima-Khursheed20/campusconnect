import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminSidebarLayout from "../components/admin/AdminSidebarLayout";

// Eagerly load core components
import HomePage from "../pages/HomePage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";
import PageLoader from "../components/layout/PageLoader";

// Lazy load other page components
const JobsPage = React.lazy(() => import("../pages/JobsPage"));
const JobDetail = React.lazy(() => import("../pages/JobDetail"));
const ForgotPassword = React.lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("../pages/ResetPassword"));
const About = React.lazy(() => import("../pages/About"));
const Contact = React.lazy(() => import("../pages/Contact"));
const PrivacyPage = React.lazy(() => import("../pages/PrivacyPage"));
const TermsPage = React.lazy(() => import("../pages/TermsPage"));

// Student pages
const StudentDashboard = React.lazy(() => import("../pages/student/StudentDashboard"));
const Profile = React.lazy(() => import("../pages/student/Profile"));
const Applications = React.lazy(() => import("../pages/student/Applications"));
const Bookmarks = React.lazy(() => import("../pages/student/Bookmarks"));

// Recruiter pages
const RecruiterDashboard = React.lazy(() => import("../pages/recruiter/RecruiterDashboard"));
const RecruiterJobs = React.lazy(() => import("../pages/recruiter/RecruiterJobs"));
const NewJob = React.lazy(() => import("../pages/recruiter/NewJob"));
const JobApplicants = React.lazy(() => import("../pages/recruiter/JobApplicants"));

// Admin pages
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const ManageUsers = React.lazy(() => import("../pages/admin/ManageUsers"));
const ManageJobs = React.lazy(() => import("../pages/admin/ManageJobs"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/student/bookmarks" element={<Bookmarks />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/jobs/new" element={<NewJob />} />
          <Route path="/recruiter/jobs/:id/edit" element={<NewJob />} />
          <Route path="/recruiter/jobs/:id/applicants" element={<JobApplicants />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/jobs" element={<ManageJobs />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
