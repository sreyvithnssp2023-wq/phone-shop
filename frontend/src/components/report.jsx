import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost/phone-shop/Backend/public/api';

export default function Reports() {
  const [period, setPeriod] = useState('daily');
  const [sales, setSales] = useState(null);
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sales');

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axios.get(`${API_BASE}/reports?period=${period}`);
      } catch (e) {
        res = await axios.get(`http://127.0.0.1:8000/api/reports?period=${period}`);
      }

      if (res && res.data) {
        setSales({
          totals: {
            revenue: Number(res.data.total_revenue || 0),
            orders: Number(res.data.total_orders || res.data.total_sales || 0),
          },
          data: (res.data.sales_report || []).map((item) => ({
            date: item.period || 'N/A',
            orders: Number(item.orders || 0),
            revenue: Number(item.revenue || 0),
          })),
        });

        setProducts(
          (res.data.product_performance || []).map((item) => ({
            name: item.product_name || 'N/A',
            units: Number(item.qty_sold || 0),
            revenue: Number(item.revenue || 0),
          }))
        );

        setCustomers(
          (res.data.customer_report || []).map((c, index) => ({
            id: index + 1,
            name: c.customer_name || 'General Customer',
            phone: c.phone || 'N/A',
            order_count: Number(c.orders || 0),
            total_spent: Number(c.total_spent || 0),
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [period]);

  // 📄 1. Export CSV
  const exportCsv = (rows, name) => {
    if (!rows || rows.length === 0) {
      toast.error('គ្មានទិន្នន័យសម្រាប់ Export ទេ!');
      return;
    }
    const header = Object.keys(rows[0]);
    const csv = [
      header.join(','),
      ...rows.map((r) =>
        header.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🖨️ 2. Export / Print PDF
  const exportPdf = (title, headers, rows) => {
    if (!rows || rows.length === 0) {
      toast.error('គ្មានទិន្នន័យសម្រាប់ Export PDF ទេ!');
      return;
    }

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - ${period.toUpperCase()}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 22px; margin-bottom: 5px; color: #1e293b; }
            p { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; uppercase; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Angkor Electronic — ${title}</h1>
          <p>របាយការណ៍សង្ខេប៖ ${period.toUpperCase()} | កាលបរិច្ឆេទបង្កើត៖ ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row) => `
                <tr>
                  ${Object.values(row)
                    .map((val) => `<td>${val}</td>`)
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="footer">
            Printed from POS System
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const tabs = [
    { key: 'sales', label: 'Sales Report' },
    { key: 'products', label: 'Product Performance' },
    { key: 'customers', label: 'Customer Report' },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {tab === 'sales' && (
            <div className="flex gap-1 bg-white border rounded-lg p-1 mr-2">
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize ${
                    period === p
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Export CSV */}
          <button
            onClick={() => {
              if (tab === 'sales') exportCsv(sales?.data || [], 'sales_report');
              if (tab === 'products') exportCsv(products || [], 'product_report');
              if (tab === 'customers') exportCsv(customers || [], 'customer_report');
            }}
            className="px-3 py-1.5 bg-white border hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm"
          >
            <FiDownload /> CSV
          </button>

          {/* Export PDF / Print */}
          <button
            onClick={() => {
              if (tab === 'sales') {
                exportPdf(
                  'Sales Report',
                  ['Period', 'Orders', 'Revenue ($)'],
                  (sales?.data || []).map((r) => ({
                    date: r.date,
                    orders: r.orders,
                    revenue: `$${r.revenue.toFixed(2)}`,
                  }))
                );
              } else if (tab === 'products') {
                exportPdf(
                  'Product Performance',
                  ['Product Name', 'Units Sold', 'Revenue ($)'],
                  (products || []).map((p) => ({
                    name: p.name,
                    units: p.units,
                    revenue: `$${p.revenue.toFixed(2)}`,
                  }))
                );
              } else if (tab === 'customers') {
                exportPdf(
                  'Customer Report',
                  ['Customer Name', 'Phone', 'Orders', 'Total Spent ($)'],
                  (customers || []).map((c) => ({
                    name: c.name,
                    phone: c.phone,
                    orders: c.order_count,
                    spent: `$${c.total_spent.toFixed(2)}`,
                  }))
                );
              }
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm transition"
          >
            <FiPrinter /> PDF
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sales Report */}
      {tab === 'sales' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold capitalize text-slate-800">Sales — {period}</h2>
            <span className="text-sm text-gray-500">
              Total Revenue:{' '}
              <strong className="text-lg font-bold text-indigo-600">
                ${(sales?.totals?.revenue || 0).toFixed(2)}
              </strong>{' '}
              · {sales?.totals?.orders || 0} orders
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales?.data?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-400">
                    No sales recorded for this period.
                  </td>
                </tr>
              ) : (
                sales?.data?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.date}</td>
                    <td className="px-4 py-3 text-slate-600">{row.orders}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">
                      ${(row.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Product Performance */}
      {tab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Product Performance</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Units Sold</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-400">
                    No product records found.
                  </td>
                </tr>
              ) : (
                products?.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                    <td className="px-4 py-3 text-slate-600">{row.units}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">
                      ${(row.revenue || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Customer Report */}
      {tab === 'customers' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Customer Report</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase text-gray-500 border-b">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    No customer records found.
                  </td>
                </tr>
              ) : (
                customers?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{c.order_count}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">
                      ${(c.total_spent || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}