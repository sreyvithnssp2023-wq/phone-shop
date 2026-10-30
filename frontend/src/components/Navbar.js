import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiShoppingBag, 
  FiBox, 
  FiGrid, 
  FiBell, 
  FiBarChart2, 
  FiTruck, 
  FiShield, 
  FiSettings, 
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiTool
} from 'react-icons/fi';

export default function Navbar({ currentRole, setCurrentRole }) {
  const location = useLocation();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Retrieve shop info from localStorage or fall back to default
  const savedInfo = localStorage.getItem('pos_shop_info');
  const shopInfo = savedInfo ? JSON.parse(savedInfo) : null;
  const logoUrl = shopInfo ? shopInfo.logo : null;
  const shopName = shopInfo ? shopInfo.name : 'Angkor-Electronic';

  const roles = ['Admin (Chork)', 'Admin', 'Cashier', 'Technician (Fixer)'];

  const handleRoleSelect = (role) => {
    setCurrentRole(role);
    localStorage.setItem('userRole', role);
    setIsRoleDropdownOpen(false);
  };

  // Role identification helper checks
  const isAdmin = currentRole && (currentRole.includes('Admin') || currentRole.includes('admin'));
  const isStaffOrTech = currentRole && (currentRole.toLowerCase().includes('cashier') || currentRole.toLowerCase().includes('technician') || currentRole.toLowerCase().includes('fixer'));

  // Define master navigation list with role restrictions
  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome, adminOnly: false, staffRestricted: false },
    { path: '/pos', label: 'POS & Sales', icon: FiShoppingBag, adminOnly: true, staffRestricted: false }, // Hidden for Admins
    { path: '/products', label: 'Products', icon: FiBox, adminOnly: false, staffRestricted: false },
    { path: '/categories', label: 'Categories', icon: FiGrid, adminOnly: false, staffRestricted: false },
    { path: '/repairs', label: 'Repairs', icon: FiTool, adminOnly: true, staffRestricted: false }, // Hidden for Admins
    { path: '/notifications', label: 'Notifications', icon: FiBell, adminOnly: false, staffRestricted: false },
    { path: '/reports', label: 'Reports', icon: FiBarChart2, adminOnly: false, staffRestricted: true }, // Hidden for Cashiers & Techs
    { path: '/suppliers', label: 'Suppliers & Stock', icon: FiTruck, adminOnly: false, staffRestricted: true }, // Hidden for Cashiers & Techs
    { path: '/warranties', label: 'Warranties', icon: FiShield, adminOnly: false, staffRestricted: false },
    { path: '/settings', label: 'Settings', icon: FiSettings, adminOnly: false, staffRestricted: true }, // Hidden for Cashiers & Techs
  ];

  // Filter out items based on role restrictions
  const navItems = allNavItems.filter(item => {
    if (isAdmin && item.adminOnly) return false;
    if (isStaffOrTech && item.staffRestricted) return false;
    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none justify-between h-screen sticky top-0">
      <div>
        {/* Top Logo / Avatar Section */}
        <div className="flex flex-col items-center pt-6 pb-5 px-4 text-center border-b border-slate-800/80">
          <div className="w-16 h-16 rounded-full bg-blue-600 shadow-lg shadow-blue-500/30 flex items-center justify-center overflow-hidden border-2 border-white/20 mb-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-white">A</span>
            )}
          </div>
          <h2 className="text-white font-black text-base tracking-wide">{shopName}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">PHONE MANAGEMENT</p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="px-4 py-4 relative border-b border-slate-800/80">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="w-full bg-slate-800/80 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between border border-slate-700/60 shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              <FiUser className="text-blue-400 shrink-0" size={16} />
              <span className="truncate">{currentRole || 'Select Role'}</span>
            </div>
            <FiChevronDown className={`transition-transform duration-200 text-slate-400 shrink-0 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} size={16} />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 backdrop-blur-md">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                    currentRole === role ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  <span>{role}</span>
                  {currentRole === role && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="px-3.5 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-320px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="tracking-wide text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/logout"
          className="flex items-center justify-center gap-2.5 w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider"
        >
          <FiLogOut size={16} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}