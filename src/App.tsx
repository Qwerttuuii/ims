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
import DashboardLayout from './layouts/DashboardLayout';
import CompanyDashboardLayout from './layouts/CompanyDashboardLayout';

// Student Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentOpportunities from './pages/dashboard/StudentOpportunities';
import StudentApplications from './pages/dashboard/StudentApplications';
// Company Pages
import CompanyOverview from './pages/dashboard/CompanyOverview';
import CompanyOpenings from './pages/dashboard/CompanyOpenings';
import CompanyApplicants from './pages/dashboard/CompanyApplicants';   // ← Add this import

// Placeholders
const Logbook = () => <div className="p-8 text-2xl">Weekly Logbook Page - Coming Soon</div>;
const Applications = () => <div className="p-8 text-2xl">My Applications Page - Coming Soon</div>;

function App() {
  return (
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
            <Route path="logbook" element={<Logbook />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications" element={<StudentApplications />} />
          </Route>

          {/* Company Dashboard */}
          <Route path="company" element={<CompanyDashboardLayout />}>
            <Route index element={<CompanyOverview />} />
            <Route path="openings" element={<CompanyOpenings />} />
            <Route path="applicants" element={<CompanyApplicants />} />
          </Route>

          {/* Future Roles */}
          <Route path="supervisor" element={<div className="p-10 text-3xl">Supervisor Dashboard (Coming Soon)</div>} />
          <Route path="admin" element={<div className="p-10 text-3xl">Admin Dashboard (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;