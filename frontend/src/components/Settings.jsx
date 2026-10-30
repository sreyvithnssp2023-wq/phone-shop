import React, { useState } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiClock, 
  FiDollarSign, 
  FiInfo, 
  FiCamera, 
  FiUpload,
  FiDatabase,
  FiDownload,
  FiBell,
  FiTrash2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Settings({ user }) {
  // 1. Shop Information State
  const [shopInfo, setShopInfo] = useState(() => {
    const saved = localStorage.getItem('pos_shop_info');
    return saved ? JSON.parse(saved) : {
      name: 'Angkor-Electronic',
      phone: '012 345 678',
      email: 'contact@angkor-electronic.com',
      address: '#123, Preah Sihanouk Blvd, Phnom Penh, Cambodia',
      logo: null
    };
  });

  // 2. Business Hours State
  const defaultHours = [
    { day: 'Monday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Tuesday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Wednesday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Thursday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Friday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Saturday', open: '08:00 AM', close: '07:00 PM', active: true },
    { day: 'Sunday', open: 'Closed', close: 'Closed', active: false }
  ];

  const [businessHours, setBusinessHours] = useState(() => {
    const saved = localStorage.getItem('pos_business_hours');
    return saved ? JSON.parse(saved) : defaultHours;
  });

  // 3. Service Pricing Configuration State
  const defaultServices = [
    { id: 1, service: 'Screen Replacement', unit: 'Per Device', price: '45.00' },
    { id: 2, service: 'Battery Replacement', unit: 'Per Device', price: '25.00' },
    { id: 3, service: 'Software Flashing / Unlocking', unit: 'Per Item', price: '15.00' },
    { id: 4, service: 'Camera Glass Repair', unit: 'Per Device', price: '20.00' },
    { id: 5, service: 'Motherboard Diagnostic', unit: 'Per Unit', price: '30.00' }
  ];

  const [servicePrices, setServicePrices] = useState(() => {
    const saved = localStorage.getItem('pos_service_prices');
    return saved ? JSON.parse(saved) : defaultServices;
  });

  // Save Handlers
  const handleSaveShopInfo = (e) => {
    e.preventDefault();
    localStorage.setItem('pos_shop_info', JSON.stringify(shopInfo));
    toast.success('Shop details updated successfully!');
  };

  const handleSaveHours = (e) => {
    e.preventDefault();
    localStorage.setItem('pos_business_hours', JSON.stringify(businessHours));
    toast.success('Business operating hours saved!');
  };

  const handleSavePricing = (e) => {
    e.preventDefault();
    localStorage.setItem('pos_service_prices', JSON.stringify(servicePrices));
    toast.success('Service pricing configuration saved!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopInfo(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleDay = (index) => {
    const updated = [...businessHours];
    updated[index].active = !updated[index].active;
    if (!updated[index].active) {
      updated[index].open = 'Closed';
      updated[index].close = 'Closed';
    } else {
      updated[index].open = '08:00 AM';
      updated[index].close = '07:00 PM';
    }
    setBusinessHours(updated);
  };

  const handlePriceChange = (id, newPrice) => {
    const updated = servicePrices.map(item =>
      item.id === id ? { ...item, price: newPrice } : item
    );
    setServicePrices(updated);
  };

  // --- NEW: Data Backup & Restore Handlers ---
  const handleExportBackup = () => {
    try {
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        backupData[key] = localStorage.getItem(key);
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `angkor_electronic_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('System backup downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate backup data.');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        Object.keys(importedData).forEach(key => {
          localStorage.setItem(key, importedData[key]);
        });
        toast.success('System data restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      } catch (error) {
        toast.error('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  // --- NEW: Clear Notifications History Handler ---
  const handleClearNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notification history?')) {
      // Remove common notification keys used in storage
      localStorage.removeItem('pos_notifications');
      localStorage.removeItem('notifications');
      toast.success('Notification history cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <FiSettings className="text-blue-600" />
          <span>System Settings & Configuration</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Configure shop details, operating schedule, service pricing, data backups, and notifications.
        </p>
      </div>

      {/* Grid Layout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARD 1: SHOP INFORMATION */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FiInfo size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Shop Information</h2>
                <p className="text-[11px] text-slate-400 font-semibold">Update store contact details</p>
              </div>
            </div>

            <form id="shop-form" onSubmit={handleSaveShopInfo} className="space-y-4 mt-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopInfo.name}
                  onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={shopInfo.phone}
                  onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={shopInfo.email}
                  onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Store Address</label>
                <textarea
                  rows="2"
                  value={shopInfo.address}
                  onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Store Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {shopInfo.logo ? (
                      <img src={shopInfo.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <FiCamera className="text-slate-400" size={18} />
                    )}
                  </div>
                  <label className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <FiUpload size={14} />
                    <span>Change Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="shop-form"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all mt-4"
          >
            <FiSave size={14} />
            <span>Save Changes</span>
          </button>
        </div>

        {/* CARD 2: BUSINESS HOURS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <FiClock size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Business Hours</h2>
                <p className="text-[11px] text-slate-400 font-semibold">Set store operating schedule</p>
              </div>
            </div>

            <form id="hours-form" onSubmit={handleSaveHours} className="space-y-3 mt-5">
              {businessHours.map((item, idx) => (
                <div key={item.day} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="font-bold text-slate-700 w-24">{item.day}</span>
                  
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <input
                      type="text"
                      disabled={!item.active}
                      value={item.open}
                      onChange={(e) => {
                        const updated = [...businessHours];
                        updated[idx].open = e.target.value;
                        setBusinessHours(updated);
                      }}
                      className="w-16 border border-slate-200 rounded-lg px-1.5 py-1 text-center font-medium disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span>-</span>
                    <input
                      type="text"
                      disabled={!item.active}
                      value={item.close}
                      onChange={(e) => {
                        const updated = [...businessHours];
                        updated[idx].close = e.target.value;
                        setBusinessHours(updated);
                      }}
                      className="w-16 border border-slate-200 rounded-lg px-1.5 py-1 text-center font-medium disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      item.active ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      item.active ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}
            </form>
          </div>

          <button
            type="submit"
            form="hours-form"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all mt-4"
          >
            <FiSave size={14} />
            <span>Save Changes</span>
          </button>
        </div>

        {/* CARD 3: PRICING CONFIGURATION */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <FiDollarSign size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Pricing Configuration</h2>
                <p className="text-[11px] text-slate-400 font-semibold">Manage standard repair service prices</p>
              </div>
            </div>

            <form id="pricing-form" onSubmit={handleSavePricing} className="space-y-3 mt-5">
              <div className="grid grid-cols-12 text-[10px] font-black uppercase text-slate-400 pb-1 border-b">
                <span className="col-span-6">Service</span>
                <span className="col-span-3 text-center">Unit</span>
                <span className="col-span-3 text-right">Price ($)</span>
              </div>

              {servicePrices.map((serv) => (
                <div key={serv.id} className="grid grid-cols-12 items-center text-xs py-1 border-b border-slate-50 last:border-0">
                  <span className="col-span-6 font-bold text-slate-800 truncate pr-2">{serv.service}</span>
                  <span className="col-span-3 text-[10px] font-medium text-slate-400 text-center">{serv.unit}</span>
                  <div className="col-span-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={serv.price}
                      onChange={(e) => handlePriceChange(serv.id, e.target.value)}
                      className="w-16 border border-slate-200 rounded-lg px-1.5 py-1 text-right font-black text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </form>
          </div>

          <button
            type="submit"
            form="pricing-form"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all mt-4"
          >
            <FiSave size={14} />
            <span>Save Changes</span>
          </button>
        </div>

      </div>

      {/* ADDITIONAL ROW: DATA BACKUP & NOTIFICATION CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 4: DATA BACKUP & RESTORE */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FiDatabase size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">System Data Backup & Restore</h2>
              <p className="text-[11px] text-slate-400 font-semibold">Export or restore system local storage records</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Download a full backup JSON file of your products, transactions, settings, and inventory data, or restore state from a prior backup file.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
            >
              <FiDownload size={15} />
              <span>Download Backup (.JSON)</span>
            </button>

            <label className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider">
              <FiUpload size={15} />
              <span>Restore Data</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>
        </div>

        {/* CARD 5: NOTIFICATION HISTORY MANAGEMENT */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <FiBell size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Notification History</h2>
              <p className="text-[11px] text-slate-400 font-semibold">Manage system alerts and notification logs</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Clear past stock alerts, low-inventory notifications, and system logs stored in your active session history.
          </p>

          <div className="pt-2">
            <button
              onClick={handleClearNotifications}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all uppercase tracking-wider shadow-sm"
            >
              <FiTrash2 size={15} />
              <span>Clear All Notification History</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}