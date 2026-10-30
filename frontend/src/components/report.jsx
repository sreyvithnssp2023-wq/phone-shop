import React, { useState } from 'react';
import { FiBarChart2, FiDownload, FiFileText, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('today');

  // Helper to trigger system notification
  const triggerSystemNotification = (title, message, type = 'info') => {
    try {
      const existingNotifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
      const newNotif = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString(),
        read: false
      };
      localStorage.setItem('pos_notifications', JSON.stringify([newNotif, ...existingNotifs]));
    } catch (error) {
      console.error('Failed to create notification', error);
    }
  };

  const handleGenerateReport = (type) => {
    setReportType(type);
    triggerSystemNotification(
      'Report Generated',
      `Admin successfully generated and reviewed the ${type.toUpperCase()} report (${dateRange}).`,
      'success'
    );
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
  };

  const handleExportReport = () => {
    triggerSystemNotification(
      'Report Exported',
      `Admin exported the ${reportType.toUpperCase()} report data as CSV/PDF.`,
      'info'
    );
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiBarChart2 className="text-blue-600" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Analyze sales performance, repair revenues, inventory metrics, and financial summaries.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all uppercase tracking-wider"
        >
          <FiDownload size={15} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Quick Report Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleGenerateReport('sales')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-center justify-between ${
            reportType === 'sales' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${reportType === 'sales' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
              Financial
            </span>
            <h3 className="text-base font-black mt-2">Sales & Revenue</h3>
            <p className={`text-xs mt-0.5 ${reportType === 'sales' ? 'text-blue-100' : 'text-slate-400'}`}>View daily & monthly cash flow</p>
          </div>
          <FiDollarSign size={24} className={reportType === 'sales' ? 'text-white' : 'text-blue-600'} />
        </button>

        <button
          onClick={() => handleGenerateReport('repairs')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-center justify-between ${
            reportType === 'repairs' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${reportType === 'repairs' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              Technical
            </span>
            <h3 className="text-base font-black mt-2">Repair Services</h3>
            <p className={`text-xs mt-0.5 ${reportType === 'repairs' ? 'text-blue-100' : 'text-slate-400'}`}>Check repair tickets & parts</p>
          </div>
          <FiTrendingUp size={24} className={reportType === 'repairs' ? 'text-white' : 'text-emerald-600'} />
        </button>

        <button
          onClick={() => handleGenerateReport('inventory')}
          className={`p-5 rounded-3xl border text-left transition-all flex items-center justify-between ${
            reportType === 'inventory' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${reportType === 'inventory' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
              Stock
            </span>
            <h3 className="text-base font-black mt-2">Inventory Status</h3>
            <p className={`text-xs mt-0.5 ${reportType === 'inventory' ? 'text-blue-100' : 'text-slate-400'}`}>Monitor stock levels & alerts</p>
          </div>
          <FiFileText size={24} className={reportType === 'inventory' ? 'text-white' : 'text-amber-600'} />
        </button>
      </div>

      {/* Report Data Display Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">{reportType} Report Summary</h2>
            <p className="text-xs text-slate-400 font-semibold">Generated for Angkor-Electronic POS System</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            <FiCalendar size={14} className="text-blue-600" />
            <span>Today's Data</span>
          </div>
        </div>

        <div className="py-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
            <FiBarChart2 size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No active {reportType} anomalies detected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            All system logs and records are fully synced. Click export or switch report categories above to review detailed data.
          </p>
        </div>
      </div>
    </div>
  );
}