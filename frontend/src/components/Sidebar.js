import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Package, Layers, 
  Bell, FileText, Truck, ShieldCheck, User, Settings, Lock 
} from 'lucide-react';

const Sidebar = () => {
  // Role បច្ចុប្បន្ន (Admin, Cashier, Tech)
  const [currentRole, setCurrentRole] = useState('Admin');
  
  // State សម្រាប់ Modal Password
  const [showModal, setShowModal] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password កំណត់សម្រាប់ Role នីមួយៗ (អាចដូរតាមចិត្ត)
  const rolePasswords = {
    Admin: '1234',
    Cashier: '0000',
    Tech: '1111'
  };

  // ពេលអ្នកប្រើប្រាស់ចុចជ្រើសរើស Role ថ្មី
  const handleRoleChangeSelect = (e) => {
    const newRole = e.target.value;
    if (newRole !== currentRole) {
      setTargetRole(newRole);
      setPassword('');
      setErrorMsg('');
      setShowModal(true); // បើក Popup Password
    }
  };

  // ផ្ទៀងផ្ទាត់ Password
  const handleConfirmRole = () => {
    if (password === rolePasswords[targetRole]) {
      setCurrentRole(targetRole);
      setShowModal(false);
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Password មិនត្រឹមត្រូវទេ!');
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* 1. Header Profile */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}>AE</div>
        <div>
          <h4 style={{ margin: 0, color: '#fff' }}>Angkor-Electronic</h4>
          <span style={{ fontSize: '12px', color: '#8a99ad' }}>Chork Chansovanpanha</span>
        </div>
      </div>

      {/* 2. Dropdown ប្តូរ Role */}
      <div style={styles.roleDropdownContainer}>
        <select 
          value={currentRole} 
          onChange={handleRoleChangeSelect} 
          style={styles.select}
        >
          <option value="Admin">Admin (Chork)</option>
          <option value="Cashier">Cashier</option>
          <option value="Tech">Tech</option>
        </select>
      </div>

      {/* 3. Navigation Links (លាក់/បង្ហាញតាម Role) */}
      <nav style={styles.nav}>
        {/* Dashboard & POS: ឃើញទាំងអស់គ្នា */}
        <a href="/dashboard" style={styles.link}><LayoutDashboard size={18} /> Dashboard</a>
        <a href="/pos" style={styles.link}><ShoppingCart size={18} /> POS</a>

        {/* តែ Admin ទេដែលឃើញ Products, Categories, Suppliers, Reports, Settings */}
        {currentRole === 'Admin' && (
          <>
            <a href="/products" style={styles.link}><Package size={18} /> Products</a>
            <a href="/categories" style={styles.activeLink}><Layers size={18} /> Categories</a>
            <a href="/reports" style={styles.link}><FileText size={18} /> Reports</a>
            <a href="/suppliers" style={styles.link}><Truck size={18} /> Suppliers & Stock</a>
            <a href="/settings" style={styles.link}><Settings size={18} /> Settings</a>
          </>
        )}

        {/* តែ Admin និង Tech ទេដែលឃើញ Warranties & Repairs */}
        {(currentRole === 'Admin' || currentRole === 'Tech') && (
          <a href="/warranties" style={styles.link}><ShieldCheck size={18} /> Warranties</a>
        )}

        {/* Notifications & Profile: ឃើញទាំងអស់គ្នា */}
        <a href="/notifications" style={styles.link}><Bell size={18} /> Notifications</a>
        <a href="/profile" style={styles.link}><User size={18} /> My Profile</a>
      </nav>

      {/* 4. Password Pop-up Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <Lock size={32} color="#4f46e5" style={{ marginBottom: '10px' }} />
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>ផ្ទៀងផ្ទាត់ Password</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '15px' }}>
              សូមបញ្ចូល Password សម្រាប់ Role <b>{targetRole}</b>
            </p>

            <input 
              type="password" 
              placeholder="បញ្ចូល Password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            {errorMsg && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>{errorMsg}</p>}

            <div style={styles.modalActions}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>បោះបង់</button>
              <button onClick={handleConfirmRole} style={styles.confirmBtn}>យល់ព្រម</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Styles ងាយស្រួលតេស្ត (អាចដូរជា CSS/Tailwind បាន)
const styles = {
  sidebar: { width: '260px', backgroundColor: '#0f172a', padding: '20px', minHeight: '100vh', fontFamily: 'sans-serif' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  avatar: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  roleDropdownContainer: { marginBottom: '20px' },
  select: { width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', cursor: 'pointer' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
  link: { display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', textDecoration: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' },
  activeLink: { display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', backgroundColor: '#4f46e5', textDecoration: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', width: '320px', textAlign: 'center' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
  cancelBtn: { flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#334155', color: '#fff', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer' }
};

export default Sidebar;