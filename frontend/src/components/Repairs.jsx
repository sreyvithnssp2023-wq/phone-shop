import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiTool,
  FiPlus,
  FiSearch,
  FiX,
  FiCamera,
  FiImage
} from 'react-icons/fi';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost/phone-shop/Backend/public/api';
const NATIVE_API = 'http://localhost/phone-shop/repairs.php';

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    ticket_code: '',
    customer_name: '',
    customer_phone: '',
    device_name: '',
    problem_description: '',
    estimated_cost: '',
    technician_name: 'Admin',
    status: 'Pending',
    damage_images: [],
  });

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await axios.get(`${API_BASE}/repairs`);
      } catch (err) {
        res = await axios.get(NATIVE_API);
      }
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRepairs(list);
    } catch (err) {
      console.error('Error fetching repairs:', err);
      toast.error('មិនអាចទាញយកទិន្នន័យ Repairs បានទេ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleOpenModal = () => {
    setImagePreview(null);
    setForm({
      ticket_code: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_name: '',
      customer_phone: '',
      device_name: '',
      problem_description: '',
      estimated_cost: '',
      technician_name: 'Admin',
      status: 'Pending',
      damage_images: [],
    });
    setModalOpen(true);
  };

  // ជំនួយការបម្លែងរូបថតជា Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setForm(prev => ({
          ...prev,
          damage_images: [reader.result]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.device_name) {
      toast.error('សូមបញ្ចូលឈ្មោះអតិថិជន និងឈ្មោះឧបករណ៍!');
      return;
    }

    setSubmitting(true);
    try {
      try {
        await axios.post(`${API_BASE}/repairs`, form);
      } catch (err) {
        await axios.post(NATIVE_API, form);
      }

      toast.success('🎉 បង្កើត Ticket ជួសជុលជោគជ័យ!');
      setModalOpen(false);
      fetchRepairs();
    } catch (err) {
      console.error(err);
      toast.error('មិនអាចរក្សាទុកទិន្នន័យបានទេ!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketCodeOrId, newStatus) => {
    try {
      try {
        await axios.put(`${API_BASE}/repairs/${ticketCodeOrId}`, { status: newStatus });
      } catch (err) {
        await axios.post(NATIVE_API, {
          _method: 'PUT',
          ticket_code: ticketCodeOrId,
          status: newStatus,
        });
      }

      toast.success(`ប្តូរស្ថានភាពទៅជា ${newStatus} រួចរាល់!`);
      fetchRepairs();
    } catch (err) {
      toast.error('មិនអាចប្តូរស្ថានភាពបានទេ!');
    }
  };

  const filteredRepairs = repairs.filter((r) => {
    const cust = r.customer_name || r.customerName || '';
    const dev = r.device_name || r.deviceModel || '';
    const code = r.ticket_code || r.id || '';
    return (
      cust.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(code).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 font-sans select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiTool className="text-indigo-600" />
            <span>Repair Service Management</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Track incoming customer device repairs and technician statuses.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <FiPlus size={16} />
          <span>New Repair Ticket</span>
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-extrabold text-slate-800 text-sm w-full sm:w-auto">
            Active Repair Queue ({filteredRepairs.length})
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by customer, device, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
                <th className="px-6 py-4">TICKET / CODE</th>
                <th className="px-6 py-4">CUSTOMER</th>
                <th className="px-6 py-4">DEVICE & PROBLEM</th>
                <th className="px-6 py-4">ESTIMATED COST</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    Loading repair tickets...
                  </td>
                </tr>
              ) : filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No repair tickets found in MySQL Database. Click "+ New Repair Ticket" to create one.
                  </td>
                </tr>
              ) : (
                filteredRepairs.map((item) => (
                  <tr key={item.id || item.ticket_code} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      #{item.ticket_code || item.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.customer_name || item.customerName}</div>
                      <div className="text-[11px] text-slate-400">{item.customer_phone || item.customerPhone || 'No Phone'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.device_name || item.deviceModel}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">
                        {item.problem_description || item.problemDescription || 'No description'}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(item.estimated_cost || item.estimatedCost || 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={item.status || 'Pending'}
                        onChange={(e) => handleStatusChange(item.ticket_code || item.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-700'
                            : item.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-[11px] text-slate-400">
                        Tech: {item.technician_name || item.technicianName || 'Admin'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Repair Ticket (ជាមួយប្រអប់ Upload រូបថត) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 my-auto">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <FiTool className="text-indigo-600" />
                <span>New Repair Ticket</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Code</label>
                <input
                  type="text"
                  disabled
                  value={form.ticket_code}
                  className="w-full px-3.5 py-2 border bg-slate-50 border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sok Chea"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Phone</label>
                <input
                  type="text"
                  placeholder="012 345 678"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device Name / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 13 Pro (Broken Screen)"
                  value={form.device_name}
                  onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  rows="2"
                  placeholder="Screen cracked, battery replacement..."
                  value={form.problem_description}
                  onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              {/* 📸 ប្រអប់ថត / បញ្ចូលរូបថតស្ថានភាពខូចខាត (Damage Image) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <FiCamera className="text-indigo-600" /> Photo / Damage Image (រូបថតមុនជួសជុល)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
                {imagePreview && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={imagePreview} alt="Damage Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 45.00"
                  value={form.estimated_cost}
                  onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  {submitting ? 'Saving...' : 'Save Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}