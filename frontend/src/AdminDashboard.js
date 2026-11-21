import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Droplet, Users, Handshake, Calendar, Inbox, MessageSquare, History, Package, AlertTriangle, BarChart3, UserRound, Activity, LogOut } from 'lucide-react';
import { useToast } from './context/ToastContext';
import AdminUserHistory from './components/AdminUserHistory';
import RecipientManagement from './RecipientManagement';
import Analytics from './components/Analytics';

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

// --- Admin Requests Management Component ---
function AdminRequests() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, action: null, data: null });

  const fetchRequests = () => {
    setLoading(true);
    setCurrentPage(1);
    axios.get(`http://localhost:5000/api/admin/requests${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(res => {
        const sortedRequests = (res.data.requests || []).slice().sort((a, b) => new Date(b.requestDate || b.createdAt || 0) - new Date(a.requestDate || a.createdAt || 0));
        setRequests(sortedRequests);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load requests');
        showToast('Failed to load requests', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleApprove = (id) => {
    setConfirmDialog({ show: true, id, action: 'approve', data: null });
  };

  const confirmApprove = () => {
    const { id } = confirmDialog;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/requests/${id}/approve`)
      .then(() => {
        showToast('Request approved and fulfilled successfully!', 'success');
        fetchRequests();
      })
      .catch(err => {
        const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to approve request';
        showToast(errorMsg, 'error');
      })
      .finally(() => {
        setActionLoading(l => ({ ...l, [id]: false }));
        setConfirmDialog({ show: false, id: null, action: null, data: null });
      });
  };

  const handleEdit = (id, oldUnits, oldReason) => {
    const units = prompt('Edit units', oldUnits);
    const reason = prompt('Edit reason', oldReason || '');
    if (!units) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.put(`http://localhost:5000/api/admin/requests/${id}`, { units, reason })
      .then(() => {
        showToast('Request updated successfully!', 'success');
        fetchRequests();
      })
      .catch(err => {
        showToast('Failed to update request', 'error');
      })
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-xl text-gray-700">Blood Requests</span>
        <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">Recipient</th>
                <th className="p-2 border">Blood Group</th>
                <th className="p-2 border">Units</th>
                <th className="p-2 border">Request For</th>
                <th className="p-2 border">Patient Name</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan={9} className="text-center p-4">No requests found.</td></tr>}
              {requests.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-2 border">{r.recipient}</td>
                  <td className="p-2 border">{r.bloodGroup}</td>
                  <td className="p-2 border">{r.units}</td>
                  <td className="p-2 border">{r.requestFor}</td>
                  <td className="p-2 border">{r.patientName || '-'}</td>
                  <td className="p-2 border capitalize">{r.status}</td>
                  <td className="p-2 border">{r.requestDate ? new Date(r.requestDate).toLocaleString() : ''}</td>
                  <td className="p-2 border">{r.reason || '-'}</td>
                  <td className="p-2 border">
                    {r.status === 'pending' && <>
                      <button className="text-green-600 hover:underline mr-2" disabled={actionLoading[r.id]} onClick={() => handleApprove(r.id)}>Approve</button>
                      <button className="text-blue-600 hover:underline" disabled={actionLoading[r.id]} onClick={() => handleEdit(r.id, r.units, r.reason)}>Edit</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={Math.ceil(requests.length / rowsPerPage)} onPageChange={setCurrentPage} />
      
      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm">
            <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-4">
              {confirmDialog.action === 'approve' && 'Approve and fulfill this blood request?'}
            </p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setConfirmDialog({ show: false, id: null, action: null, data: null })}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={confirmApprove}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Appointments Management Component ---
function AdminAppointments() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, action: null });
  const [approveForm, setApproveForm] = useState({ tokenNo: '', timeSlot: '' });

  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  const fetchAppointments = () => {
    setLoading(true);
    setCurrentPage(1);
    setLoading(true);
    axios.get(`http://localhost:5000/api/admin/appointments${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(res => {
        const sortedAppointments = (res.data.appointments || []).slice().sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
        setAppointments(sortedAppointments);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load appointments');
        showToast('Failed to load appointments', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleApprove = (id) => {
    setApproveForm({ tokenNo: '', timeSlot: '' });
    setConfirmDialog({ show: true, id, action: 'approve' });
  };

  const confirmApproveAction = () => {
    const { id } = confirmDialog;
    if (!approveForm.tokenNo || !approveForm.timeSlot) {
      showToast('Please fill in all fields', 'warning');
      return;
    }
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/appointments/${id}/approve`, approveForm)
      .then(() => {
        showToast('Appointment approved successfully!', 'success');
        fetchAppointments();
      })
      .catch(err => {
        showToast('Failed to approve appointment', 'error');
      })
      .finally(() => {
        setActionLoading(l => ({ ...l, [id]: false }));
        setConfirmDialog({ show: false, id: null, action: null });
      });
  };

  const handleComplete = (id) => {
    setConfirmDialog({ show: true, id, action: 'complete' });
  };

  const handleDelete = (id) => {
    setConfirmDialog({ show: true, id, action: 'delete' });
  };

  const handleReject = (id) => {
    setConfirmDialog({ show: true, id, action: 'reject' });
  };

  const handleEdit = (id, oldDate, oldNotes) => {
    const date = prompt('Edit date (YYYY-MM-DD)', oldDate?.slice(0,10));
    const notes = prompt('Edit notes', oldNotes || '');
    if (!date) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.put(`http://localhost:5000/api/admin/appointments/${id}`, { date, notes })
      .then(() => {
        showToast('Appointment updated successfully!', 'success');
        fetchAppointments();
      })
      .catch(err => {
        showToast('Failed to update appointment', 'error');
      })
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const executeConfirmedAction = () => {
    const { id, action } = confirmDialog;
    setActionLoading(l => ({ ...l, [id]: true }));

    let apiCall;
    let successMessage = '';

    switch (action) {
      case 'complete':
        apiCall = axios.post(`http://localhost:5000/api/admin/appointments/${id}/complete`);
        successMessage = 'Appointment marked as completed!';
        break;
      case 'delete':
        apiCall = axios.delete(`http://localhost:5000/api/admin/appointments/${id}`);
        successMessage = 'Appointment deleted!';
        break;
      case 'reject':
        apiCall = axios.post(`http://localhost:5000/api/admin/appointments/${id}/reject`);
        successMessage = 'Appointment rejected!';
        break;
      default:
        return;
    }

    apiCall
      .then(() => {
        showToast(successMessage, 'success');
        fetchAppointments();
      })
      .catch(err => {
        showToast(`Failed to ${action} appointment`, 'error');
      })
      .finally(() => {
        setActionLoading(l => ({ ...l, [id]: false }));
        setConfirmDialog({ show: false, id: null, action: null });
      });
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-xl text-gray-700">Appointments</span>
        <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Blood Group</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Token</th>
                <th className="p-2 border">Time Slot</th>
                <th className="p-2 border">Notes</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 && <tr><td colSpan={8} className="text-center p-4">No appointments found.</td></tr>}
              {appointments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(a => (
                <tr key={a._id} className="border-b">
                  <td className="p-2 border">{a.user?.fullName || 'N/A'}</td>
                  <td className="p-2 border">{a.bloodGroup}</td>
                  <td className="p-2 border">{a.date ? new Date(a.date).toLocaleString() : ''}</td>
                  <td className="p-2 border capitalize">{a.status}</td>
                  <td className="p-2 border">{a.tokenNo || '-'}</td>
                  <td className="p-2 border">{a.timeSlot || '-'}</td>
                  <td className="p-2 border">{a.notes || '-'}</td>
                  <td className="p-2 border">
                    {a.status === 'scheduled' && <>
                      <button className="text-green-600 hover:underline mr-2" disabled={actionLoading[a._id]} onClick={() => handleApprove(a._id)}>Approve</button>
                      <button className="text-blue-600 hover:underline mr-2" disabled={actionLoading[a._id]} onClick={() => handleEdit(a._id, a.date, a.notes)}>Edit</button>
                      <button className="text-red-600 hover:underline mr-2" disabled={actionLoading[a._id]} onClick={() => handleReject(a._id)}>Reject</button>
                      <button className="text-red-600 hover:underline" disabled={actionLoading[a._id]} onClick={() => handleDelete(a._id)}>Delete</button>
                    </>}
                    {a.status === 'approved' && <>
                      <button className="text-purple-600 hover:underline mr-2" disabled={actionLoading[a._id]} onClick={() => handleComplete(a._id)}>Complete</button>
                      <button className="text-red-600 hover:underline" disabled={actionLoading[a._id]} onClick={() => handleReject(a._id)}>Reject</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={Math.ceil(appointments.length / rowsPerPage)} onPageChange={setCurrentPage} />

      {/* Confirmation Dialog */}
      {confirmDialog.show && confirmDialog.action === 'approve' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-96">
            <h3 className="text-lg font-bold mb-4">Approve Appointment</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Token Number</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={approveForm.tokenNo}
                  onChange={e => setApproveForm({ ...approveForm, tokenNo: e.target.value })}
                  placeholder="e.g., T001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Slot</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={approveForm.timeSlot}
                  onChange={e => setApproveForm({ ...approveForm, timeSlot: e.target.value })}
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setConfirmDialog({ show: false, id: null, action: null })}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={confirmApproveAction}>
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Dialog */}
      {confirmDialog.show && ['complete', 'delete', 'reject'].includes(confirmDialog.action) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm">
            <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-4">
              {confirmDialog.action === 'complete' && 'Mark this appointment as completed?'}
              {confirmDialog.action === 'delete' && 'Delete this appointment?'}
              {confirmDialog.action === 'reject' && 'Reject/cancel this appointment?'}
            </p>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setConfirmDialog({ show: false, id: null, action: null })}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={executeConfirmedAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sidebarLinks = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Donors', icon: <Droplet size={18} /> },
  { label: 'Recipients', icon: <Handshake size={18} /> },
  { label: 'Appointments', icon: <Calendar size={18} /> },
  { label: 'Requests', icon: <Inbox size={18} /> },
  { label: 'Complaints', icon: <MessageSquare size={18} /> },
  { label: 'User History', icon: <History size={18} /> },
  { label: 'Inventory', icon: <Package size={18} /> },
  { label: 'Alerts', icon: <AlertTriangle size={18} /> },
  { label: 'Analytics', icon: <BarChart3 size={18} /> },
];

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="dashboard-stat-card p-5 flex flex-col gap-1">
      <div className={`flex items-center gap-2 text-sm font-semibold mb-1 ${color}`}>
        <span aria-hidden="true">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className={`text-xs mt-1 ${color}`}>{subtitle}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');
  const [alertBloodGroup, setAlertBloodGroup] = useState('A+');
  const [alertMessage, setAlertMessage] = useState('Urgent blood needed for patients in critical condition. Please donate if you can.');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSummary, setAlertSummary] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <div role="status" aria-live="polite" className="flex items-center justify-center min-h-screen">Loading admin dashboard...</div>;
  if (error) return (
    <div className="workspace-page">
      <div role="alert" className="ui-card p-6 text-center">
        <p className="mb-4 text-red-700">{error}</p>
        <button type="button" onClick={fetchDashboard} className="ui-btn ui-btn-primary">Try again</button>
      </div>
    </div>
  );

  // fallback for missing data
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const inventory = bloodGroups.map(bg => data?.bloodInventory?.[bg] || 0);
  const trend = data?.trend || [];
  const inventoryMax = Math.max(...inventory, 1);
  const maxTrendCount = Math.max(...trend.map(item => item.count), 1);
  const trendPoints = trend.map((item, index) => ({
    ...item,
    x: trend.length === 1 ? 150 : 10 + index * (280 / (trend.length - 1)),
    y: 90 - (item.count / maxTrendCount) * 80
  }));
  const inventoryTotal = inventory.reduce((total, units) => total + units, 0);
  const inventoryColors = ['#c8102e', '#e5485d', '#a50e27', '#f97316', '#eab308', '#15803d', '#2563eb', '#7c3aed'];
  let inventoryAngle = 0;
  const inventoryGradient = inventoryTotal > 0
    ? `conic-gradient(${inventory.map((units, index) => {
      const start = inventoryAngle;
      inventoryAngle += (units / inventoryTotal) * 100;
      return `${inventoryColors[index]} ${start}% ${inventoryAngle}%`;
    }).join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)';

  const handleSendEmergencyAlert = async () => {
    if (!alertMessage.trim()) {
      showToast('Please enter an emergency message before sending.', 'warning');
      return;
    }
    setAlertLoading(true);
    setAlertSummary(null);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/alerts', {
        bloodGroup: alertBloodGroup,
        message: alertMessage.trim()
      });
      if (res.data?.count > 0) {
        showToast(`Emergency alert sent to ${res.data.count} eligible donor(s).`, 'success');
        setAlertSummary(`Alert delivered to ${res.data.count} eligible donor(s).`);
      } else {
        showToast(res.data?.message || 'No eligible donors found for this blood group.', 'info');
        setAlertSummary(res.data?.message || 'No eligible donors were found.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to send emergency alert.';
      showToast(errorMsg, 'error');
      setAlertSummary(errorMsg);
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="dashboard-shell admin-shell">
        {/* Sidebar */}
        <aside className="dashboard-sidebar admin-sidebar">
          <div className="dashboard-brand mb-6 px-2">
            <Droplet className="dashboard-brand-icon" size={25} aria-hidden="true" />
            <span>BloodBank Plus</span>
          </div>
          <nav aria-label="Admin navigation" className="flex flex-col gap-1">
            {sidebarLinks.map(link => (
              <button
                key={link.label}
                aria-current={activeSidebar === link.label ? 'page' : undefined}
                className={`dashboard-nav-item flex w-full items-center gap-3 px-4 py-2 text-left font-semibold ${activeSidebar === link.label ? 'dashboard-nav-item-active' : ''}`}
                onClick={() => {
                  setActiveSidebar(link.label);
                  if (link.label === 'Inventory') {
                    window.location.href = '/inventory';
                  }
                  if (link.label === 'Donors') {
                    window.location.href = '/donor-management';
                  }
                  if (link.label === 'Complaints') {
                    window.location.href = '/admin-dashboard/complaints';
                  }
                }}
              >
                <span className="flex-shrink-0" aria-hidden="true">{link.icon}</span> {link.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{activeSidebar}</h1>
              <p className="text-gray-500 text-sm hidden sm:block">
                {activeSidebar === 'Dashboard' && 'Overview of blood bank operations and statistics'}
                {activeSidebar === 'Donors' && 'List of all registered donors'}
                {activeSidebar === 'Recipients' && 'List of all registered recipients'}
                {activeSidebar === 'Complaints' && 'Review and manage user complaints'}
                {activeSidebar === 'User History' && 'User activity and donation/request history'}
                {activeSidebar === 'Inventory' && 'Current blood inventory by type'}
                {activeSidebar === 'Alerts' && 'Pending or urgent blood requests'}
                {activeSidebar === 'Analytics' && 'Donation and request analytics'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin-dashboard/complaints')}
                className="ui-btn ui-btn-primary"
              >
                Complaints
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.clear();
                  navigate('/');
                }}
                aria-label="Log out"
                className="ui-btn ui-btn-outline"
              >
                <LogOut size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
          <main className="dashboard-content">
          {/* Content based on sidebar selection */}
          {activeSidebar === 'Dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Donors" value={data.totalDonors} icon={<Users size={20} />} color="text-green-600" />
                <StatCard title="Active Recipients" value={data.totalRecipients} icon={<UserRound size={20} />} color="text-blue-600" />
                <StatCard title="Total Units" value={data.totalUnits} icon={<Droplet size={20} />} color="text-orange-600" />
                <StatCard title="Active Alerts" value={data.activeAlerts} icon={<Activity size={20} />} color="text-red-600" />
              </div>
              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Blood Inventory by Type</div>
                  {/* Placeholder for bar chart */}
                  <div className="h-48 flex items-end gap-2">
                    {inventory.map((val, i) => (
                      <div key={bloodGroups[i]} className="flex h-full flex-col items-center justify-end flex-1">
                        <div className="w-7 rounded-t bg-[#e20000] mb-1" style={{ height: `${(val / inventoryMax) * 80}%` }}></div>
                        <div className="text-xs text-gray-500">{bloodGroups[i]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-[#e20000]">Available Units</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Donation Trend (6 Months)</div>
                  {/* Placeholder for line chart */}
                  <div className="h-48 flex items-end">
                    <svg width="100%" height="100%" viewBox="0 0 300 100" className="w-full h-full">
                      <polyline fill="none" stroke="#c8102e" strokeWidth="3" points={trendPoints.map(point => `${point.x},${point.y}`).join(' ')} />
                      {trendPoints.map((point, i) => (
                        <circle key={`${point.month}-${i}`} cx={point.x} cy={point.y} r="4" fill="#c8102e" />
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs mt-2 text-gray-500">
                    {trendPoints.map((point, i) => (
                      <span key={`${point.month}-${i}`}>{point.month}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Inventory Distribution</div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
                    <div
                      role="img"
                      aria-label={`Blood inventory distribution, ${inventoryTotal} total units`}
                      className="h-32 w-32 flex-shrink-0 rounded-full"
                      style={{ background: inventoryGradient }}
                    />
                    <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm sm:w-auto">
                      {bloodGroups.map((group, index) => (
                        <li key={group} className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: inventoryColors[index] }} />
                          <span className="text-gray-600">{group}</span>
                          <span className="ml-auto font-semibold text-gray-900">{inventory[index]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {inventoryTotal} units currently available
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Recent Activities</div>
                  <ul className="text-sm space-y-2">
                    {data.recentDonations.map((d, i) => (
                      <li key={i}><span className="text-green-600 font-semibold">●</span> New donation received <span className="text-gray-400">{d.name} donated {d.bloodGroup} · {new Date(d.date).toLocaleString()}</span></li>
                    ))}
                    {data.recentRequests.map((r, i) => (
                      <li key={i}><span className="text-blue-600 font-semibold">●</span> Blood request {r.status} <span className="text-gray-400">{r.name} requested {r.units} units {r.bloodGroup} · {new Date(r.createdAt).toLocaleString()}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
          {/* Render Recipient Management page */}
          {activeSidebar === 'Recipients' && <RecipientManagement />}
          {activeSidebar === 'Appointments' && <AdminAppointments />}
          {activeSidebar === 'Requests' && <AdminRequests />}
          {activeSidebar === 'User History' && <AdminUserHistory />}
          {activeSidebar === 'Analytics' && <Analytics />}
          {/* Placeholder content for other sidebar options */}
          {activeSidebar === 'Alerts' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Emergency Blood Alert</h2>
                <p className="text-gray-500 mt-2">Send an urgent email to donors eligible to donate again (last donation 30+ days ago). Only donors with the selected blood group will receive this alert.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={alertBloodGroup}
                    onChange={e => setAlertBloodGroup(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={`Urgent Blood Needed: ${alertBloodGroup}`}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={alertMessage}
                  onChange={e => setAlertMessage(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
                  placeholder="Enter the emergency alert message to send to eligible donors..."
                />
              </div>
              <button
                type="button"
                onClick={handleSendEmergencyAlert}
                disabled={alertLoading}
                className={`inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white ${alertLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {alertLoading ? 'Sending alert...' : 'Send Emergency Alert'}
              </button>
              {alertSummary && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  {alertSummary}
                </div>
              )}
            </div>
          )}
          {!["Dashboard","Recipients","Appointments","Requests","Alerts","User History","Analytics"].includes(activeSidebar) && (
            <div className="bg-white rounded-xl p-8 border border-gray-100 text-gray-500 text-center text-lg shadow-sm">
              Feature coming soon: {activeSidebar}
            </div>
          )}
          </main>
        </div>
      </div>
  );
}
