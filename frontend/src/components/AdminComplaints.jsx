import { useEffect, useState } from 'react';
import { Search, Trash2, Mail, Eye, X, CheckCircle, Circle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  Responded: 'bg-blue-100 text-blue-700',
  Closed: 'bg-green-100 text-green-700'
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [statusOption, setStatusOption] = useState('Responded');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async (search = '') => {
    setLoading(true);
    try {
      const response = await adminAPI.getComplaints(search);
      setComplaints(response.data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showToast('Unable to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchComplaints(searchQuery.trim());
  };

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || '');
    setStatusOption(complaint.status || 'Pending');
    setDetailsOpen(true);
  };

  const closeModal = () => {
    setDetailsOpen(false);
    setSelectedComplaint(null);
    setResponseText('');
  };

  const handleResponseSubmit = async () => {
    if (!selectedComplaint) return;
    if (!responseText.trim()) {
      showToast('Please add a response before submitting', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminAPI.respondToComplaint(selectedComplaint._id, {
        adminResponse: responseText.trim(),
        status: statusOption
      });
      showToast('Response saved and email sent', 'success');
      fetchComplaints(searchQuery.trim());
      closeModal();
    } catch (error) {
      console.error('Error saving response:', error);
      showToast('Unable to save response', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedComplaint) return;

    setActionLoading(true);
    try {
      await adminAPI.updateComplaintStatus(selectedComplaint._id, newStatus);
      showToast('Complaint status updated', 'success');
      fetchComplaints(searchQuery.trim());
      closeModal();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Unable to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this complaint permanently?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await adminAPI.deleteComplaint(id);
      showToast('Complaint deleted successfully', 'success');
      fetchComplaints(searchQuery.trim());
    } catch (error) {
      console.error('Error deleting complaint:', error);
      showToast('Unable to delete complaint', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = complaints.reduce(
    (acc, complaint) => {
      acc[complaint.status] = (acc[complaint.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Responded: 0, Closed: 0 }
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-600 font-black">Admin Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Complaint Management</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Review submitted complaints, respond directly, update statuses, and keep the blood bank service running smoothly.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                type="text"
                placeholder="Search by name or subject"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3">
          {['Pending', 'Responded', 'Closed'].map((status) => (
            <div key={status} className="rounded-3xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">{status}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{counts[status] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">All Complaints</h2>
            <p className="text-sm text-gray-500 mt-1">Search, review, respond, close, or delete complaints from users.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 font-semibold">Loading complaints…</div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <p className="text-xl font-semibold">No complaints found</p>
            <p className="mt-3">Once users submit complaints, they will appear here for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Complaint ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">User</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Created</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{complaint._id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{complaint.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 capitalize">{complaint.userRole}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{complaint.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[complaint.status] || 'bg-slate-100 text-slate-700'}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => openComplaintDetails(complaint)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleDelete(complaint._id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailsOpen && selectedComplaint ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 px-4 py-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-red-600 font-black">Complaint details</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedComplaint.subject}</h2>
                <p className="mt-2 text-sm text-gray-500">Submitted by {selectedComplaint.userName} ({selectedComplaint.userRole})</p>
              </div>
              <button onClick={closeModal} className="rounded-full border border-gray-200 p-3 text-slate-600 transition hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 mt-8 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Complaint message</p>
                  <p className="mt-3 text-sm leading-7 text-gray-700">{selectedComplaint.message}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Customer details</p>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Email:</span> {selectedComplaint.userEmail}</p>
                    <p><span className="font-semibold">Created:</span> {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Admin response</p>
                  <p className="mt-3 text-sm leading-7 text-gray-700 min-h-[72px]">{selectedComplaint.adminResponse || 'No response yet'}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Pending', 'Responded', 'Closed'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setStatusOption(option)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${statusOption === option ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-slate-600 hover:border-red-300'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Response message</label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      rows={6}
                      className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-red-500 focus:outline-none"
                      placeholder="Write your response to the complaint"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={handleResponseSubmit}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Mail size={16} /> Submit Response
                    </button>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleStatusChange(statusOption)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle size={16} /> Update Status
                      </button>
                      <button
                        onClick={() => handleDelete(selectedComplaint._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={16} /> Delete Complaint
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminComplaints;
