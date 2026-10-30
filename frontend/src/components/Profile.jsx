import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiUser, FiShield, FiKey } from 'react-icons/fi';

export default function Profile({ user }) {
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      toast.error('Please fill in all password fields!');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long!');
      return;
    }

    toast.success('Password changed successfully!');
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
          <FiUser className="text-blue-600" />
          <span>User Profile & Security</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View your staff account credentials and update your security password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Details Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <FiShield className="text-blue-600" />
            <span>Account Information</span>
          </h2>

          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-3xl flex items-center justify-center shadow-lg mb-3">
              {user?.full_name?.charAt(0) || user?.role?.charAt(0) || 'U'}
            </div>
            <h3 className="text-base font-black text-slate-900">{user?.full_name || 'User'}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full mt-1">
              Role: {user?.role || 'Staff'}
            </span>
          </div>

          <div className="space-y-2 text-xs border-t pt-4">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Username:</span>
              <span className="font-mono font-bold text-slate-800">{user?.username || 'user'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">System Access Status:</span>
              <span className="font-bold text-emerald-600">Active Session</span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 border-b pb-3 flex items-center gap-2 mb-4">
            <FiKey className="text-blue-600" />
            <span>Change Password</span>
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Current Password</label>
              <input
                type="password"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Password</label>
              <input
                type="password"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs uppercase tracking-wider mt-2"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}