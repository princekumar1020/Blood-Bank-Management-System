import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const AdminAPI = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const adminAPI = {
  getComplaints: (search) => AdminAPI.get(`/complaints${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  respondToComplaint: (id, payload) => AdminAPI.patch(`/complaints/${id}/respond`, payload),
  updateComplaintStatus: (id, status) => AdminAPI.patch(`/complaints/${id}/status`, { status }),
  deleteComplaint: (id) => AdminAPI.delete(`/complaints/${id}`)
};

// 📌 DONOR API METHODS
export const donorAPI = {
  // Get all donors
  getAllDonors: () => API.get("/donors"),

  // Get single donor
  getDonorById: (id) => API.get(`/donors/${id}`),

  // Create new donor
  createDonor: (donorData) => API.post("/donors", donorData),

  // Update donor
  updateDonor: (id, donorData) => API.put(`/donors/${id}`, donorData),

  // Delete donor
  deleteDonor: (id) => API.delete(`/donors/${id}`),

  // Approve donor
  approveDonor: (id, approvalData) => API.post(`/donors/${id}/approve`, approvalData),

  // Complete donation
  completeDonation: (id, completionData) => API.post(`/donors/${id}/complete`, completionData),

  // Search donors
  searchDonors: (query) => API.get(`/donors/search/query?query=${query}`),

  // Get donors by status
  getDonorsByStatus: (status) => API.get(`/donors/status/${status}`)
};

export default API;