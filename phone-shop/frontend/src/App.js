import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { 
  FiHome, 
  FiShoppingCart, 
  FiBox, 
  FiGrid, 
  FiTool, 
  FiBarChart2, 
  FiTruck, 
  FiShield, 
  FiBell, 
  FiSettings,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiUserCheck,
  FiLock,
  FiX
} from 'react-icons/fi';

import Dashboard from './components/dashboard';
import POS from './components/POS';
import Products from './components/products';
import Categories from './components/categories';
import Repairs from './components/Repairs';
import Report from './components/report';
import Suppliers from './components/suppliers';
import Warranties from './components/Warranties';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/login';
import Logout from './components/logout';

const SWITCH_ACCOUNTS = {
  Admin: { username: 'admin', pass: '123456', name: 'Chork Chansovanpanha' },
  Cashier: { username: 'cashier', pass: '123456', name: 'Som Sreyvith' },
  Fixer: { username: 'fixer', pass: '123456', name: 'Chan Rithy' },
};

export const recordAuditLog = (user, actionType = 'Logged In') => {
  const existingLogs = JSON.parse(localStorage.getItem('pos_audit_logs') || '[]');
  const newLog = {
    id: Date.now(),
    name: user.full_name || user.username,
    role: user.role,
    action: actionType,
    timestamp: new Date().toLocaleString()
  };
  localStorage.setItem('pos_audit_logs', JSON.stringify([newLog, ...existingLogs.slice(0, 99)]));
};

