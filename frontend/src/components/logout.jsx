import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearAuthSession } from '../utils/auth';
import { apiFetch } from '../api/client';

export default function Logout({ setUser, setCurrentRole }) {
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const performLogout = async () => {
      try {
        await apiFetch('/logout', { method: 'POST', timeout: 3000 }).catch(() => {});
      } catch (e) {
        // ignore
      } finally {
        clearAuthSession();
        if (setUser) setUser(null);
        if (setCurrentRole) setCurrentRole(null);
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [navigate, setUser, setCurrentRole]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-slate-300 text-sm font-semibold">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Logging out and clearing session & cookies...</span>
      </div>
    </div>
  );
}
