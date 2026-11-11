/**
 * Authentication, Session & Cookie Management Utility
 * Supports session persistence, secure cookies, and role management for Admin and Staff.
 */

// --- 🍪 Cookie Helpers ---

export function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const encodedVal = encodeURIComponent(
    typeof value === 'object' ? JSON.stringify(value) : String(value)
  );
  document.cookie = `${name}=${encodedVal};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const cookiePrefix = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(cookiePrefix) === 0) {
      const raw = decodeURIComponent(c.substring(cookiePrefix.length));
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

// --- 🔐 Session & Auth Storage Helpers ---

export function saveAuthSession(user, token, role) {
  if (!user) return;

  const resolvedRole = role || user.role || user.roles || 'Admin';
  const cleanUser = {
    id: user.id || 1,
    name: user.name || user.full_name || 'Staff Member',
    email: user.email || (resolvedRole.toLowerCase().includes('admin') ? 'admin@gmail.com' : 'cashier@gmail.com'),
    role: resolvedRole,
    roles: resolvedRole,
  };

  const authToken = token || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Save in Cookies (7 days persistence)
  setCookie('auth_token', authToken, 7);
  setCookie('auth_user', cleanUser, 7);
  setCookie('auth_role', resolvedRole, 7);

  // 2. Save in sessionStorage (active tab session)
  try {
    sessionStorage.setItem('authUser', JSON.stringify(cleanUser));
    sessionStorage.setItem('authToken', authToken);
    sessionStorage.setItem('userRole', resolvedRole);
  } catch (e) {
    console.warn('sessionStorage not available:', e);
  }

  // 3. Save in localStorage (persistent cross-tab session)
  try {
    localStorage.setItem('authUser', JSON.stringify(cleanUser));
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userRole', resolvedRole);
  } catch (e) {
    console.warn('localStorage not available:', e);
  }

  return { user: cleanUser, token: authToken, role: resolvedRole };
}

export function getAuthSession() {
  // Check Cookie first
  const cookieUser = getCookie('auth_user');
  const cookieToken = getCookie('auth_token');
  const cookieRole = getCookie('auth_role');

  // Check sessionStorage
  let sessionUser = null;
  let sessionToken = null;
  let sessionRole = null;
  try {
    const sU = sessionStorage.getItem('authUser');
    if (sU) sessionUser = JSON.parse(sU);
    sessionToken = sessionStorage.getItem('authToken');
    sessionRole = sessionStorage.getItem('userRole');
  } catch (e) {
    // ignore
  }

  // Check localStorage
  let localUser = null;
  let localToken = null;
  let localRole = null;
  try {
    const lU = localStorage.getItem('authUser');
    if (lU) localUser = JSON.parse(lU);
    localToken = localStorage.getItem('authToken');
    localRole = localStorage.getItem('userRole');
  } catch (e) {
    // ignore
  }

  const user = cookieUser || sessionUser || localUser || null;
  const token = cookieToken || sessionToken || localToken || null;
  const role = cookieRole || sessionRole || localRole || user?.role || user?.roles || null;

  return {
    user,
    token,
    role,
    isAuthenticated: Boolean(user && (token || user.id)),
  };
}

export function clearAuthSession() {
  // Remove cookies
  removeCookie('auth_token');
  removeCookie('auth_user');
  removeCookie('auth_role');
  removeCookie('session_id');

  // Clear sessionStorage
  try {
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
  } catch (e) {
    // ignore
  }

  // Clear localStorage auth keys
  try {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
  } catch (e) {
    // ignore
  }
}

export function isRoleAdmin(role) {
  if (!role) return false;
  const r = String(role).toLowerCase();
  return r.includes('admin');
}

export function isRoleStaff(role) {
  if (!role) return false;
  const r = String(role).toLowerCase();
  return r.includes('cashier') || r.includes('staff') || r.includes('tech');
}

