import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiTool, 
  FiBell, 
  FiCheckCircle, 
  FiArrowRight,
  FiBox,
  FiClock,
  FiAlertTriangle
} from 'react-icons/fi';
import { FaHand } from 'react-icons/fa6';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    pendingRepairs: 0,
    completedRepairs: 0,
    unreadNotifs: 0,
    lowStockItems: []
  });

  // Load real-time metrics from localStorage on load
  useEffect(() => {
    // 1. Calculate sales metrics from notifications
    const notifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
    const salesNotifs = notifs.filter(n => n.type === 'SALE');
    const unread = notifs.filter(n => !n.read).length;

    let revenue = 0;
    salesNotifs.forEach(s => {
      const numericVal = parseFloat(s.amount.replace('$', '')) || 0;
      revenue += numericVal;
    });

    // 2. Calculate repair metrics
    const repairs = JSON.parse(localStorage.getItem('pos_repair_tickets') || '[]');
    const pending = repairs.filter(r => r.status !== 'Completed').length;
    const completed = repairs.filter(r => r.status === 'Completed').length;

    // 3. Calculate low stock products (threshold <= 5)
    const products = JSON.parse(localStorage.getItem('pos_products') || '[]');
    const lowStock = products.filter(p => Number(p.stock) <= 5);

    setStats({
      totalSales: revenue,
      salesCount: salesNotifs.length,
      pendingRepairs: pending,
      completedRepairs: completed,
      unreadNotifs: unread,
      lowStockItems: lowStock
    });
  }, []);

  const role = user?.role || 'Admin';

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Role Badge without "ROLE:" text */}
          <span className="text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full font-bold">
            {role}
          </span>
          
          <h1 className="text-2xl md:text-3xl font-black mt-3 flex items-center gap-2">
            <span>Welcome back, {user?.full_name || user?.name || 'User'}!</span>
            {/* <FaHand className="text-amber-300 animate-pulse" /> */}
          </h1>
          
          <p className="text-blue-100 text-xs md:text-sm mt-1">
            Here is your live performance summary for Angkor-Electronic today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'Cashier' && (
            <Link
              to="/pos"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>Open POS Terminal</span>
              <FiArrowRight />
            </Link>
          )}
          {role === 'Fixer' && (
            <Link
              to="/repairs"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>Manage Repairs</span>
              <FiArrowRight />
            </Link>
          )}
          {role === 'Admin' && (
            <Link
              to="/notifications"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl transition-all text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <FiBell />
              <span>View Alerts ({stats.unreadNotifs})</span>
            </Link>
          )}
        </div>
      </div>

      {/* STATS CARDS SECTION */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">
          {role} Overview & Quick Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* ADMIN STATS */}
          {role === 'Admin' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiDollarSign />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">${stats.totalSales.toFixed(2)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiShoppingBag />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Orders</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.salesCount}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiTool />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Repairs</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingRepairs}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiAlertTriangle />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                  <h3 className="text-2xl font-black text-rose-600 mt-1">{stats.lowStockItems.length}</h3>
                </div>
              </div>
            </>
          )}

          {/* CASHIER STATS */}
          {role === 'Cashier' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiShoppingBag />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions Today</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.salesCount}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiDollarSign />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">${stats.totalSales.toFixed(2)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiBox />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">POS Status</p>
                  <h3 className="text-lg font-extrabold text-emerald-600 mt-1">Online & Ready</h3>
                </div>
              </div>
            </>
          )}

          {/* FIXER STATS */}
          {role === 'Fixer' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiClock />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Repair Queue</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendingRepairs}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiCheckCircle />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Repairs</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.completedRepairs}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-sm">
                  <FiTool />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workbench Status</p>
                  <h3 className="text-lg font-extrabold text-blue-600 mt-1">Active</h3>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* LOW STOCK WARNING LIST (ADMIN ONLY) */}
      {role === 'Admin' && stats.lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <FiAlertTriangle className="text-rose-600" />
              <span>Low Stock Warning Items ({stats.lowStockItems.length})</span>
            </h3>
            <Link to="/suppliers" className="text-xs font-bold text-rose-600 hover:underline">
              Manage Inventory &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.lowStockItems.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">{item.name || item.title || 'Product'}</span>
                <span className="text-xs bg-rose-100 text-rose-700 font-black px-2.5 py-1 rounded-full">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}