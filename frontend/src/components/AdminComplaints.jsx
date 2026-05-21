import { useEffect, useState } from 'react';
import { Search, Mail, Eye, X, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 text-sm text-gray-600">
      <div>Page {currentPage} of {totalPages}</div>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded border ${page === currentPage ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  responded: 'bg-blue-100 text-blue-700',
  reopened: 'bg-fuchsia-100 text-fuchsia-700',
  resolved: 'bg-green-100 text-green-700'
};

const normalizeStatus = (status) => {
  if (!status) return 'pending';
  const value = status.toString().trim().toLowerCase();
  if (value === 'in review' || value === 'in-review' || value === 'in progress' || value === 'inprogress') return 'in-progress';
  if (value === 'closed' || value === 'resolved') return 'resolved';
  if (value === 'open' || value === 'pending') return 'pending';
  if (value === 'reopened') return 'reopened';
  return value;
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  const labels = {
    pending: 'Pending',
    'in-progress': 'In Review',
    responded: 'Responded',
    reopened: 'Reopened',
    resolved: 'Resolved'
  };
  return labels[normalized] || normalized;
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [statusOption, setStatusOption] = useState('In Review');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const { showToast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async (search = '') => {
    setLoading(true);
    try {
      console.log('Fetching complaints with search:', search);
      const response = await adminAPI.getComplaints(search);
      const data = response.data.complaints || response.data || [];
      console.log('Complaints fetched:', data.length);
      setComplaints(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      showToast('Unable to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log('handleSearch called with:', searchQuery);
    if (searchQuery.trim() === '') {
      console.log('Search query is empty, fetching all complaints');
      await fetchComplaints('');
    } else {
      console.log('Searching for:', searchQuery.trim());
      await fetchComplaints(searchQuery.trim());
    }
  };

  const handleClearSearch = async () => {
    console.log('handleClearSearch called');
    setSearchQuery('');
    await fetchComplaints('');
  };

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.adminResponse || '');
    
    const normalizedStatus = normalizeStatus(complaint.status);
    const statusMapping = {
      pending: 'In Review',
      'in-progress': 'In Review', 
      responded: 'Responded',
      resolved: 'Resolved',
      reopened: 'In Review'
    };
    
    setStatusOption(statusMapping[normalizedStatus] || 'In Review');
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
      // Map display status to backend status
      const statusMapping = {
        'In Review': 'In Progress',
        'Responded': 'In Progress',
        'Resolved': 'Resolved'
      };
      
      const backendStatus = statusMapping[statusOption] || 'In Progress';
      
      const response = await adminAPI.respondToComplaint(selectedComplaint._id, {
        adminResponse: responseText.trim(),
        status: backendStatus
      });
      const responseData = response.data || response;
      const emailStatus = responseData.emailStatus || 'failed';
      showToast(
        `Response saved. Email ${emailStatus === 'sent' ? 'sent successfully' : 'failed to send'}.`,
        emailStatus === 'sent' ? 'success' : 'error'
      );
      await fetchComplaints(searchQuery.trim());
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
    if (!['In Review', 'Responded'].includes(newStatus)) return;

    setActionLoading(true);
    try {
      await adminAPI.updateComplaintStatus(selectedComplaint._id, newStatus);
      showToast('Complaint status updated', 'success');
      await fetchComplaints(searchQuery.trim());
      closeModal();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Unable to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const counts = complaints.reduce(
    (acc, complaint) => {
      const statusKey = normalizeStatus(complaint.status);
      acc[statusKey] = (acc[statusKey] || 0) + 1;

      const wasReopened = statusKey === 'reopened' ||
        complaint.responseHistory?.some((item) => normalizeStatus(item.status) === 'reopened');
      if (wasReopened) {
        acc.reopened = (acc.reopened || 0) + 1;
      }

      return acc;
    },
    { pending: 0, 'in-progress': 0, responded: 0, reopened: 0, resolved: 0 }
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-600 font-black">Admin Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">Complaint Management</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Review submitted complaints, respond, and keep the complaint lifecycle moving while preventing admin closure.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                type="text"
                placeholder="Search by user name"
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
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center rounded-2xl bg-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-5">
          {[
            { key: 'pending', label: 'Pending' },
            { key: 'in-progress', label: 'In Review' },
            { key: 'responded', label: 'Responded' },
            { key: 'reopened', label: 'Reopened' },
            { key: 'resolved', label: 'Resolved' }
          ].map(({ key, label }) => (
            <div key={key} className="rounded-3xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">{label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{counts[key] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">All Complaints</h2>
            <p className="text-sm text-gray-500 mt-1">Search, review, and respond to complaint requests without closing them directly.</p>
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
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Complaint ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">User</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Subject</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Message</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Created</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{complaint._id.slice(-8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{complaint.user?.fullName || complaint.user?.email || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{complaint.user?.role || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{complaint.subject || complaint.title || 'No subject'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{complaint.message || complaint.description || 'No message'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles[normalizeStatus(complaint.status)] || 'bg-slate-100 text-slate-700'}`}>
                            {getStatusLabel(complaint.status)}
                          </span>
                          {complaint.responseHistory?.length > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-fuchsia-100 text-fuchsia-700 rounded-full text-[10px] font-bold" title="Reopened complaint">
                              ↻
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => openComplaintDetails(complaint)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4">
              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(complaints.length / rowsPerPage))}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {detailsOpen && selectedComplaint ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 px-4 py-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-red-600 font-black">Complaint details</p>
                  {selectedComplaint.responseHistory?.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-semibold">
                      ↻ Reopened
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedComplaint.subject || selectedComplaint.title || 'No subject'}</h2>
                <p className="mt-2 text-sm text-gray-500">Submitted by {selectedComplaint.user?.fullName || selectedComplaint.user?.email || 'Unknown user'} ({selectedComplaint.user?.role || 'unknown'})</p>
              </div>
              <button onClick={closeModal} className="rounded-full border border-gray-200 p-3 text-slate-600 transition hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 mt-8 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Complaint message</p>
                  <p className="mt-3 text-sm leading-7 text-gray-700">{selectedComplaint.message || selectedComplaint.description || 'No message provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Category</p>
                  <p className="mt-3 text-sm text-gray-700 capitalize">{selectedComplaint.category || 'general'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Admin response</p>
                  <p className="mt-3 text-sm leading-7 text-gray-700 min-h-[72px]">{selectedComplaint.adminResponse || 'No response yet'}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] mt-3 ${statusStyles[normalizeStatus(selectedComplaint.status)] || 'bg-slate-100 text-slate-700'}`}>
                      {getStatusLabel(selectedComplaint.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Response history</p>
                    {selectedComplaint.responseHistory?.length ? (
                      <div className="mt-3 space-y-3">
                        {selectedComplaint.responseHistory.map((item, index) => (
                          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                            <p>{item.response}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-gray-400">
                              {new Date(item.respondedAt).toLocaleString()} • Status: {getStatusLabel(item.status)}
                            </p>
                          </div>
                        ))}
                        {selectedComplaint.adminResponse && (
                          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-gray-700">
                            <p className="font-semibold text-red-700">Latest Response:</p>
                            <p>{selectedComplaint.adminResponse}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-red-600">
                              {new Date(selectedComplaint.updatedAt).toLocaleString()} • Status: {getStatusLabel(selectedComplaint.status)}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : selectedComplaint.adminResponse ? (
                      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                        <p>{selectedComplaint.adminResponse}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-gray-400">
                          {new Date(selectedComplaint.updatedAt).toLocaleString()} • Status: {getStatusLabel(selectedComplaint.status)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500">No responses yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Add Response</p>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response here..."
                      className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-red-500 focus:outline-none resize-none"
                      rows={4}
                    />
                    <div className="mt-3 flex flex-col gap-3">
                      <select
                        value={statusOption}
                        onChange={(e) => setStatusOption(e.target.value)}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="In Review">In Review</option>
                        <option value="Responded">Responded</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <button
                        onClick={handleResponseSubmit}
                        disabled={actionLoading || !responseText.trim()}
                        className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoading ? 'Sending...' : 'Send Response'}
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
