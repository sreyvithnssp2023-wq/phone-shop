import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiBox,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

import { getApiBase } from '../api/client';

const API_BASE = getApiBase();

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 font-semibold">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default function Dashboard({ currentRole, currentUser }) {
  const [overview, setOverview] = useState({
    today_orders: 0,
    today_revenue: 0,
    total_products: 0,
    total_customers: 0,
    total_revenue: 0,
    recent_orders: [],
  });

  const [salesChart, setSalesChart] = useState({
    daily: [
      { date: 'Mon', revenue: 0 },
      { date: 'Tue', revenue: 0 },
      { date: 'Wed', revenue: 0 },
      { date: 'Thu', revenue: 0 },
      { date: 'Fri', revenue: 0 },
      { date: 'Sat', revenue: 0 },
      { date: 'Sun', revenue: 0 },
    ],
    weekly: [
      { date: 'Week 1', revenue: 0 },
      { date: 'Week 2', revenue: 0 },
      { date: 'Week 3', revenue: 0 },
      { date: 'Week 4', revenue: 0 },
    ],
    monthly: [
      { date: 'Jan', revenue: 0 },
      { date: 'Feb', revenue: 0 },
      { date: 'Mar', revenue: 0 },
      { date: 'Apr', revenue: 0 },
      { date: 'May', revenue: 0 },
      { date: 'Jun', revenue: 0 },
      { date: 'Jul', revenue: 0 },
      { date: 'Aug', revenue: 0 },
      { date: 'Sep', revenue: 0 },
      { date: 'Oct', revenue: 0 },
      { date: 'Nov', revenue: 0 },
      { date: 'Dec', revenue: 0 },
    ],
  });

  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/dashboard?period=${selectedPeriod}`);
      if (res.data && (res.data.todays_orders !== undefined || res.data.today_orders !== undefined)) {
        const data = res.data;

        const formattedRecentOrders = (data.recent_orders || []).map((o) => ({
          id: o.sale_id || o.id,
          order_number: `${o.sale_id || o.id}`,
          customer_name: o.customer_name || 'POS Customer',
          total: Number(o.total_amount || o.total || 0),
          currency: 'USD',
          payment_status: o.payment_status ? o.payment_status.toLowerCase() : 'paid',
          order_status: 'completed',
        }));

        setOverview({
          today_orders: data.todays_orders ?? data.today_orders ?? 0,
          today_revenue: Number(data.todays_revenue ?? data.today_revenue ?? 0),
          total_products: data.total_products ?? 0,
          total_customers: data.total_customers ?? 0,
          total_revenue: Number(data.total_revenue ?? 0),
          recent_orders: formattedRecentOrders,
        });

        const rawDaily = data.daily || data.daily_chart || data.chart_data || data.chartData || [];
        const rawWeekly = data.weekly || data.weekly_chart || data.weekly_chart_data || [];
        const rawMonthly = data.monthly || data.monthly_chart || data.monthly_chart_data || [];

        const mapChartItems = (arr, fallbackArr) => {
          if (!Array.isArray(arr) || arr.length === 0) return fallbackArr;
          return arr.map((item) => ({
            date: item.day || item.date || item.name || '',
            revenue: Number(item.revenue ?? item.amount ?? item.sales ?? 0),
          }));
        };

        setSalesChart({
          daily: mapChartItems(rawDaily, salesChart.daily),
          weekly: mapChartItems(rawWeekly, salesChart.weekly),
          monthly: mapChartItems(rawMonthly, salesChart.monthly),
        });
        return;
      }
    } catch (err) {
      console.warn('Dashboard API route not found, switching to fallback aggregation...', err);
    }

    try {
      const [salesRes, productsRes, usersRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/sales`),
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/users`),
      ]);

      const sales = salesRes.status === 'fulfilled' && Array.isArray(salesRes.value.data)
        ? salesRes.value.data
        : salesRes.value?.value?.data?.data || [];

      const products = productsRes.status === 'fulfilled' && Array.isArray(productsRes.value.data)
        ? productsRes.value.data
        : productsRes.value?.value?.data?.data || [];

      const users = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)
        ? usersRes.value.data
        : usersRes.value?.value?.data?.data || [];

      const todayStr = new Date().toISOString().split('T')[0];
      let todayOrdersCount = 0;
      let todayRev = 0;
      let totalRev = 0;

      const recent = sales.slice(-5).reverse().map((o) => ({
        id: o.id,
        order_number: `${o.id}`,
        customer_name: o.customer_name || 'POS Customer',
        total: Number(o.total_amount || o.total || 0),
        currency: 'USD',
        payment_status: 'paid',
        order_status: 'completed',
      }));

      sales.forEach((sale) => {
        const amt = Number(sale.total_amount || sale.total || 0);
        totalRev += amt;
        const saleDate = sale.created_at ? sale.created_at.split('T')[0] : '';
        if (saleDate === todayStr) {
          todayOrdersCount += 1;
          todayRev += amt;
        }
      });

      setOverview({
        today_orders: todayOrdersCount,
        today_revenue: todayRev,
        total_products: products.length,
        total_customers: users.length,
        total_revenue: totalRev,
        recent_orders: recent,
      });

    } catch (fallbackErr) {
      console.error('Fallback aggregation error:', fallbackErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const currentChartData = salesChart[period] || [];

  const chartData = {
    labels: currentChartData.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue ($)',
        data: currentChartData.map((d) => d.revenue),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  const displayName = currentUser?.name || 'Brovith';

  return (
    <div className="p-1 sm:p-2 space-y-4 sm:space-y-6 font-sans select-none">
      {/* 🟢 ចាប់ផ្តើមភ្លាមៗពី Dashboard Overview ដោយគ្មាន Banner ពណ៌ខៀវស្ទួន */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-bold text-indigo-600">{displayName}</span> ({currentRole || 'Cashier'})
          </p>
        </div>
        <button
          onClick={() => alert('Storefront preview coming soon.')}
          className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition text-center"
        >
          View my storefront ↗
        </button>
      </div>

      {/* Metrics Cards ទាំង ៥ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Today's Orders"
          value={overview.today_orders}
          loading={loading}
          icon={<FiShoppingBag />}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          label="Today's Revenue"
          value={`$${overview.today_revenue.toFixed(2)}`}
          loading={loading}
          icon={<FiDollarSign />}
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Total Products"
          value={overview.total_products}
          loading={loading}
          icon={<FiPackage />}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Total Customers"
          value={overview.total_customers}
          loading={loading}
          icon={<FiUsers />}
          color="bg-rose-100 text-rose-600"
        />
        <StatCard
          label="Total Revenue"
          value={`$${overview.total_revenue.toFixed(2)}`}
          loading={loading}
          icon={<FiBox />}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Sales Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-slate-800">Sales Chart</h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  period === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56 sm:h-64 md:h-72 w-full">
          <Line
            key={`${period}-${JSON.stringify(chartData)}`}
            redraw={true}
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Orders</h2>
          <Link to="/pos" className="text-xs text-indigo-600 hover:underline font-bold">
            Go to POS ➔
          </Link>
        </div>
        {overview.recent_orders.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-xs">
            {loading ? 'Loading stats...' : 'No orders recorded in MySQL Database.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr className="bg-slate-50 text-left uppercase text-slate-400 font-bold border-b border-slate-100 whitespace-nowrap">
                  <th className="px-4 sm:px-5 py-3">Order</th>
                  <th className="px-4 sm:px-5 py-3">Customer</th>
                  <th className="px-4 sm:px-5 py-3">Total</th>
                  <th className="px-4 sm:px-5 py-3">Payment</th>
                  <th className="px-4 sm:px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {overview.recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="px-4 sm:px-5 py-3 font-mono font-bold text-indigo-600">
                      #{o.order_number}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-slate-800 font-bold">{o.customer_name}</td>
                    <td className="px-4 sm:px-5 py-3 font-bold text-slate-900">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${STATUS_COLORS[o.order_status] || STATUS_COLORS.completed}`}>
                        {o.order_status}
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
  );
}