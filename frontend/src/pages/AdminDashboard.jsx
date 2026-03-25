import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Table from "../components/Table";
import Toast from "../components/Toast";
import { AddDonationModal } from "../components/Modal";
import API, { AdminAPI } from "../services/api";

export default function AdminDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRecipients: 0,
    pendingRequests: 0
  });
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsResponse, statsResponse] = await Promise.all([
        API.get("/donations"),
        AdminAPI.get("/admin/stats")
      ]);
      
      setDonations(donationsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error loading data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await API.post(`/donations/approve/${id}`);
        showToast("Donation approved successfully!", "success");
      } else if (action === 'complete') {
        await API.post(`/donations/complete/${id}`);
        showToast("Donation completed successfully!", "success");
      }
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating donation:", error);
      showToast("Error updating donation", "error");
    }
  };

  const handleAddDonation = async (donationData) => {
    try {
      await API.post("/donations/create", donationData);
      showToast("Donation added successfully!", "success");
      fetchData();
    } catch (error) {
      console.error("Error adding donation:", error);
      showToast("Error adding donation", "error");
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Blood Bank Management System
          </h1>
          <p className="text-gray-600">Monitor and manage blood donation operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <StatCard
              title="Total Donors"
              value={stats.totalDonors}
              icon="users"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <StatCard
              title="Blood Units Available"
              value={stats.totalBloodUnits}
              icon="droplet"
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <StatCard
              title="Pending Requests"
              value={stats.pendingRequests}
              icon="clock"
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Donations</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track blood donation requests</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Donation
            </button>
          </div>

          <Table data={donations} onAction={handleAction} />
        </div>

      </div>

      {/* Modals */}
      <AddDonationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDonation}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}