import React from 'react';
import { Navigate } from 'react-router-dom';

<<<<<<< HEAD
export default function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl max-w-md shadow-sm">
          <h2 className="text-lg font-bold mb-1">Access Denied <i class="fa-jelly fa-regular fa-lock"></i></h2>
          <p className="text-xs text-rose-600 mb-4">
            Your current role (<span className="font-semibold">{user.role}</span>) does not have permission to view this page.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
=======
export default function ProtectedRoute({ currentRole, allowedRoles, children }) {
  const normalize = (str) => (str || '').toString().trim().toLowerCase();
  const userRole = normalize(currentRole);

  const isAllowed = allowedRoles.some((role) => {
    const norm = normalize(role);
    return norm === userRole || norm.includes(userRole) || userRole.includes(norm);
  });

  if (!isAllowed) {
    return <Navigate to="/pos" replace />;
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
  }

  return children;
}