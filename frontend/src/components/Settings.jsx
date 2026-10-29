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
    }
  };

  return (
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
                Shop Name
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Shop Address / Location
              </label>
              <input
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
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
            </button>
          </form>
        </div>

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
              </div>
            </div>
          </div>

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
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}