// --- Admin Requests Management Component ---
function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  const fetchRequests = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/admin/requests${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(res => {
        setRequests(res.data.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load requests');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleApprove = (id) => {
    if (!window.confirm('Approve and fulfill this request?')) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/requests/${id}/approve`)
      .then(fetchRequests)
      .catch(err => {
        // Show backend error message (e.g., Stock not available)
        alert(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Failed to approve request'
        );
      })
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const handleEdit = (id, oldUnits, oldReason) => {
    const units = prompt('Edit units', oldUnits);
    const reason = prompt('Edit reason', oldReason || '');
    if (!units) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.put(`http://localhost:5000/api/admin/requests/${id}`, { units, reason })
      .then(fetchRequests)
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
              {requests.map(r => (
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
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RecipientManagement from './RecipientManagement';

// --- Admin Appointments Management Component ---
function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/admin/appointments${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(res => {
        setAppointments(res.data.appointments || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load appointments');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleApprove = (id) => {
    const tokenNo = prompt('Enter token number:');
    const timeSlot = prompt('Enter time slot (e.g. 10:00-10:30):');
    if (!tokenNo || !timeSlot) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/appointments/${id}/approve`, { tokenNo, timeSlot })
      .then(fetchAppointments)
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const handleComplete = (id) => {
    if (!window.confirm('Mark this appointment as completed?')) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/appointments/${id}/complete`)
      .then(fetchAppointments)
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.delete(`http://localhost:5000/api/admin/appointments/${id}`)
      .then(fetchAppointments)
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const handleEdit = (id, oldDate, oldNotes) => {
    const date = prompt('Edit date (YYYY-MM-DD)', oldDate?.slice(0,10));
    const notes = prompt('Edit notes', oldNotes || '');
    if (!date) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.put(`http://localhost:5000/api/admin/appointments/${id}`, { date, notes })
      .then(fetchAppointments)
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
  };

  const handleReject = (id) => {
    if (!window.confirm('Are you sure you want to reject/cancel this appointment?')) return;
    setActionLoading(l => ({ ...l, [id]: true }));
    axios.post(`http://localhost:5000/api/admin/appointments/${id}/reject`)
      .then(fetchAppointments)
      .finally(() => setActionLoading(l => ({ ...l, [id]: false })));
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
              {appointments.map(a => (
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
    </div>
  );
}

const sidebarLinks = [
  { label: 'Dashboard', icon: '🏠' },
  { label: 'Donors', icon: '🩸' },
  { label: 'Recipients', icon: '🤝' },
  { label: 'Appointments', icon: '📅' },
  { label: 'Requests', icon: '📨' },
  { label: 'User History', icon: '📜' },
  { label: 'Inventory', icon: '📦' },
  { label: 'Alerts', icon: '⚠️' },
  { label: 'Analytics', icon: '📊' },
];

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex-1 min-w-[180px] border border-gray-100 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-1">
        <span className="text-lg">{icon}</span> {title}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs mt-1 ${color}`}>{subtitle}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;

  // fallback for missing data
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const inventory = bloodGroups.map(bg => data?.bloodInventory?.[bg] || 0);
  const trend = data?.trend || [];

  return (
    <div>
      <div className="flex min-h-screen bg-[#f7f8fa]">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-3 min-h-screen">
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="text-[#e20000] text-2xl">🩸</span>
            <span className="font-extrabold text-lg tracking-tight text-gray-900">BloodBank Plus</span>
          </div>
          <nav className="flex flex-col gap-1">
            {sidebarLinks.map(link => (
              <button
                key={link.label}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left font-semibold text-gray-700 hover:bg-[#ffeaea] transition ${activeSidebar === link.label ? 'bg-[#ffeaea] text-[#e20000]' : ''}`}
                onClick={() => {
                  setActiveSidebar(link.label);
                  if (link.label === 'Inventory') {
                    window.location.href = '/inventory';
                  }
                  if (link.label === 'Donors') {
                    window.location.href = '/donor-management';
                  }
                  // Optionally, handle navigation for Recipients if you want a separate route
                }}
              >
                <span>{link.icon}</span> {link.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeSidebar}</h1>
              <p className="text-gray-500 text-sm">
                {activeSidebar === 'Dashboard' && 'Overview of blood bank operations and statistics'}
                {activeSidebar === 'Donors' && 'List of all registered donors'}
                {activeSidebar === 'Recipients' && 'List of all registered recipients'}
                {activeSidebar === 'User History' && 'User activity and donation/request history'}
                {activeSidebar === 'Inventory' && 'Current blood inventory by type'}
                {activeSidebar === 'Alerts' && 'Pending or urgent blood requests'}
                {activeSidebar === 'Analytics' && 'Donation and request analytics'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-semibold">Admin Dashboard</span>
              <button className="text-[#e20000] font-bold hover:underline">Logout</button>
            </div>
          </div>
          {/* Content based on sidebar selection */}
          {activeSidebar === 'Dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Donors" value={data.totalDonors} subtitle="" icon="👤" color="text-green-600" />
                <StatCard title="Active Recipients" value={data.totalRecipients} subtitle="" icon="✅" color="text-blue-600" />
                <StatCard title="Total Units" value={data.totalUnits} subtitle="" icon="🔥" color="text-orange-600" />
                <StatCard title="Active Alerts" value={data.activeAlerts} subtitle="" icon="⚠️" color="text-red-600" />
              </div>
              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Blood Inventory by Type</div>
                  {/* Placeholder for bar chart */}
                  <div className="h-48 flex items-end gap-2">
                    {inventory.map((val, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div className="w-7 rounded-t bg-[#e20000] mb-1" style={{ height: `${val * 2}px` }}></div>
                        <div className="text-xs text-gray-500">{bloodGroups[i]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-[#e20000]">Available Units</span>
                    <span className="text-blue-600">Requested</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Donation Trend (6 Months)</div>
                  {/* Placeholder for line chart */}
                  <div className="h-48 flex items-end">
                    <svg width="100%" height="100%" viewBox="0 0 300 100" className="w-full h-full">
                      <polyline fill="none" stroke="#e20000" strokeWidth="3" points={trend.map((t, i) => `${10 + i * 50},${100 - t.count * 0.5}`).join(' ')} />
                      {trend.map((t, i) => (
                        <circle key={i} cx={10 + i * 50} cy={100 - t.count * 0.5} r="4" fill="#e20000" />
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs mt-2 text-gray-500">
                    {trend.map((t, i) => (
                      <span key={i}>{t.month}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <div className="font-semibold mb-2">Blood Distribution</div>
                  {/* Placeholder for pie chart */}
                  <div className="flex items-center justify-center h-40">
                    <svg width="120" height="120" viewBox="0 0 32 32">
                      <circle r="16" cx="16" cy="16" fill="#f3f3f3" />
                      <path d="M16 16 L16 0 A16 16 0 0 1 31.36 9.6 Z" fill="#e20000" />
                      <path d="M16 16 L31.36 9.6 A16 16 0 1 1 16 0 Z" fill="#ffb703" />
                    </svg>
                  </div>
                  <div className="flex justify-center gap-4 text-xs mt-2">
                    <span className="text-[#e20000]">Emergency 35%</span>
                    <span className="text-[#ffb703]">Routine 65%</span>
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
          {/* Placeholder content for other sidebar options */}
          {!["Dashboard","Recipients","Appointments","Requests"].includes(activeSidebar) && (
            <div className="bg-white rounded-xl p-8 border border-gray-100 text-gray-500 text-center text-lg shadow-sm">
              Feature coming soon: {activeSidebar}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
