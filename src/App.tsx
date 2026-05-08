import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected & Layout
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import DashboardLayout from './layouts/DashboardLayout';

// Student Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';

// Placeholder pages (you can replace these later)
const Opportunities = () => <div className="p-8 text-2xl">Opportunities Page - Coming Soon</div>;
const Logbook = () => <div className="p-8 text-2xl">Weekly Logbook Page - Coming Soon</div>;
const Applications = () => <div className="p-8 text-2xl">My Applications Page - Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===================== PUBLIC ROUTES ===================== */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/track" element={<Track />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===================== PROTECTED ROUTES ===================== */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          {/* Default /dashboard → Role-based redirect */}
          <Route index element={<RoleBasedRedirect />} />

          {/* ==================== STUDENT DASHBOARD ==================== */}
          <Route path="student" element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="applications" element={<Applications />} />
          </Route>

          {/* ==================== FUTURE DASHBOARDS ==================== */}
          {/* Company Dashboard */}
          <Route path="company" element={<div className="p-10 text-3xl">Company Dashboard (Coming Soon)</div>} />

          {/* Supervisor Dashboard */}
          <Route path="supervisor" element={<div className="p-10 text-3xl">Supervisor Dashboard (Coming Soon)</div>} />

          {/* Admin Dashboard */}
          <Route path="admin" element={<div className="p-10 text-3xl">Admin Dashboard (Coming Soon)</div>} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;