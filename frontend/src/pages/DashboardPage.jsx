import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({ patientName: '', bloodGroup: 'A+', units: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      showToast('Failed to load blood requests. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestChange = (e) => {
    setNewRequest({ ...newRequest, [e.target.name]: e.target.value });
  };
  
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // The requester ID is now handled by the backend using the auth token
      await axios.post(`${API_URL}/api/requests`, newRequest);
      showToast('Blood request submitted successfully!', 'success');
      setNewRequest({ patientName: '', bloodGroup: 'A+', units: 1 }); // Reset form
      await fetchRequests(); // Re-fetch all requests to get the updated list
    } catch (err) {
      console.error('Failed to create request:', err);
      const errorMsg = err.response?.data?.message || 'An error occurred while creating the request.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth')
  }

  return (
    <main className="page dashboard-page">
      <section className="dashboard-hero">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>
          This is your dashboard. From here, you can track your donations, view active requests,
          and manage your profile.
        </p>
        <button className="primary" onClick={handleLogout}>
          Log out
        </button>
      </section>
      <div className="dashboard-cards">
        {user?.userType === 'recipient' && (
          <div className="card">
            <h3>Create a Request</h3>
            <form onSubmit={handleRequestSubmit} className="auth-form">
              <label className="form-group">
                <span>Patient Name</span>
                <input type="text" name="patientName" value={newRequest.patientName} onChange={handleRequestChange} required disabled={isSubmitting} />
              </label>
              <div className="form-row">
                <label className="form-group">
                  <span>Blood Group</span>
                  <select name="bloodGroup" value={newRequest.bloodGroup} onChange={handleRequestChange} disabled={isSubmitting}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </label>
                <label className="form-group">
                  <span>Units</span>
                  <input type="number" name="units" value={newRequest.units} onChange={handleRequestChange} min="1" required disabled={isSubmitting} />
                </label>
              </div>
              <button type="submit" className="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
        <div className="card">
          <h3>Available Requests</h3>
          {isLoading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {requests.map((req) => (
                <li key={req._id} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <strong>{req.patientName}</strong> needs {req.units} unit(s) of <strong>{req.bloodGroup}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>by {req.requester?.name || '...'}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                    {user?.userType === 'donor' && (
                      <button className="secondary" style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}>
                        Fulfill
                      </button>
                    )}
                    {user?.userType === 'recipient' && req.requester?._id === user.id && (
                      <button className="secondary" style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active requests at the moment.</p>
          )}
        </div>
      </div>
    </main>
  )
}
