import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

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

export default function AdminUserHistory() {
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const debounceTimer = useRef(null);

  useEffect(() => {
    // Clear previous timer if it exists
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer for debounced search
    debounceTimer.current = setTimeout(() => {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams();
          if (search) params.append('search', search);
          if (type !== 'all') params.append('type', type);
          if (role !== 'all') params.append('role', role);
          if (status !== 'all') params.append('status', status);
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);

          const url = `http://localhost:5000/api/admin/history${params.toString() ? `?${params.toString()}` : ''}`;
          const response = await axios.get(url);
          const sortedHistory = (response.data.history || []).slice().sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
          setHistory(sortedHistory);
          setError(null);
        } catch (err) {
          const message = err?.response?.data?.error || err?.message || 'Failed to load user history';
          setError(message);
          showToast(message, 'error');
        } finally {
          setLoading(false);
        }
      };

      setCurrentPage(1);
      fetchHistory();
    }, 500); // 500ms debounce delay

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [showToast, search, type, role, status, startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center text-gray-500">
        Loading user history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User History</h2>
          <p className="text-gray-500 text-sm">Combined donation and recipient request history for all users.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, blood group, details"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="Donation">Donation</option>
            <option value="Request">Request</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setType('all');
              setRole('all');
              setStatus('all');
              setStartDate('');
              setEndDate('');
            }}
            className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
          >
            Clear filters
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No history records available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Blood Group</th>
                <th className="p-3 border">Details</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((item) => (
                <tr key={`${item.type}-${item._id}`} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-3 border text-gray-600">{new Date(item.date).toLocaleString()}</td>
                  <td className="p-3 border font-semibold text-gray-700">{item.type}</td>
                  <td className="p-3 border">{item.userName}</td>
                  <td className="p-3 border capitalize">{item.role}</td>
                  <td className="p-3 border">{item.bloodGroup}</td>
                  <td className="p-3 border text-gray-600">{item.details}</td>
                  <td className="p-3 border capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(history.length / rowsPerPage))}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
