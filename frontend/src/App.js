import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import HeaderBar from './components/HeaderBar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages / Views
import Dashboard from './components/dashboard.jsx';
import PosSale from './components/PosSale.jsx';
import Products from './components/products.jsx';
import Categories from './components/categories.jsx';
import Report from './components/report.jsx';
import Suppliers from './components/suppliers.jsx';
import Warranties from './components/Warranties.jsx';
import EditProduct from './components/EditProduct.jsx';
import Login from './components/login.jsx';
import Logout from './components/logout.jsx';
import Profile from './components/Profile.jsx';
import Settings from './components/Settings.jsx';
import Notifications from './components/Notifications.jsx';

export default function App() {
  // Read active role from localStorage to prevent resets on re-render
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('userRole') || 'Admin (Chork)';
  });

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-100">
        {/* Sidebar */}
        <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <HeaderBar currentRole={currentRole} />

          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/pos" replace />} />

              {/* Public / Multi-role routes */}
              <Route path="/pos" element={<PosSale />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/warranties" element={<Warranties />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />

              {/* Restricted Admin Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <Report />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <Report />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-product"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute currentRole={currentRole} allowedRoles={['Admin (Chork)', 'Admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}