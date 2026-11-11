import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeaderBar from './components/HeaderBar';
import Dashboard from './components/dashboard';
import POS from './components/PosSale';
import Products from './components/products';
import Categories from './components/categories';
import Repairs from './components/Repairs';
import Notifications from './components/Notifications';
import Reports from './components/report';
import Suppliers from './components/suppliers';
import Warranties from './components/Warranties';
import Settings from './components/Settings';
import Login from './components/login';
import Logout from './components/logout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { apiFetch } from './api/client';
import { getAuthSession, saveAuthSession } from './utils/auth';

// Layout wrapper សម្រាប់ទំព័រដែលមាន Navbar & HeaderBar
function MainLayout({ currentRole, setCurrentRole, currentUser, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Navbar 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole} 
        currentUser={currentUser}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <HeaderBar 
          currentRole={currentRole} 
          currentUser={currentUser}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />
        <main className="p-3 sm:p-4 md:p-6 flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const session = getAuthSession();
    return session.isAuthenticated ? session.user : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const session = getAuthSession();
    return session.isAuthenticated ? session.role : 'Admin';
  });

  const [loading, setLoading] = useState(true);

  // 🟢 ផ្ទៀងផ្ទាត់ Auth Session & Cookies ពេលបើក App ដំបូង
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = getAuthSession();
        if (session.isAuthenticated && session.user) {
          setCurrentUser(session.user);
          setCurrentRole(session.role || session.user.role || 'Admin');

          // Optionally sync fresh user details from backend in background
          try {
            const res = await apiFetch('/users', { timeout: 5000 });
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const match = list.find((u) => String(u.id) === String(session.user.id));
            if (match) {
              const updatedUser = { ...session.user, ...match };
              setCurrentUser(updatedUser);
              saveAuthSession(updatedUser, session.token, updatedUser.role);
            }
          } catch (e) {
            // Keep existing session on offline / timeout
          }
        }
      } catch (err) {
        console.error('Error restoring auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (userObj) => {
    if (userObj) {
      const role = userObj.role || userObj.roles || 'Admin';
      setCurrentUser(userObj);
      setCurrentRole(role);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-300 font-bold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting to Angkor-Electronic Portal...</span>
        </div>
      </div>
    );
  }

  const isAuthenticated = Boolean(currentUser);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                setUser={setCurrentUser}
                setCurrentRole={setCurrentRole}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />

        {/* Logout Route */}
        <Route
          path="/logout"
          element={
            <Logout
              setUser={setCurrentUser}
              setCurrentRole={setCurrentRole}
            />
          }
        />

        {/* Protected Dashboard Overview Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Dashboard currentRole={currentRole} currentUser={currentUser} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected POS Route (Admin & Staff) */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <POS currentUser={currentUser} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Products Route */}
        <Route
          path="/products"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Products />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Categories Route */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Categories />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Repairs Route */}
        <Route
          path="/repairs"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Repairs currentUser={currentUser} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Notifications Route */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Reports Route (Admin Only) */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole} allowedRoles={['admin']}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Suppliers Route (Admin Only) */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole} allowedRoles={['admin']}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Suppliers />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Warranties Route */}
        <Route
          path="/warranties"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Warranties />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Settings Route (Admin Only) */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute currentUser={currentUser} currentRole={currentRole} allowedRoles={['admin']}>
              <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
                <Settings currentUser={currentUser} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Fallback Route */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}
