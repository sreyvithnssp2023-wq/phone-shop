import React, { useState, useEffect } from 'react';
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
          </button>
        </div>
      </div>

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

    </div>
  );
}