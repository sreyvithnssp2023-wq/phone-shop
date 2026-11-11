import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
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
import { Toaster } from 'react-hot-toast';
import { apiFetch, getApiBase } from './api/client';

// 🟢 API Endpoint ភ្ជាប់ទៅកាន់ XAMPP Apache Backend ឬ Render Cloud
const API_BASE = getApiBase();

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
    const savedUser = localStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return currentUser?.role || currentUser?.roles || 'Admin';
  });

  const [loading, setLoading] = useState(true);

  // 🟢 ទាញយកព័ត៌មាន User ផ្ទាល់ពី MySQL Database តាម ID ដែលបាន Login ចូល
  const fetchUserFromDB = async (loginUserId = null) => {
    try {
      setLoading(true);
      const res = await apiFetch('/users');
      const usersList = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      if (usersList.length > 0) {
        const savedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
        const targetId = loginUserId || savedUser?.id;

        // ស្វែងរក User តាម ID ដែលបាន Login ចូល (បើគ្មានទេ ទើបយក User ទី១)
        const activeUser = usersList.find((u) => String(u.id) === String(targetId)) || usersList[0];
        
        setCurrentUser(activeUser);
        setCurrentRole(activeUser.role || activeUser.roles || 'Admin');
        localStorage.setItem('authUser', JSON.stringify(activeUser));
      }
    } catch (err) {
      console.error('Error fetching user data from MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFromDB();
  }, []);

  const handleLoginSuccess = (userObj) => {
    if (userObj) {
      setCurrentUser(userObj);
      setCurrentRole(userObj.role || userObj.roles || 'Admin');
      localStorage.setItem('authUser', JSON.stringify(userObj));
    }
    fetchUserFromDB(userObj?.id);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 text-slate-600 font-bold text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>កំពុងភ្ជាប់ទៅកាន់ MySQL Database...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login setCurrentRole={setCurrentRole} onLoginSuccess={handleLoginSuccess} />} />
        
        <Route path="/logout" element={
          <Navigate to="/login" replace />
        } />

        <Route path="/dashboard" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Dashboard currentRole={currentRole} currentUser={currentUser} />
          </MainLayout>
        } />
        <Route path="/pos" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <POS currentUser={currentUser} />
          </MainLayout>
        } />
        <Route path="/products" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Products />
          </MainLayout>
        } />
        <Route path="/categories" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Categories />
          </MainLayout>
        } />
        <Route path="/repairs" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Repairs currentUser={currentUser} />
          </MainLayout>
        } />
        <Route path="/notifications" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Notifications />
          </MainLayout>
        } />
        <Route path="/reports" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Reports />
          </MainLayout>
        } />
        <Route path="/suppliers" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Suppliers />
          </MainLayout>
        } />
        <Route path="/warranties" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Warranties />
          </MainLayout>
        } />
        <Route path="/settings" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole} currentUser={currentUser}>
            <Settings currentUser={currentUser} />
          </MainLayout>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}