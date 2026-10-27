import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, 
  FiShoppingBag, 
  FiTool, 
  FiActivity, 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiUserCheck,
  FiCalendar
} from 'react-icons/fi';

export default function Report({ user }) {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesRecords, setSalesRecords] = useState([]);
  const [repairRecords, setRepairRecords] = useState([]);
  const [auditRecords, setAuditRecords] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // 1. Load Sales from Notifications or Transactions
    const notifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
    const sales = notifs.filter(n => n.type === 'SALE');
    setSalesRecords(sales);

    let rev = 0;
    sales.forEach(s => {
      const val = parseFloat(s.amount?.replace('$', '')) || 0;
      rev += val;
    });
    setTotalRevenue(rev);

    // 2. Load Repair Tickets
    const repairs = JSON.parse(localStorage.getItem('pos_repair_tickets') || '[]');
    setRepairRecords(repairs);

    // 3. Load Audit Logs
    const audits = JSON.parse(localStorage.getItem('pos_audit_logs') || '[]');
    setAuditRecords(audits);
  }, []);

  const completedRepairsCount = repairRecords.filter(r => r.status === 'Completed').length;
  const pendingRepairsCount = repairRecords.filter(r => r.status !== 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiBarChart2 className="text-blue-600" />
            <span>Reports & Analytics Center</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Review comprehensive financial sales, technical service output, and staff audit logs.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FiShoppingBag size={14} />
            <span>Sales Report</span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'repairs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FiTool size={14} />
            <span>Repair Report</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <FiActivity size={14} />
            <span>Activity Audit Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SALES REPORT */}
      {activeTab === 'sales' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                <FiDollarSign />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">${totalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <FiShoppingBag />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders Processed</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{salesRecords.length}</h3>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 font-extrabold text-slate-800 text-sm">
              Recent Sales Transactions
            </div>
            {salesRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                No sales transactions recorded yet. Complete an order in the POS terminal to view data here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="p-4 font-bold">Transaction / Item</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesRecords.map((sale, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{sale.message || 'POS Sale Transaction'}</td>
                        <td className="p-4 font-black text-emerald-600">{sale.amount || '$0.00'}</td>
                        <td className="p-4 text-slate-500 font-medium">{sale.time || 'Recent'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REPAIR REPORT */}
      {activeTab === 'repairs' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <FiTool />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Repair Tickets</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{repairRecords.length}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl font-bold">
                <FiClock />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending / In Progress</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingRepairsCount}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                <FiCheckCircle />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Repairs</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{completedRepairsCount}</h3>
              </div>
            </div>
          </div>

          {/* Repairs Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 font-extrabold text-slate-800 text-sm">
              Repair & Service History
            </div>
            {repairRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm font-medium">
                No repair tickets registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Device Model</th>
                      <th className="p-4 font-bold">Issue Description</th>
                      <th className="p-4 font-bold">Estimated Cost</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {repairRecords.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{rep.customerName}</td>
                        <td className="p-4 text-slate-600 font-semibold">{rep.deviceModel}</td>
                        <td className="p-4 text-slate-500">{rep.problemDescription}</td>
                        <td className="p-4 font-bold text-slate-900">${rep.estimatedCost}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                            rep.status === 'Completed' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {rep.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-100 font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <FiUserCheck className="text-blue-600" />
            <span>Staff Login & Role Switch Activity Audit Trail</span>
          </div>
          {auditRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              No audit logs recorded yet. Switch roles or log in to generate activity records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="p-4 font-bold">Staff Name</th>
                    <th className="p-4 font-bold">Role</th>
                    <th className="p-4 font-bold">Action Performed</th>
                    <th className="p-4 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditRecords.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{log.name}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          {log.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{log.action}</td>
                      <td className="p-4 text-slate-400 text-xs font-semibold">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}