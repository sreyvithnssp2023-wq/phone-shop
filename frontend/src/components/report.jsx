import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiDownload, FiFileText, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const API_BASE = "http://localhost/phone-shop/phone-shop/Backend/public/api";

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);

  // States
  const [salesData, setSalesData] = useState([]);
  const [repairsData, setRepairsData] = useState([]);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [salesRes, repairsRes, productsRes] = await Promise.all([
        fetch(`${API_BASE}/sales`).catch(() => null),
        fetch(`${API_BASE}/repairs`).catch(() => null),
        fetch(`${API_BASE}/products`).catch(() => null)
      ]);

      if (salesRes && salesRes.ok) {
        const sales = await salesRes.json();
        setSalesData(Array.isArray(sales) ? sales : (sales.data || []));
      }

      if (repairsRes && repairsRes.ok) {
        const repairs = await repairsRes.json();
        setRepairsData(Array.isArray(repairs) ? repairs : (repairs.data || []));
      }

      if (productsRes && productsRes.ok) {
        const products = await productsRes.json();
        setProductsData(Array.isArray(products) ? products : (products.data || []));
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalSalesAmount = salesData.reduce((sum, item) => sum + parseFloat(item.total_amount || item.grand_total || item.total || 0), 0);
  const totalRepairAmount = repairsData.reduce((sum, item) => sum + parseFloat(item.estimated_cost || 0), 0);
  const totalStockVal = productsData.reduce((sum, p) => sum + (parseFloat(p.price || 0) * parseInt(p.quantity || p.stock || 0)), 0);

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
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated!`);
  };

  const handleExportReport = () => {
    triggerSystemNotification(
      'Report Exported',
      `Admin exported the ${reportType.toUpperCase()} report data as PDF.`,
      'info'
    );
    toast.success('រៀបចំទាញយក PDF...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6 print:p-0 print:m-0">
      {/* CSS កំណត់ A4 Portrait Fit មិនឲ្យរើក ឬដាច់គែម */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        @media print {
          body { 
            background: #ffffff !important; 
            color: #000000 !important; 
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, nav, sidebar, button { display: none !important; }
          .print-header { display: block !important; }
          .print-summary { display: flex !important; justify-content: space-between !important; margin-bottom: 15px !important; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .border { border-color: #cbd5e1 !important; }
          table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
          th, td { word-wrap: break-word !important; padding: 6px 8px !important; }
        }
      `}</style>

      {/* Official Print Header (បង្ហាញតែក្នុង PDF / Print) */}
      <div className="hidden print-header mb-4 pb-3 border-b-2 border-slate-900">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">Angkor-Electronic POS</h1>
            <p className="text-xs text-slate-500 font-semibold">Official Business & Management Report</p>
          </div>
          <div className="text-right text-xs text-slate-600 font-medium">
            <p>Printed Date: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</p>
            <p className="uppercase font-bold text-blue-600 mt-0.5">Report Category: {reportType}</p>
          </div>
        </div>

        {/* Print Summary Metrics Bar */}
        <div className="print-summary hidden mt-3 pt-3 border-t border-slate-200">
          <div className="text-xs">
            <span className="text-slate-500">Total Entries: </span>
            <strong className="text-slate-900">
              {reportType === 'sales' ? salesData.length : reportType === 'repairs' ? repairsData.length : productsData.length} Records
            </strong>
          </div>
          <div className="text-xs">
            <span className="text-slate-500">Total Value: </span>
            <strong className="text-blue-600">
              ${reportType === 'sales' ? totalSalesAmount.toFixed(2) : reportType === 'repairs' ? totalRepairAmount.toFixed(2) : totalStockVal.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Screen Header Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
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
          <span>EXPORT REPORT</span>
        </button>
      </div>

      {/* Quick Report Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
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

      {/* Report Summary & Table Block */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4 print:p-0 print:border-none">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">{reportType} REPORT SUMMARY</h2>
            <p className="text-xs text-slate-400 font-semibold">Generated for Angkor-Electronic POS System</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            <FiCalendar size={14} className="text-blue-600" />
            <span>Today's Data</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-semibold">Loading report data...</div>
        ) : (
          <div className="overflow-x-auto">
            {/* 1. FINANCIAL / SALES REPORT TABLE */}
            {reportType === 'sales' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <th className="p-3 w-1/6">INVOICE #</th>
                    <th className="p-3 w-1/5">DATE</th>
                    <th className="p-3 w-1/4">CUSTOMER</th>
                    <th className="p-3 w-1/5">PAYMENT</th>
                    <th className="p-3 text-right w-1/5">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {salesData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 font-semibold">
                        No sales records found
                      </td>
                    </tr>
                  ) : (
                    salesData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-600">#{item.invoice_no || item.invoice_number || item.id}</td>
                        <td className="p-3 text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3 font-semibold">{item.customer_name || item.customer || 'Walk-in Customer'}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
                            {item.payment_type || item.payment_method || 'Cash'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          ${parseFloat(item.total_amount || item.grand_total || item.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {salesData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-black text-slate-900 bg-slate-50">
                      <td colSpan="4" className="p-3 uppercase text-right">Grand Total:</td>
                      <td className="p-3 text-right text-blue-600">${totalSalesAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}

            {/* 2. TECHNICAL / REPAIR REPORT TABLE */}
            {reportType === 'repairs' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <th className="p-3 w-1/6">TICKET CODE</th>
                    <th className="p-3 w-1/5">CUSTOMER</th>
                    <th className="p-3 w-1/5">PHONE</th>
                    <th className="p-3 w-1/5">DEVICE NAME</th>
                    <th className="p-3 w-1/6">STATUS</th>
                    <th className="p-3 text-right w-1/6">EST. COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {repairsData.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-12 text-slate-400 font-semibold">No repair tickets found</td></tr>
                  ) : (
                    repairsData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-600">{item.ticket_code || `#REP-${item.id}`}</td>
                        <td className="p-3 font-semibold">{item.customer_name}</td>
                        <td className="p-3 text-slate-500">{item.customer_phone || 'N/A'}</td>
                        <td className="p-3">{item.device_name}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status || 'Pending'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">${parseFloat(item.estimated_cost || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {repairsData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-black text-slate-900 bg-slate-50">
                      <td colSpan="5" className="p-3 uppercase text-right">Total Repair Value:</td>
                      <td className="p-3 text-right text-emerald-600">${totalRepairAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}

            {/* 3. STOCK / INVENTORY REPORT TABLE */}
            {reportType === 'inventory' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase border-b border-slate-200">
                    <th className="p-3 w-2/5">PRODUCT NAME</th>
                    <th className="p-3 w-1/5">UNIT PRICE</th>
                    <th className="p-3 text-center w-1/5">IN STOCK</th>
                    <th className="p-3 text-right w-1/5">TOTAL STOCK VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {productsData.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-semibold">No products found in stock</td></tr>
                  ) : (
                    productsData.map((item, idx) => {
                      const qty = parseInt(item.quantity || item.stock || 0);
                      const price = parseFloat(item.price || 0);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{item.name || item.product_name}</td>
                          <td className="p-3 font-semibold text-slate-600">${price.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              qty <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {qty} units
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-slate-900">${(price * qty).toFixed(2)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {productsData.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-black text-slate-900 bg-slate-50">
                      <td colSpan="3" className="p-3 uppercase text-right">Total Inventory Value:</td>
                      <td className="p-3 text-right text-amber-600">${totalStockVal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}