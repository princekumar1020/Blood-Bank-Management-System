import { useState, useEffect } from "react";
import { donorAPI } from "../services/api";
import Modal from "../components/Modal";
import Toast from "../components/Toast";

export default function DonorManagement() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "male",
    address: "",
    bloodGroup: "O+",
    weight: "",
    bloodPressure: "",
    hemoglobin: "",
    healthConditions: "",
    notes: ""
  });

  // Fetch all donors
  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter donors based on search and status
  useEffect(() => {
    let filtered = donors;

    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm) ||
        d.bloodGroup.includes(searchTerm)
      );
    }

    setFilteredDonors(filtered);
  }, [donors, searchTerm, statusFilter]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const { data } = await donorAPI.getAllDonors();
      setDonors(data);
      showToast("Donors loaded successfully", "success");
    } catch (err) {
      showToast("Failed to load donors", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (donor = null) => {
    if (donor) {
      setEditingDonor(donor);
      setFormData(donor);
    } else {
      setEditingDonor(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "male",
        address: "",
        bloodGroup: "O+",
        weight: "",
        bloodPressure: "",
        hemoglobin: "",
        healthConditions: "",
        notes: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDonor(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDonor) {
        await donorAPI.updateDonor(editingDonor._id, formData);
        showToast("Donor updated successfully", "success");
      } else {
        await donorAPI.createDonor(formData);
        showToast("Donor added successfully", "success");
      }
      fetchDonors();
      handleCloseModal();
    } catch (err) {
      showToast(err.response?.data?.error || "Error saving donor", "error");
    }
  };

  const handleDeleteDonor = async (id) => {
    if (confirm("Are you sure you want to delete this donor?")) {
      try {
        await donorAPI.deleteDonor(id);
        showToast("Donor deleted successfully", "success");
        fetchDonors();
      } catch (err) {
        showToast("Failed to delete donor", "error");
      }
    }
  };

  const handleApproveDonor = async (id) => {
    const tokenNumber = prompt("Enter token number:");
    const appointmentTime = prompt("Enter appointment time (e.g., 2024-01-15 10:00):");

    if (tokenNumber && appointmentTime) {
      try {
        await donorAPI.approveDonor(id, { tokenNumber, appointmentTime });
        showToast("Donor approved successfully", "success");
        fetchDonors();
      } catch (err) {
        showToast("Failed to approve donor", "error");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Donor Management</h1>
          <button
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            + Add New Donor
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name, email, phone, or blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold">Total Donors</h3>
            <p className="text-3xl font-bold text-gray-900">{donors.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <h3 className="text-yellow-600 text-sm font-semibold">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{donors.filter(d => d.status === "pending").length}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <h3 className="text-blue-600 text-sm font-semibold">Approved</h3>
            <p className="text-3xl font-bold text-blue-600">{donors.filter(d => d.status === "approved").length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <h3 className="text-green-600 text-sm font-semibold">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{donors.filter(d => d.status === "completed").length}</p>
          </div>
        </div>

        {/* Donors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading donors...</div>
          ) : filteredDonors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No donors found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Blood Group</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDonors.map(donor => (
                    <tr key={donor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{donor.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donor.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donor.phone}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">{donor.bloodGroup}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donor.age}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(donor.status)}`}>
                          {donor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(donor)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                          >
                            Edit
                          </button>
                          {donor.status === "pending" && (
                            <button
                              onClick={() => handleApproveDonor(donor._id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDonor(donor._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingDonor ? "Edit Donor" : "Add New Donor"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="bloodPressure"
                placeholder="Blood Pressure (e.g., 120/80)"
                value={formData.bloodPressure}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                name="hemoglobin"
                placeholder="Hemoglobin (g/dL)"
                step="0.1"
                value={formData.hemoglobin}
                onChange={handleInputChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                name="healthConditions"
                placeholder="Health Conditions"
                value={formData.healthConditions}
                onChange={handleInputChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
              />
              <textarea
                name="notes"
                placeholder="Additional Notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                {editingDonor ? "Update Donor" : "Add Donor"}
              </button>
            </div>
          </form>
        </Modal>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
