
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GarageProvider, useGarage } from './context/GarageContext';

import Home from './pages/Home';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';

// Check Auth Wrapper
const ProtectedRoute = ({ children, role }) => {
  const { currentUser } = useGarage();
  if (!currentUser) return <Navigate to="/" />;
  if (role && currentUser.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <GarageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/*" element={
            <ProtectedRoute role="staff">
              <StaffDashboard />
            </ProtectedRoute>
          } />


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GarageProvider>
  );
}

export default App;
