import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Profile from "./modules/profile/pages/Profile";
import JobsPage from "./modules/jobs/pages/JobsPage";
import JobDetailPage from "./modules/jobs/pages/JobDetailPage";
import BlogList from "./modules/blog/pages/BlogList";
import BlogDetail from "./modules/blog/pages/BlogDetail";
import JobForm from "./modules/jobs/pages/JobForm";
import ManageJobs from "./modules/jobs/pages/ManageJobs";
import AdminDashboard from "./modules/admin/pages/Dashboard";
import UserManagement from "./modules/admin/pages/UserManagement";
import BlogManagement from "./modules/admin/pages/BlogManagement";
import JobManagement from "./modules/admin/pages/JobManagement";
import AdminRoute from "./modules/admin/AdminRoute";
import RecruiterRoute from "./modules/recruiter/RecruiterRoute";
import RecruiterDashboard from "./modules/recruiter/pages/Dashboard";
import RecruiterJobManagement from "./modules/recruiter/pages/JobManagement";
import ApplicationManagement from "./modules/recruiter/pages/ApplicationManagement";
import RecruiterInterviewManagement from "./modules/recruiter/pages/InterviewManagement";
import InterviewerRoute from "./modules/interviewer/InterviewerRoute";
import InterviewerDashboard from "./modules/interviewer/pages/Dashboard";
import QuestionBank from "./modules/interviewer/pages/QuestionBank";
import InterviewManagement from "./modules/interviewer/pages/InterviewManagement";
import MyApplicationsPage from "./modules/candidate/pages/MyApplicationsPage";
import CVBuilderPage from "./modules/cv-builder/pages/CVBuilderPage";
import SavedJobsPage from "./modules/candidate/pages/SavedJobsPage";
import ChallengePage from "./modules/candidate/pages/ChallengePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-applications" element={<MyApplicationsPage />} />
      <Route path="/cv-builder" element={<CVBuilderPage />} />
      <Route path="/saved-jobs" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><SavedJobsPage /></ProtectedRoute>} />
      <Route path="/challenge/:id" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><ChallengePage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/jobs"
        element={
          <AdminRoute>
            <JobManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/blogs"
        element={
          <AdminRoute>
            <BlogManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/recruiter/dashboard"
        element={
          <RecruiterRoute>
            <RecruiterDashboard />
          </RecruiterRoute>
        }
      />
      <Route
        path="/recruiter/jobs"
        element={
          <RecruiterRoute>
            <RecruiterJobManagement />
          </RecruiterRoute>
        }
      />
      <Route
        path="/recruiter/applications"
        element={
          <RecruiterRoute>
            <ApplicationManagement />
          </RecruiterRoute>
        }
      />
      <Route
        path="/recruiter/interviews"
        element={
          <RecruiterRoute>
            <RecruiterInterviewManagement />
          </RecruiterRoute>
        }
      />

      {/* Interviewer Routes */}
      <Route
        path="/interviewer/dashboard"
        element={
          <InterviewerRoute>
            <InterviewerDashboard />
          </InterviewerRoute>
        }
      />
      <Route
        path="/interviewer/questions"
        element={
          <InterviewerRoute>
            <QuestionBank />
          </InterviewerRoute>
        }
      />
      <Route
        path="/interviewer/sessions"
        element={
          <InterviewerRoute>
            <InterviewManagement />
          </InterviewerRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;

