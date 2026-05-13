import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';
// Protected & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { AppAlertProvider } from './components/AppAlert';
import DashboardLayout from './layouts/DashboardLayout';
import CompanyDashboardLayout from './layouts/CompanyDashboardLayout';
import SupervisorDashboardLayout from './layouts/SupervisorDashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
// Student Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentOpportunities from './pages/dashboard/StudentOpportunities';
import StudentApplications from './pages/dashboard/StudentApplications';
import StudentLogbook from './pages/dashboard/StudentLogbook';
// Company Pages
import CompanyOverview from './pages/dashboard/CompanyOverview';
import CompanyOpenings from './pages/dashboard/CompanyOpenings';
import CompanyApplicants from './pages/dashboard/CompanyApplicants';
// Supervisor Pages
import SupervisorOverview from './pages/dashboard/SupervisorOverview';
import SupervisorLogbookReviews from './pages/dashboard/SupervisorLogbookReviews';
// Admin Pages
import AdminOverview from './pages/dashboard/AdminOverview';
import AdminStudents from './pages/dashboard/AdminStudents';
import AdminCompanies from './pages/dashboard/AdminCompanies';
import AdminSupervisors from './pages/dashboard/AdminSupervisors';

function App() {
  return (
    <AppAlertProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<RoleBasedRedirect />} />

            {/* Student Dashboard */}
            <Route path="student" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="opportunities" element={<StudentOpportunities />} />
              <Route path="logbook" element={<StudentLogbook />} />
              <Route path="applications" element={<StudentApplications />} />
            </Route>

            {/* Company Dashboard */}
            <Route path="company" element={<CompanyDashboardLayout />}>
              <Route index element={<CompanyOverview />} />
              <Route path="openings" element={<CompanyOpenings />} />
              <Route path="applicants" element={<CompanyApplicants />} />
            </Route>

            {/* Supervisor Dashboard */}
            <Route path="supervisor" element={<SupervisorDashboardLayout />}>
              <Route index element={<SupervisorOverview />} />
              <Route path="reviews" element={<SupervisorLogbookReviews />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="admin" element={<AdminDashboardLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="supervisors" element={<AdminSupervisors />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppAlertProvider>
  );
}

export default App;