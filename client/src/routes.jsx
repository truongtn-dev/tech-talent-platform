import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Profile from "./modules/profile/pages/Profile";
import JobsPage from "./modules/jobs/pages/JobsPage";
import JobDetailPage from "./modules/jobs/pages/JobDetailPage";
import JobForm from "./modules/jobs/pages/JobForm";
import ManageJobs from "./modules/jobs/pages/ManageJobs";
import AdminDashboard from "./modules/admin/pages/Dashboard";
import UserManagement from "./modules/admin/pages/UserManagement";
import JobModeration from "./modules/admin/pages/JobModeration";
import BlogManagement from "./modules/admin/pages/BlogManagement";
import AdminRoute from "./modules/admin/AdminRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/create" element={<JobForm />} />
      <Route path="/jobs/edit/:id" element={<JobForm />} />
      <Route path="/jobs/manage" element={<ManageJobs />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />

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
            <JobModeration />
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
    </Routes>
  );
};

export default AppRoutes;

