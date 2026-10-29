import React, { useState } from 'react';
import { FiUser, FiShield, FiKey } from 'react-icons/fi';

export default function Profile() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'សូមបញ្ចូលព័ត៌មានពាក្យសម្ងាត់ឲ្យបានគ្រប់ជ្រុងជ្រោយ!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ!' });
      return;
    }

    // ជោគជ័យ
    setMessage({ type: 'success', text: 'បានផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans select-none">
      {/* Title Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-blue-600 mb-1">
          <FiUser className="text-2xl" />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            User Profile & Security
          </h1>
        </div>
        <p className="text-xs font-medium text-slate-500 pl-8">
          View your staff account credentials and update your security password.
        </p>
      </div>

      {/* Profile & Change Password Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Card 1: Account Information */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-6 pb-3 border-b border-slate-100">
              <FiShield className="text-blue-500 text-sm" />
              <span>Account Information</span>
            </div>

            <div className="flex flex-col items-center my-6">
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-xl shadow-blue-500/25 mb-4 border-2 border-blue-400">
                C
              </div>
              <h3 className="text-lg font-bold text-slate-800 tracking-wide">
                Chork Chansovanpanha
              </h3>
              <span className="mt-2 px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100">
                Role: Admin
              </span>
            </div>
          </div>

          {/* Staff Credentials Details */}
          <div className="space-y-3 pt-6 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Username:</span>
              <span className="font-bold text-slate-800 font-mono">user</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">System Access Status:</span>
              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Session
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Change Password Form */}
        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm min-h-[420px]">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider mb-6 pb-3 border-b border-slate-100">
            <FiKey className="text-blue-500 text-sm" />
            <span>Change Password</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {message.text && (
              <p
                className={`text-xs font-bold mt-2 ${
                  message.type === 'error' ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition uppercase tracking-wider"
            >
              UPDATE PASSWORD
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}