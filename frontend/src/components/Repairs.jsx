import React, { useState, useEffect } from 'react';
import { 
  FiTool, 
  FiPlus, 
  FiCheckCircle, 
  FiClock, 
  FiSearch, 
  FiCamera, 
  FiEye, 
  FiX, 
  FiTrash2,
  FiDollarSign 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function Repairs({ user }) {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Form State with Multi-Photo Array
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceModel: '',
    problemDescription: '',
    estimatedCost: '',
    beforePhotos: []
  });

  useEffect(() => {
    const savedTickets = JSON.parse(localStorage.getItem('pos_repair_tickets') || '[]');
    setTickets(savedTickets);
  }, []);

  // Handle Multiple Photo Uploads
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          beforePhotos: [...prev.beforePhotos, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      beforePhotos: prev.beforePhotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.deviceModel) return;

    const ticketId = `REP-${Date.now().toString().slice(-5)}`;
    const currentTime = new Date().toLocaleString();

    const newTicket = {
      id: ticketId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deviceModel: formData.deviceModel,
      problemDescription: formData.problemDescription,
      estimatedCost: formData.estimatedCost || '0.00',
      beforePhotos: formData.beforePhotos || [],
      status: 'Pending',
      createdDate: currentTime,
      createdBy: user?.full_name || user?.name || 'Staff'
    };

    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('pos_repair_tickets', JSON.stringify(updatedTickets));

    // Push Notification with Photos for Admin
    const existingNotifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
    const newNotification = {
      id: Date.now(),
      type: 'REPAIR',
      ticketId: ticketId,
      message: `New Repair Ticket (${ticketId}) - Device: ${newTicket.deviceModel} | Issue: ${newTicket.problemDescription || 'N/A'}`,
      amount: `$${newTicket.estimatedCost}`,
      time: currentTime,
      photos: newTicket.beforePhotos,
      read: false
    };
    localStorage.setItem('pos_notifications', JSON.stringify([newNotification, ...existingNotifs]));

    toast.success('Repair ticket created & sent to admin notifications!');

    setFormData({
      customerName: '',
      customerPhone: '',
      deviceModel: '',
      problemDescription: '',
      estimatedCost: '',
      beforePhotos: []
    });
    setIsModalOpen(false);
  };

  const handleStatusChange = (ticketId, newStatus) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    );
    setTickets(updatedTickets);
    localStorage.setItem('pos_repair_tickets', JSON.stringify(updatedTickets));

    const targetTicket = tickets.find(t => t.id === ticketId);
    const currentTime = new Date().toLocaleString();
    const existingNotifs = JSON.parse(localStorage.getItem('pos_notifications') || '[]');
    
    const statusNotification = {
      id: Date.now(),
      type: 'REPAIR_STATUS',
      ticketId: ticketId,
      message: `Repair Ticket ${ticketId} (${targetTicket?.deviceModel || 'Device'}) status updated to: ${newStatus}`,
      amount: `$${targetTicket?.estimatedCost || '0.00'}`,
      time: currentTime,
      photos: targetTicket?.beforePhotos || [],
      read: false
    };
    localStorage.setItem('pos_notifications', JSON.stringify([statusNotification, ...existingNotifs]));

    toast.success(`Repair status updated to ${newStatus}`);
  };

  const filteredTickets = tickets.filter(t => 
    t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.deviceModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <FiTool className="text-blue-600" />
            <span>Repair & Service Desk</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Register new repair tickets with multiple damage photos and manage technician workflow queues.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <FiPlus size={16} />
          <span>New Repair Ticket</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search repair tickets by customer, device, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Repair Tickets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-extrabold text-slate-800 text-sm">
          Active Repair Queue & Historical Records ({filteredTickets.length})
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium">
            No repair tickets found. Click "New Repair Ticket" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="p-4 font-bold">Damage Photos</th>
                  <th className="p-4 font-bold">Ticket ID & Device</th>
                  <th className="p-4 font-bold">Customer Info</th>
                  <th className="p-4 font-bold">Issue Description</th>
                  <th className="p-4 font-bold">Est. Cost</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Multi-Photo Thumbnails */}
                    <td className="p-4">
                      {ticket.beforePhotos && ticket.beforePhotos.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {ticket.beforePhotos.map((photo, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedPhoto(photo)}
                              className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100 shrink-0"
                            >
                              <img src={photo} alt="Damage" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <FiEye size={12} />
                              </div>
                            </button>
                          ))}
                          <span className="text-[10px] font-bold text-slate-400">({ticket.beforePhotos.length})</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <FiCamera size={16} />
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="font-black text-blue-600">{ticket.id}</div>
                      <div className="font-bold text-slate-800">{ticket.deviceModel}</div>
                      <div className="text-[10px] text-slate-400">{ticket.createdDate}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-800">{ticket.customerName}</div>
                      <div className="text-slate-500 text-xs">{ticket.customerPhone || 'N/A'}</div>
                    </td>

                    <td className="p-4 text-slate-600 max-w-xs truncate">
                      {ticket.problemDescription || 'No description provided'}
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      ${ticket.estimatedCost}
                    </td>

                    <td className="p-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          ticket.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ticket.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td className="p-4 text-center">
                      {ticket.beforePhotos && ticket.beforePhotos.length > 0 && (
                        <button
                          onClick={() => setSelectedPhoto(ticket.beforePhotos[0])}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                        >
                          <FiEye size={14} />
                          <span>Inspect ({ticket.beforePhotos.length})</span>
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW REPAIR TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FiTool className="text-blue-600" />
                <span>Register New Repair Ticket</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Sok Kim"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="012 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Device Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. iPhone 15 Pro Max"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="45.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Problem Description</label>
                <textarea
                  rows="3"
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Cracked front screen, battery draining rapidly..."
                />
              </div>

              {/* MULTI-PHOTO UPLOAD INPUT */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Upload Multiple Damage Photos (Before Repair)
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  <FiCamera className="text-blue-600" size={18} />
                  <span className="text-xs font-bold text-slate-600">Select Multiple Photos</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>

                {formData.beforePhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {formData.beforePhotos.map((photo, idx) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SIZE PHOTO INSPECTION MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 relative shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-sm font-bold text-slate-800 mb-3 px-2">Initial Device Damage Condition</h3>
            <div className="max-h-[75vh] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img src={selectedPhoto} alt="Device Damage Inspection" className="max-h-[75vh] object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}