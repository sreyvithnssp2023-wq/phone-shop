import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiLock, FiUser, FiShield, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client';
import { saveAuthSession } from '../utils/auth';

export default function Login({ setUser, setCurrentRole, onLoginSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'staff'
  const navigate = useNavigate();

  // Quick preset account selection
  const handleSelectPreset = (roleType) => {
    setActiveTab(roleType);
    if (roleType === 'admin') {
      setForm({ username: 'admin', password: '123' });
    } else {
      setForm({ username: 'cashier', password: '123' });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const username = form.username.trim();
    const password = form.password;

    try {
      // 1. Try authenticating with backend API
      const res = await apiFetch('/login', {
        method: 'POST',
        data: { username, password },
        timeout: 10000,
      });

      if (res?.data?.success && res.data.user) {
        const loggedUser = res.data.user;
        const loggedToken = res.data.token;
        const loggedRole = res.data.role || loggedUser.role || 'Admin';

        // Save session & cookies (auth_token, auth_user, auth_role)
        saveAuthSession(loggedUser, loggedToken, loggedRole);

        if (setUser) setUser(loggedUser);
        if (setCurrentRole) setCurrentRole(loggedRole);
        if (onLoginSuccess) onLoginSuccess(loggedUser);

        toast.success(`Welcome back, ${loggedUser.name}! (${loggedRole})`);
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (apiErr) {
      console.warn('Backend login endpoint unavailable or returned error, evaluating credentials:', apiErr);

      // Check if it's an explicit 401/422 credentials error from backend
      if (apiErr?.response?.status === 401 || apiErr?.response?.status === 422) {
        setError(apiErr?.response?.data?.message || 'Username or password incorrect!');
        setLoading(false);
        return;
      }
    }

    // 2. Client-side fallback authentication (ensures offline / cold-start reliability)
    const lowerUser = username.toLowerCase();
    const isAdmin =
      lowerUser === 'admin' ||
      lowerUser === 'admin@gmail.com' ||
      lowerUser.includes('chork');

    const isStaff =
      lowerUser === 'cashier' ||
      lowerUser === 'staff' ||
      lowerUser === 'brovith' ||
      lowerUser === 'cashier@gmail.com' ||
      lowerUser === 'tech' ||
      lowerUser === 'tech@gmail.com';

    const isValidAdminPass = ['123', '1234', 'password', 'admin'].includes(password);
    const isValidStaffPass = ['123', '0000', '1111', 'password', '1234'].includes(password);

    if (isAdmin && isValidAdminPass) {
      const adminUser = {
        id: 1,
        name: 'Chork Chansovanpanha',
        email: 'admin@gmail.com',
        role: 'Admin (Chork)',
        roles: 'Admin',
      };
      saveAuthSession(adminUser, 'admin_session_token', 'Admin (Chork)');
      if (setUser) setUser(adminUser);
      if (setCurrentRole) setCurrentRole('Admin (Chork)');
      if (onLoginSuccess) onLoginSuccess(adminUser);
      toast.success('Signed in successfully as Admin!');
      navigate('/dashboard', { replace: true });
    } else if (isStaff && isValidStaffPass) {
      const isTech = lowerUser.includes('tech');
      const staffUser = {
        id: isTech ? 3 : 2,
        name: isTech ? 'Marivith (Technician)' : 'Brovith',
        email: isTech ? 'tech@gmail.com' : 'cashier@gmail.com',
        role: isTech ? 'Technician (Fixer)' : 'Cashier',
        roles: isTech ? 'Technician' : 'Cashier',
      };
      const roleName = staffUser.role;
      saveAuthSession(staffUser, 'staff_session_token', roleName);
      if (setUser) setUser(staffUser);
      if (setCurrentRole) setCurrentRole(roleName);
      if (onLoginSuccess) onLoginSuccess(staffUser);
      toast.success(`Signed in successfully as Staff (${roleName})!`);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Username & Password incorrect! Please check your credentials.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-600/30">
            <FiShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            Angkor-Electronic
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Phone Shop Management & POS System
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
          {/* Role Mode Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Login Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => handleSelectPreset('admin')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiShield size={14} />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('staff')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'staff'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FiUsers size={14} />
                <span>Staff / Cashier</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiUser size={16} />
                </div>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  placeholder={activeTab === 'admin' ? 'admin (or admin@gmail.com)' : 'cashier (or cashier@gmail.com)'}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiLock size={16} />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Cookie & Session Enabled
              </span>
              <span className="text-slate-400">Default: 123</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in as {activeTab === 'admin' ? 'Admin' : 'Staff'}</span>
              )}
            </button>
          </form>

          {/* Quick preset credentials bar */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 text-center mb-2">Quick Sign-in Presets:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm({ username: 'admin', password: '123' });
                  setActiveTab('admin');
                }}
                className="text-[11px] p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-center transition"
              >
                Admin (admin / 123)
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ username: 'cashier', password: '123' });
                  setActiveTab('staff');
                }}
                className="text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-center transition"
              >
                Staff (cashier / 123)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
