import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiUser,
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiShoppingCart,
  FiBox,
  FiLayers,
  FiBell,
  FiBarChart2,
  FiTruck,
  FiShield,
  FiLock,
  FiX,
  FiSettings,
} from 'react-icons/fi';

export default function Navbar({ currentRole = 'Admin (Chork)', setCurrentRole }) {
  const location = useLocation();

  const [isOpenRoleMenu, setIsOpenRoleMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const roleOptions = [
    { label: 'Admin', fullLabel: 'Admin (Chork)' },
    { label: 'Cashier', fullLabel: 'Cashier' },
    { label: 'Technician (Fixer)', fullLabel: 'Technician (Fixer)' },
  ];

  const handleSelectRole = (role) => {
    if (role.fullLabel === currentRole) {
      setIsOpenRoleMenu(false);
      return;
    }
    setSelectedRole(role.fullLabel);
    setPassword('');
    setErrorMsg('');
    setIsModalOpen(true);
    setIsOpenRoleMenu(false);
  };

  const handleVerifyPassword = (e) => {
    if (e) e.preventDefault();

    if (password === '123456') {
      // 1. Save role to localStorage for persistence across refreshes
      localStorage.setItem('userRole', selectedRole);

      // 2. Update App.js state directly so HeaderBar & ProtectedRoute sync immediately
      if (typeof setCurrentRole === 'function') {
        setCurrentRole(selectedRole);
      }

      setIsModalOpen(false);
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Password មិនត្រឹមត្រូវទេ!');
    }
  };

  // Nav links configuration with role authorizations
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid />, roles: ['Admin (Chork)', 'Admin'] },
    { name: 'POS', path: '/pos', icon: <FiShoppingCart />, roles: ['Admin (Chork)', 'Admin', 'Cashier'] },
    { name: 'Products', path: '/products', icon: <FiBox />, roles: ['Admin (Chork)', 'Admin', 'Cashier', 'Technician (Fixer)', 'Technician'] },
    { name: 'Categories', path: '/categories', icon: <FiLayers />, roles: ['Admin (Chork)', 'Admin', 'Cashier'] },
    { name: 'Notifications', path: '/notifications', icon: <FiBell />, roles: ['Admin (Chork)', 'Admin', 'Cashier', 'Technician (Fixer)', 'Technician'] },
    { name: 'Reports', path: '/reports', icon: <FiBarChart2 />, roles: ['Admin (Chork)', 'Admin'] },
    { name: 'Suppliers & Stock', path: '/suppliers', icon: <FiTruck />, roles: ['Admin (Chork)', 'Admin'] },
    { name: 'Warranties', path: '/warranties', icon: <FiShield />, roles: ['Admin (Chork)', 'Admin', 'Cashier', 'Technician (Fixer)', 'Technician'] },
    { name: 'My Profile', path: '/profile', icon: <FiUser />, roles: ['Admin (Chork)', 'Admin', 'Cashier', 'Technician (Fixer)', 'Technician'] },
    { name: 'Settings', path: '/settings', icon: <FiSettings />, roles: ['Admin (Chork)', 'Admin'] },
  ];

  // Robust flexible role matching logic
  const normalize = (str) => (str || '').toString().trim().toLowerCase();
  const activeRoleNormalized = normalize(currentRole);

  const filteredNavLinks = navLinks.filter((link) => {
    return link.roles.some((allowedRole) => {
      const normAllowed = normalize(allowedRole);
      return (
        normAllowed === activeRoleNormalized ||
        normAllowed.includes(activeRoleNormalized) ||
        activeRoleNormalized.includes(normAllowed)
      );
    });
  });

  return (
    <div className="w-64 bg-[#0d1424] min-h-screen text-white p-4 flex flex-col justify-between font-sans relative select-none flex-shrink-0">
      <div>
        <div className="flex items-center gap-3 pt-2 pb-3">
          <img
            src="/logo.png"
            alt="Angkor-Electronic Logo"
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-md border border-slate-700/50"
          />
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white tracking-wide truncate">
              Angkor-Electronic
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-medium truncate mt-0.5">
              <FiUser className="text-xs flex-shrink-0" />
              <span className="truncate">Chork Chansovanpanha</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-800 my-2" />

        {/* Dynamic Role Dropdown */}
        <div className="relative my-3">
          <button
            onClick={() => setIsOpenRoleMenu(!isOpenRoleMenu)}
            className="w-full bg-[#17223b] hover:bg-[#1f2d4d] text-indigo-200 border border-indigo-900/50 rounded-xl py-2 px-3 flex items-center justify-between text-xs font-semibold transition shadow-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <FiUser className="text-indigo-400 text-sm flex-shrink-0" />
              <span className="truncate">{currentRole}</span>
            </div>
            {isOpenRoleMenu ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {isOpenRoleMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#17223b] border border-slate-700 rounded-xl shadow-2xl z-30 py-1.5 overflow-hidden">
              {roleOptions.map((role, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition flex items-center justify-between ${
                    currentRole === role.fullLabel
                      ? 'text-indigo-400 font-bold bg-indigo-950/60'
                      : 'text-gray-300 hover:bg-[#213054] hover:text-white'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtered Navigation Links */}
        <nav className="space-y-1 mt-2">
          {filteredNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-300 hover:bg-[#17223b] hover:text-white'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Password Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-xs relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-lg" />
            </button>

            <div className="flex items-center gap-3 mb-3 text-indigo-600">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <FiLock className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-slate-900">បញ្ជាក់ Password</h3>
            </div>

            <p className="text-xs text-gray-600 mb-4">
              សូមបញ្ចូល Password ដើម្បីប្តូរទៅកាន់ Role <b>"{selectedRole}"</b>
            </p>

            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword(e)}
                placeholder="បញ្ចូល Password..."
                className="w-full border border-gray-300 px-3.5 py-2 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />

              {errorMsg && (
                <p className="text-red-500 text-xs font-semibold mt-2">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPassword}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  បញ្ជាក់
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}