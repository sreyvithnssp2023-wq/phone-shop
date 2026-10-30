import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { FiBell, FiCheck, FiTrash2, FiEye, FiX, FiTool, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState(null);

  useEffect(() => {
    const loadNotifs = () => {
      const saved = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
      setNotifications(saved);
    };
    loadNotifs();
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('pos_notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('pos_notifications');
    toast.success('Notifications cleared');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiBell className="text-blue-600" />
            <span>Activity Notifications & Log</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Real-time sales alerts from Cashiers and device repair updates with damage photos from Technicians.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <FiCheck size={14} />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={clearAll}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
          >
            <FiTrash2 size={14} />
            <span>Clear All</span>
=======
import {
  FiBell,
  FiShoppingCart,
  FiAlertTriangle,
  FiTrash2,
  FiCheck,
  FiClock,
  FiDollarSign,
} from 'react-icons/fi';

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  // ទាញយកទិន្នន័យពី localStorage (បើគ្មានទេ គឺកំណត់ឱ្យស្មើទទេ [])
  const loadNotifications = () => {
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications([]);
      localStorage.setItem('app_notifications', JSON.stringify([]));
    }
  };

  useEffect(() => {
    loadNotifications();

    // ស្ដាប់ Event ពេលមានការលក់ថ្មី ឬស្តុកទំនិញថយចុះពី POS
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notifications_updated', handleUpdate);
    return () => window.removeEventListener('notifications_updated', handleUpdate);
  }, []);

  const saveToStorage = (data) => {
    setNotifications(data);
    localStorage.setItem('app_notifications', JSON.stringify(data));
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveToStorage(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបការជូនដំណឹងទាំងអស់មែនទេ?')) {
      saveToStorage([]);
    }
  };

  const handleMarkSingleRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveToStorage(updated);
  };

  const handleDeleteSingle = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveToStorage(updated);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'sale') return item.type === 'sale';
    if (activeFilter === 'stock') return item.type === 'stock';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans select-none">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 text-blue-600 mb-1">
            <FiBell className="text-2xl" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Activity Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                {unreadCount} ថ្មី
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 pl-8">
            Real-time sales alerts from POS checkout and low stock warnings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FiCheck className="text-sm" />
            <span>អានទាំងអស់</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <FiTrash2 className="text-sm" />
            <span>លុបទាំងអស់</span>
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-sm font-medium">
            No notifications available.
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <div 
              key={notif.id || idx} 
              className={`bg-white p-5 rounded-2xl shadow-sm border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                notif.read ? 'border-slate-200' : 'border-blue-500 bg-blue-50/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  notif.type === 'SALE' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {notif.type === 'SALE' ? <FiShoppingBag /> : <FiTool />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
                      {notif.type || 'SYSTEM'}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 mt-1">
                    {notif.message}
                  </h3>

                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    {notif.amount && <span className="font-bold text-slate-900">Amount/Cost: {notif.amount}</span>}
                  </div>

                  {/* If Notification has Photos attached, show inspection button */}
                  {notif.photos && notif.photos.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPhotos(notif.photos)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <FiEye size={14} />
                        <span>Inspect Damage Photos ({notif.photos.length})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp consistently displayed on the right */}
              <div className="text-xs font-bold text-slate-400 shrink-0 md:text-right">
                {notif.time || notif.timestamp || 'Recent'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* INSPECTION MODAL FOR MULTI-PHOTOS */}
      {selectedPhotos && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPhotos(null)}
              className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-base font-black text-slate-900 mb-4">Initial Damage Photos Inspection</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedPhotos.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 h-64 flex items-center justify-center">
                  <img src={img} alt={`Damage Detail ${i + 1}`} className="max-h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

=======
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>ទាំងអស់ ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('sale')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeFilter === 'sale'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FiShoppingCart className="text-sm" />
          <span>ការគិតលុយ/លក់ (POS Sales)</span>
        </button>

        <button
          onClick={() => setActiveFilter('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeFilter === 'stock'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FiAlertTriangle className="text-sm" />
          <span>ស្តុកទំនិញ (Low Stock)</span>
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <FiBell className="text-4xl text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">គ្មានការជូនដំណឹងនៅឡើយទេ</h3>
          <p className="text-xs text-slate-400 mt-1">
            រាល់ពេលមានការគិតលុយក្នុង POS ឬទំនិញជិតអស់ស្តុក វានឹងលោតប្រាប់នៅទីនេះស្វ័យប្រវត្តិ។
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkSingleRead(item.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 cursor-pointer relative overflow-hidden ${
                item.isRead
                  ? 'bg-white border-slate-100 opacity-80 hover:opacity-100'
                  : 'bg-blue-50/40 border-blue-200 shadow-sm'
              }`}
            >
              {!item.isRead && (
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
              )}

              <div className="flex items-start gap-3.5 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm ${
                    item.type === 'sale'
                      ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      : 'bg-amber-100 text-amber-600 border border-amber-200'
                  }`}
                >
                  {item.type === 'sale' ? <FiShoppingCart /> : <FiAlertTriangle />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 font-semibold flex-wrap">
                    <span className="flex items-center gap-1 text-slate-500">
                      <FiClock className="text-xs" />
                      {item.time} ({item.date})
                    </span>
                    <span className="text-slate-500">
                      អ្នកប្រតិបត្តិ ៖ <b className="text-slate-700">{item.cashier}</b>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch gap-2 flex-shrink-0">
                {item.amount && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-sm">
                    <FiDollarSign className="text-xs" />
                    {item.amount}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSingle(item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition mt-auto"
                  title="លុបចោល"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
>>>>>>> 7436276f0a05997a9e6e648fec0345256a4fc6f4
    </div>
  );
}