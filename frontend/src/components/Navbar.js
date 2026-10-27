import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/pos', label: 'POS', icon: '🛒' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/categories', label: 'Categories', icon: '📁' },
    { path: '/report', label: 'Reports', icon: '📈' },
    { path: '/suppliers', label: 'Suppliers & Stock', icon: '🚚' },
    { path: '/warranties', label: 'Warranties', icon: '🛡️' },
  ];

  return (
    <aside className="w-64 bg-[#0b0f19] text-white min-h-screen p-4 flex flex-col justify-between border-r border-slate-800/60">
      <div>
        {/* Logo & Shop Branding */}
        <div className="flex items-center gap-3 mb-6 px-2 py-2 border-b border-slate-800/80">
          <img
            src="/logo.png"
            alt="Angkor-Electronic Logo"
            className="w-10 h-10 rounded-xl object-cover border border-indigo-500/40 shadow-sm"
          />
          <div>
            <h1 className="font-bold text-base text-white leading-tight">
              Angkor-Electronic
            </h1>
            <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
              <span>👤</span> Chork Chansovanpanha (Admin)
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Link */}
      <div className="pt-4 border-t border-slate-800/60">
        <Link
          to="/logout"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}