function MainLayout({ user, onSwitchRole }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(null);
  const [switchForm, setSwitchForm] = useState({ username: '', password: '' });
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkNotifs = () => {
      const notifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
      const unread = notifs.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };

    checkNotifs();
    const interval = setInterval(checkNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  const navLinkStyle = ({ isActive }) =>
    `flex items-center gap-4 px-5 py-3.5 mx-3 rounded-full text-base font-bold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40'
        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
    }`;

  const logoutLinkStyle = ({ isActive }) =>
    `flex items-center gap-4 px-5 py-3.5 mx-3 rounded-full text-base font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/40 transition-all ${
      isActive ? 'ring-2 ring-white/50' : ''
    }`;

  const handleSelectRole = (role) => {
    setIsDropdownOpen(false);
    if (user?.role === role) return;
    setTargetRole(role);
    const defaultAcc = SWITCH_ACCOUNTS[role];
    setSwitchForm({ username: defaultAcc ? defaultAcc.username : '', password: '' });
  };

  const handleConfirmSwitch = (e) => {
    e.preventDefault();
    const targetAcc = SWITCH_ACCOUNTS[targetRole];

    if (
      targetAcc &&
      switchForm.username.toLowerCase() === targetAcc.username &&
      switchForm.password === targetAcc.pass
    ) {
      const newUser = {
        full_name: targetAcc.name,
        role: targetRole,
        username: targetAcc.username,
      };
      recordAuditLog(newUser, `Switched Role to ${targetRole}`);
      onSwitchRole(newUser);
      toast.success(`Switched role to ${targetRole} (${targetAcc.name})`);
      setTargetRole(null);
      navigate('/dashboard');
    } else {
      toast.error('Invalid username or password for this role!');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#1b253b] text-slate-200 flex flex-col fixed inset-y-0 left-0 z-30 shadow-2xl border-r border-slate-800/50 justify-between">
        <div>
          <div className="pt-6 pb-4 px-4 border-b border-slate-800/60 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/30 mb-2 border-2 border-white/20">
              A
            </div>
            <h1 className="text-base font-extrabold tracking-wide text-white leading-tight">
              Angkor-Electronic
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase">
              PHONE MANAGEMENT
            </p>

            <div className="mt-3 relative w-full">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-xs text-blue-300 font-semibold px-3 py-2 rounded-full bg-blue-950/80 border border-blue-800/60 hover:bg-blue-900/80 transition-all flex items-center justify-between gap-1 shadow-sm"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FiUserCheck className="text-blue-400 shrink-0" size={16} />
                  <span className="truncate">{user?.role || 'Admin'} ({user?.full_name?.split(' ')[0] || 'User'})</span>
                </div>
                <FiChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Role Dropdown Menu Without Emojis */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#222d47] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 text-left overflow-hidden">
                  <button
                    onClick={() => handleSelectRole('Admin')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-600/25 transition-colors ${
                      user?.role === 'Admin' ? 'text-blue-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => handleSelectRole('Cashier')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-600/25 transition-colors ${
                      user?.role === 'Cashier' ? 'text-blue-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    Cashier
                  </button>
                  <button
                    onClick={() => handleSelectRole('Fixer')}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-blue-600/25 transition-colors ${
                      user?.role === 'Fixer' ? 'text-blue-400 font-bold' : 'text-slate-200'
                    }`}
                  >
                    Technician (Fixer)
                  </button>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 py-4 space-y-2">
            <NavLink to="/dashboard" className={navLinkStyle}>
              <FiHome size={22} />
              <span>Dashboard</span>
            </NavLink>

            {/* POS: Hidden from Admin */}
            {user?.role !== 'Admin' && (
              <NavLink to="/pos" className={navLinkStyle}>
                <FiShoppingCart size={22} />
                <span>POS</span>
              </NavLink>
            )}

            <NavLink to="/products" className={navLinkStyle}>
              <FiBox size={22} />
              <span>Products</span>
            </NavLink>

            <NavLink to="/categories" className={navLinkStyle}>
              <FiGrid size={22} />
              <span>Categories</span>
            </NavLink>

            {/* REPAIRS: Hidden from Admin (Only Cashier & Fixer see Repairs) */}
            {user?.role !== 'Admin' && (
              <NavLink to="/repairs" className={navLinkStyle}>
                <FiTool size={22} />
                <span>Repairs</span>
              </NavLink>
            )}

            {/* ADMIN ONLY Links */}
            {user?.role === 'Admin' && (
              <NavLink to="/notifications" className={navLinkStyle}>
                <div className="flex items-center gap-4 justify-between w-full">
                  <div className="flex items-center gap-4">
                    <FiBell size={22} />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>
            )}

            {user?.role === 'Admin' && (
              <NavLink to="/report" className={navLinkStyle}>
                <FiBarChart2 size={22} />
                <span>Reports</span>
              </NavLink>
            )}

            {user?.role === 'Admin' && (
              <NavLink to="/suppliers" className={navLinkStyle}>
                <FiTruck size={22} />
                <span>Suppliers & Stock</span>
              </NavLink>
            )}

            <NavLink to="/warranties" className={navLinkStyle}>
              <FiShield size={22} />
              <span>Warranties</span>
            </NavLink>

            <NavLink to="/profile" className={navLinkStyle}>
              <FiUser size={22} />
              <span>My Profile</span>
            </NavLink>

            {user?.role === 'Admin' && (
              <NavLink to="/settings" className={navLinkStyle}>
                <FiSettings size={22} />
                <span>Settings</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/60">
          <NavLink to="/logout" className={logoutLinkStyle}>
            <FiLogOut size={22} />
            <span>Logout</span>
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8 overflow-y-auto min-h-screen">
        <Outlet />
      </main>

      {/* Role Switch Confirmation Modal */}
      {targetRole && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                <FiLock className="text-blue-600" />
                <span>Login as {targetRole}</span>
              </div>
              <button
                type="button"
                onClick={() => setTargetRole(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmSwitch} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  value={switchForm.username}
                  onChange={(e) => setSwitchForm({ ...switchForm, username: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={switchForm.password}
                  onChange={(e) => setSwitchForm({ ...switchForm, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetRole(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                >
                  Confirm Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('pos_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('pos_user', JSON.stringify(userData));
      recordAuditLog(userData, 'Logged In');
    } else {
      localStorage.removeItem('pos_user');
    }
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/login" element={<Login setUser={handleSetUser} />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

        <Route element={<MainLayout user={user} onSwitchRole={handleSetUser} />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/pos" element={<POS user={user} />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin', 'Cashier']}>
                <Products user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin', 'Cashier']}>
                <Categories user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repairs"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin', 'Fixer', 'Cashier']}>
                <Repairs user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <Report user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <Suppliers user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin', 'Cashier']}>
                <Warranties user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin', 'Cashier', 'Fixer']}>
                <Profile user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user} allowedRoles={['Admin']}>
                <Settings user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/logout" element={<Logout setUser={handleSetUser} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}