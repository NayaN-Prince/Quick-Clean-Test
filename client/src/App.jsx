import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/admin/AdminLayout';
import RequestTable from './components/admin/RequestTable';
import WorkerManagement from './components/admin/WorkerManagement';
import PricingSettings from './components/admin/PricingSettings';
import ServiceRequestForm from './components/user/ServiceRequestForm';
import UserDashboard from './pages/UserDashboard';
import AvailableJobs from './components/worker/AvailableJobs';
import WorkerDashboard from './pages/WorkerDashboard';

// Private Route Component (Protects Dashboards)
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (role && user.user_metadata.role !== role) {
    // Redirect to their correct dashboard if role doesn't match
    const userRole = user.user_metadata.role;
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" />;
    if (userRole === 'worker') return <Navigate to="/worker-dashboard" />;
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-green-600 p-4 text-white flex justify-between items-center">
          <h1 className="font-bold text-xl">QuickClean</h1>
          {/* Show Logout only if user is logged in */}
          {user && (
            <button
              onClick={logout}
              className="text-sm bg-green-800 px-3 py-1 rounded hover:bg-green-700"
            >
              Logout
            </button>
          )}
        </nav>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Default Redirect: Go to Login first */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Routes */}
          <Route path="/user-dashboard" element={
            <PrivateRoute role="user">
              <UserDashboard />
            </PrivateRoute>
          } />

          <Route path="/worker-dashboard" element={
            <PrivateRoute role="worker">
              <WorkerDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin-dashboard" element={
            <PrivateRoute role="admin">
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="requests" element={<RequestTable />} />
            <Route path="workers" element={<WorkerManagement />} />
            <Route path="pricing" element={<PricingSettings />} />
            <Route path="settings" element={<div className="p-8 text-slate-400">System settings coming soon...</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;