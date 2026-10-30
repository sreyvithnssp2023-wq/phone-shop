import React, { useState } from 'react';
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
import { Toaster } from 'react-hot-toast';

// Layout wrapper for authenticated pages (has Navbar & HeaderBar)
function MainLayout({ currentRole, setCurrentRole, children }) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Navbar currentRole={currentRole} setCurrentRole={setCurrentRole} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <HeaderBar currentRole={currentRole} />
        <main className="p-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('userRole') || 'Admin (Chork)';
  });

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Standalone Fullscreen Login Page */}
        <Route path="/login" element={<Login setCurrentRole={setCurrentRole} />} />
        
        {/* Logout route redirects directly to login */}
        <Route path="/logout" element={<Navigate to="/login" replace />} />

        {/* All Dashboard & System Pages wrapped inside MainLayout */}
        <Route path="/dashboard" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Dashboard currentRole={currentRole} />
          </MainLayout>
        } />
        <Route path="/pos" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <POS />
          </MainLayout>
        } />
        <Route path="/products" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Products />
          </MainLayout>
        } />
        <Route path="/categories" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Categories />
          </MainLayout>
        } />
        <Route path="/repairs" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Repairs />
          </MainLayout>
        } />
        <Route path="/notifications" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Notifications />
          </MainLayout>
        } />
        <Route path="/reports" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Reports />
          </MainLayout>
        } />
        <Route path="/suppliers" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Suppliers />
          </MainLayout>
        } />
        <Route path="/warranties" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Warranties />
          </MainLayout>
        } />
        <Route path="/settings" element={
          <MainLayout currentRole={currentRole} setCurrentRole={setCurrentRole}>
            <Settings />
          </MainLayout>
        } />

        {/* Default fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}