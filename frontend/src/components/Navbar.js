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
  FiTool,
  FiLock,
  FiX
} from 'react-icons/fi';

// 🟢 Import រូបភាព Logo ផ្ទាល់ពី Folder src/assets/logo.png
import logoImg from '../assets/logo.png';

export default function Navbar({ currentRole, setCurrentRole, isMobileOpen, onCloseMobile }) {
  const location = useLocation();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // State សម្រាប់ Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // កំណត់ Password សម្រាប់ Role នីមួយៗ
  const rolePasswords = {
    'Admin (Chork)': '1234',
    'Admin (Bro)': '1234',
    'Cashier': '0000',
    'Technician (Fixer)': '1111'
  };

  // Retrieve shop info from localStorage or fall back to default
  const savedInfo = localStorage.getItem('pos_shop_info');
  const shopInfo = savedInfo ? JSON.parse(savedInfo) : null;
  
  // 🟢 បើមាន Logo ក្នុង localStorage យកតាមនោះ បើគ្មានទេ យករូប logoImg ដែលបាន Import
  const activeLogo = shopInfo?.logo || logoImg;
  const shopName = shopInfo ? shopInfo.name : 'Angkor-Electronic';

  const roles = ['Admin (Chork)', 'Admin (Bro)', 'Cashier', 'Technician (Fixer)'];

  // ពេលអ្នកប្រើចុចជ្រើសរើស Role ពី Dropdown
  const handleRoleClick = (role) => {
    setIsRoleDropdownOpen(false);
    if (role === currentRole) return;

    setSelectedRole(role);
    setPassword('');
    setErrorMessage('');
    setIsPasswordModalOpen(true);
  };

  // ផ្ទៀងផ្ទាត់ Password
  const handleConfirmPassword = (e) => {
    e.preventDefault();
    const correctPassword = rolePasswords[selectedRole];

    if (password === correctPassword) {
      setCurrentRole(selectedRole);
      localStorage.setItem('userRole', selectedRole);
      setIsPasswordModalOpen(false);
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage('Password មិនត្រឹមត្រូវទេ! សូមសាកល្បងម្តងទៀត។');
    }
  };

  // Role identification helper checks
  const isAdmin = currentRole && (currentRole.includes('Admin') || currentRole.includes('admin'));
  const isStaffOrTech = currentRole && (currentRole.toLowerCase().includes('cashier') || currentRole.toLowerCase().includes('technician') || currentRole.toLowerCase().includes('fixer'));

  // Define master navigation list with role restrictions
  const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome, adminOnly: false, staffRestricted: false },
    { path: '/pos', label: 'POS & Sales', icon: FiShoppingBag, adminOnly: false, staffRestricted: false }, 
    { path: '/products', label: 'Products', icon: FiBox, adminOnly: false, staffRestricted: false },
    { path: '/categories', label: 'Categories', icon: FiGrid, adminOnly: false, staffRestricted: false },
    { path: '/repairs', label: 'Repairs', icon: FiTool, adminOnly: false, staffRestricted: false }, 
    { path: '/notifications', label: 'Notifications', icon: FiBell, adminOnly: false, staffRestricted: false },
    { path: '/reports', label: 'Reports', icon: FiBarChart2, adminOnly: false, staffRestricted: true }, 
    { path: '/suppliers', label: 'Suppliers & Stock', icon: FiTruck, adminOnly: false, staffRestricted: true }, 
    { path: '/warranties', label: 'Warranties', icon: FiShield, adminOnly: false, staffRestricted: false },
    { path: '/settings', label: 'Settings', icon: FiSettings, adminOnly: false, staffRestricted: true }, 
  ];

  // Filter out items based on role restrictions
  const navItems = allNavItems.filter(item => {
    if (isAdmin && item.adminOnly) return false;
    if (isStaffOrTech && item.staffRestricted) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-label="Close navigation overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none justify-between h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="relative">
          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>

          {/* Top Logo / Avatar Section - 🟢 ធ្វើឱ្យ Logo ធំពេញសាច់ស្អាត */}
          <div className="flex flex-col items-center pt-6 pb-5 px-4 text-center border-b border-slate-800/80">
            <div className="w-24 h-24 rounded-2xl bg-slate-800/60 shadow-lg flex items-center justify-center overflow-hidden border border-slate-700/60 mb-3 p-1">
              <img 
                src={activeLogo} 
                alt="Shop Logo" 
                className="w-full h-full object-cover rounded-xl" 
              />
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
                    onClick={() => handleRoleClick(role)}
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
          <div className="px-3.5 py-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-360px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onCloseMobile?.()}
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
            onClick={() => onCloseMobile?.()}
            className="flex items-center justify-center gap-2.5 w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </Link>
        </div>

        {/* Modal Popup វាយ Password ផ្លាស់ប្តូរ Role */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-xs rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>

            <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiLock size={22} />
            </div>

            <h3 className="text-white font-bold text-base mb-1">ផ្ទៀងផ្ទាត់ Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              សូមបញ្ចូល Password សម្រាប់ <span className="text-blue-400 font-bold">{selectedRole}</span>
            </p>

            <form onSubmit={handleConfirmPassword} className="space-y-3">
              <input
                type="password"
                placeholder="បញ្ចូល Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs rounded-xl px-4 py-3 outline-none transition-all text-center tracking-widest"
              />

              {errorMessage && (
                <p className="text-[11px] text-red-400 font-medium">{errorMessage}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-colors"
                >
                  យល់ព្រម
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </aside>
    </>
  );
}