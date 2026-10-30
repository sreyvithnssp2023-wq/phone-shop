<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiSettings, 
  FiShoppingBag, 
  FiUsers, 
  FiDatabase, 
  FiSave, 
  FiRefreshCw, 
  FiDownload, 
  FiUpload 
} from 'react-icons/fi';

export default function Settings({ user }) {
  const [shopInfo, setShopInfo] = useState({
    name: 'Angkor-Electronic',
    phone: '+855 12 345 678',
    address: 'Phnom Penh, Cambodia',
    currency: 'USD ($)'
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('pos_shop_settings');
    if (saved) {
      setShopInfo(JSON.parse(saved));
    }
  }, []);

  const handleSaveShopInfo = (e) => {
    e.preventDefault();
    localStorage.setItem('pos_shop_settings', JSON.stringify(shopInfo));
    toast.success('Shop settings updated successfully!');
  };

  // 1. Export Backup Function
  const handleExportBackup = () => {
    const backupData = {
      shopSettings: JSON.parse(localStorage.getItem('pos_shop_settings') || '{}'),
      notifications: JSON.parse(localStorage.getItem('pos_notifications') || '[]'),
      repairTickets: JSON.parse(localStorage.getItem('pos_repair_tickets') || '[]'),
      userSession: JSON.parse(localStorage.getItem('pos_user') || '{}'),
      exportedAt: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `angkor_pos_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast.success('Backup file exported successfully!');
  };

  // 2. Restore Backup Function
  const handleRestoreBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        if (parsed.shopSettings) localStorage.setItem('pos_shop_settings', JSON.stringify(parsed.shopSettings));
        if (parsed.notifications) localStorage.setItem('pos_notifications', JSON.stringify(parsed.notifications));
        if (parsed.repairTickets) localStorage.setItem('pos_repair_tickets', JSON.stringify(parsed.repairTickets));
        
        toast.success('Data restored successfully! Refreshing app...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        toast.error('Invalid backup file format!');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystemData = () => {
    if (window.confirm('Are you sure you want to clear all sales notifications and repair tickets?')) {
      localStorage.removeItem('pos_notifications');
      localStorage.removeItem('pos_repair_tickets');
      toast.success('System logs and transaction data cleared!');
      window.location.reload();
=======
import React, { useState } from 'react';
import {
  FiShoppingBag,
  FiUsers,
  FiDatabase,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiSave,
  FiTrash2,
} from 'react-icons/fi';

export default function Settings() {
  const [shopName, setShopName] = useState('Angkor-Electronic');
  const [contactPhone, setContactPhone] = useState('+855 12 345 678');
  const [shopAddress, setShopAddress] = useState('Phnom Penh, Cambodia');
  const [currency, setCurrency] = useState('USD ($)');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleClearLogs = () => {
    if (window.confirm('តើអ្នកពិតជាចង់លុប System Cache & Activity Logs ទាំងអស់មែនទេ?')) {
      alert('បានសម្អាត System Logs រួចរាល់!');
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
    }
  };

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
          <FiSettings className="text-blue-600" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your shop profile details, system parameters, backup data, and role credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Shop Profile Form (7 columns) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
            <FiShoppingBag className="text-blue-600" />
            <span>Shop Profile Settings</span>
          </h2>

          <form onSubmit={handleSaveShopInfo} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
=======
    <div className="p-6 max-w-7xl mx-auto font-sans select-none">
      {/* Subtitle / Header info */}
      <p className="text-xs font-medium text-slate-500 mb-6">
        Manage your shop profile details, system parameters, backup data, and role credentials.
      </p>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Shop Profile Settings */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-6 pb-3 border-b border-slate-100">
            <FiShoppingBag className="text-blue-600 text-base" />
            <span>Shop Profile Settings</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
                Shop Name
              </label>
              <input
                type="text"
<<<<<<< HEAD
                value={shopInfo.name}
                onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
=======
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
              />
            </div>

            <div>
<<<<<<< HEAD
              <label className="text-xs font-semibold text-slate-700 block mb-1">
=======
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
                Contact Phone
              </label>
              <input
                type="text"
<<<<<<< HEAD
                value={shopInfo.phone}
                onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
=======
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
              />
            </div>

            <div>
<<<<<<< HEAD
              <label className="text-xs font-semibold text-slate-700 block mb-1">
=======
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
                Shop Address / Location
              </label>
              <input
                type="text"
<<<<<<< HEAD
                value={shopInfo.address}
                onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
=======
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
              />
            </div>

            <div>
<<<<<<< HEAD
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Default Currency
              </label>
              <select
                value={shopInfo.currency}
                onChange={(e) => setShopInfo({ ...shopInfo, currency: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="KHR (៛)">Riel (៛)</option>
                <option value="USD ($) / KHR (៛)">Dual Currency (USD / KHR)</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5"
            >
              <FiSave size={14} /> Save Changes
=======
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="KHR (៛)">KHR (៛)</option>
              </select>
            </div>

            {savedMsg && (
              <p className="text-xs font-bold text-emerald-600 animate-pulse mt-2">
                ✓ រក្សាទុកការផ្លាស់ប្តូរជោគជ័យ!
              </p>
            )}

            <button
              type="submit"
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <FiSave className="text-sm" />
              <span>Save Changes</span>
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
            </button>
          </form>
        </div>

<<<<<<< HEAD
        {/* RIGHT: System Roles & Backup Tools (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Accounts Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b pb-3">
              <FiUsers className="text-blue-600" />
              <span>Role Credentials Overview</span>
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">Admin</span>
                <span className="font-mono text-slate-500">user: admin / pass: 123456</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">Cashier</span>
                <span className="font-mono text-slate-500">user: cashier / pass: 123456</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800">Fixer</span>
                <span className="font-mono text-slate-500">user: fixer / pass: 123456</span>
=======
        {/* Right Column: Cards Stack */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Role Credentials Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-4 pb-3 border-b border-slate-100">
              <FiUsers className="text-blue-600 text-base" />
              <span>Role Credentials Overview</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800">Admin</span>
                <span className="font-mono text-slate-500 text-[11px]">user: admin / pass: 123456</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800">Cashier</span>
                <span className="font-mono text-slate-500 text-[11px]">user: cashier / pass: 123456</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800">Fixer</span>
                <span className="font-mono text-slate-500 text-[11px]">user: fixer / pass: 123456</span>
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
              </div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Backup & Restore Data Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2 border-b pb-3">
              <FiDatabase className="text-blue-600" />
              <span>Data Backup & Restore</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Export system logs, sales records, and repair tickets into a backup JSON file or restore from a file.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleExportBackup}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
              >
                <FiDownload size={14} /> Export Backup (.JSON)
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
              >
                <FiUpload size={14} /> Restore from Backup
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRestoreBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone / Data Reset */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-200">
            <h2 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-2 border-b border-rose-100 pb-3">
              <FiRefreshCw />
              <span>System Reset</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Clear local transaction caches, activity notifications, and test repair tickets.
            </p>
            <button
              onClick={handleResetSystemData}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
            >
              <FiRefreshCw size={14} /> Clear All Local Logs
=======
          {/* Card 2: Data Backup & Restore */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
              <FiDatabase className="text-blue-600 text-base" />
              <span>Data Backup & Restore</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Export system logs, sales records, and repair tickets into a backup JSON file or restore from a file.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => alert('កំពុងទាញយកឯកសារ Backup (JSON)...')}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FiDownload className="text-sm" />
                <span>Export Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => alert('សូមជ្រើសរើសឯកសារ JSON ដើម្បី Restore')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <FiUpload className="text-sm" />
                <span>Restore from Backup</span>
              </button>
            </div>
          </div>

          {/* Card 3: System Reset */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <FiRefreshCw className="text-base" />
              <span>System Reset</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Clear local transaction caches, activity notifications, and test repair tickets.
            </p>

            <button
              type="button"
              onClick={handleClearLogs}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <FiTrash2 className="text-sm" />
              <span>Clear All Local Logs</span>
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}