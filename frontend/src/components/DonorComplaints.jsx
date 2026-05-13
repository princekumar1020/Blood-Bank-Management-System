import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  MessageSquare, 
  Info, 
  RefreshCcw, 
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  Send,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

const DonorComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const userId = localStorage.getItem("userId");
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    category: 'General',
    title: '',
    description: ''
  });

  const categories = ['General', 'Appointment', 'Donation Process', 'Staff Behavior', 'Technical Issue', 'Other'];

  const statusConfig = {
    pending: { label: 'In Review', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    'in-progress': { label: 'Responded', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: MessageSquare },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    reopened: { label: 'Reopened', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: RefreshCcw }
  };

  useEffect(() => {
    if (userId) fetchComplaints();
  }, [userId]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/complaints?userId=${userId}`);
      setComplaints(res.data);
    } catch (err) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/complaints', {
        ...formData,
        userId
      });
      showToast('Complaint submitted successfully', 'success');
      setShowNewModal(false);
      setFormData({ category: 'General', title: '', description: '' });
      fetchComplaints();
    } catch (err) {
      showToast('Failed to submit complaint', 'error');
    }
  };

  const handleReopen = async (id) => {
    try {
      await API.patch(`/complaints/${id}/reopen`, { userId });
      showToast('Complaint reopened', 'success');
      fetchComplaints();
      setShowViewModal(false);
    } catch (err) {
      showToast('Failed to reopen complaint', 'error');
    }
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="text-red-600" />
            Support & Complaints
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your feedback or issues</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-red-200 dark:hover:shadow-none active:scale-95"
        >
          <Plus size={20} />
          New Complaint
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Subject</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Category</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Date Submitted</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Status</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px]">Latest Response</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8 h-12 bg-gray-50/10 dark:bg-gray-800/10"></td>
                  </tr>
                ))
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
                        <MessageSquare size={32} className="text-gray-400" />
                      </div>
                      <p className="font-medium">No complaints found. Your feedback helps us improve!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase transition-colors group-hover:text-red-600">
                      {complaint.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md font-bold">
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[150px] truncate text-gray-400 dark:text-gray-500 font-medium italic">
                        {complaint.adminResponse || "Awaiting response..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowViewModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all font-bold text-xs"
                        >
                          <Info size={14} />
                          VIEW
                        </button>
                        {complaint.status === 'resolved' && (
                          <button
                            onClick={() => handleReopen(complaint._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-all font-bold text-xs"
                          >
                            <RefreshCcw size={14} />
                            REOPEN
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Complaint Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700 bg-red-50/50 dark:bg-red-900/10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Submit Feedback</h2>
                <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-1">Tell us what's on your mind</p>
              </div>
              <button 
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all text-sm font-bold text-gray-900 dark:text-white"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Subject line"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-red-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="How can we help you?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-3xl px-6 py-5 focus:ring-2 focus:ring-red-500 transition-all text-sm font-bold text-gray-900 dark:text-white resize-none h-40 placeholder:text-gray-400"
                ></textarea>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-100 hover:bg-gray-200 transition-all active:scale-95 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-95"
                >
                  Send Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowViewModal(false)}></div>
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
              <div className="flex gap-5">
                <div className="bg-red-600 p-4 rounded-3xl shadow-lg shadow-red-600/20">
                  <MessageSquare className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedComplaint.title}</h2>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Tracking ID: {selectedComplaint._id.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</h4>
                  <p className="text-gray-900 dark:text-white font-black text-sm uppercase">{selectedComplaint.category}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submitted On</h4>
                  <p className="text-gray-900 dark:text-white font-black text-sm uppercase">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  Original Message
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 p-8 rounded-[2rem] text-gray-600 dark:text-gray-300 font-bold leading-relaxed border border-gray-100 dark:border-gray-600 text-[14px]">
                  "{selectedComplaint.description}"
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Official Response
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </h4>
                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-800/10">
                  {selectedComplaint.adminResponse ? (
                    <div className="flex gap-4">
                      <div className="min-w-fit pt-0.5 text-emerald-600">
                        <CheckCircle size={22} />
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-50 font-black leading-relaxed italic text-[14px]">
                        "{selectedComplaint.adminResponse}"
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 font-bold italic py-4">
                      <Clock size={20} className="animate-spin-slow" />
                      Our dedicated team is analyzing your feedback. Please expect a reply soon.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 flex justify-center">
                {selectedComplaint.status === 'resolved' ? (
                  <button
                    onClick={() => handleReopen(selectedComplaint._id)}
                    className="flex items-center gap-3 bg-purple-600 text-white px-10 py-4 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-700 transition-all hover:shadow-xl shadow-purple-600/20 active:scale-95"
                  >
                    <RefreshCcw size={18} />
                    Issue Not Fixed? Reopen Complaint
                  </button>
                ) : (
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                  >
                    Close Viewer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorComplaints;