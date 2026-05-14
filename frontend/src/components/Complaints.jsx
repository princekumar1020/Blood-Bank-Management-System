import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, MessageSquare, Send, CheckCircle, Clock } from "lucide-react";
import { useToast } from '../context/ToastContext';
import API from '../services/api';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        message: "",
        category: "general"
    });
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const userId = sessionStorage.getItem("userId");
    const { showToast } = useToast();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await API.get(`/complaints?userId=${userId}`);
                setComplaints(res.data || []);
            } catch (err) {
                console.error("Complaints fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/complaints", {
                userId,
                category: formData.category,
                title: formData.subject,
                description: formData.message
            });
            setFormData({ subject: "", message: "", category: "general" });
            setShowForm(false);
            // Refresh complaints list
            const res = await API.get(`/complaints?userId=${userId}`);
            setComplaints(res.data || []);
            showToast("Complaint submitted successfully!", 'success');
        } catch (err) {
            console.error("Complaint submission error", err);
            showToast("Failed to submit complaint", 'error');
        }
    };

    const handleReopen = async (complaintId) => {
        try {
            await API.patch(`/complaints/${complaintId}/reopen`, { userId });
            // Refresh complaints
            const res = await API.get(`/complaints?userId=${userId}`);
            setComplaints(res.data || []);
            showToast("Complaint reopened successfully!", 'success');
        } catch (err) {
            console.error("Reopen error", err);
            showToast("Failed to reopen complaint", 'error');
        }
    };

    const handleViewComplaint = (complaint) => {
        setSelectedComplaint(complaint);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedComplaint(null);
    };

    if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">LOADING COMPLAINTS...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Complaints</h2>
                    <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">Report issues and track resolutions</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                >
                    <MessageSquare size={20} /> New Complaint
                </button>
            </div>

            {/* Complaint Form */}
            {showForm && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit a Complaint</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-medium text-gray-700 focus:ring-2 focus:ring-red-500 transition-all"
                            >
                                <option value="general">General</option>
                                <option value="service">Service Quality</option>
                                <option value="staff">Staff Behavior</option>
                                <option value="facility">Facility Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                            <input 
                                type="text"
                                name="subject"
                                placeholder="Brief complaint title"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-medium text-gray-700 focus:ring-2 focus:ring-red-500 transition-all outline-none placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Message</label>
                            <textarea 
                                name="message"
                                placeholder="Describe your complaint in detail..."
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows="5"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-medium text-gray-700 focus:ring-2 focus:ring-red-500 transition-all outline-none placeholder:text-gray-400 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="submit"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Send size={18} /> Submit Complaint
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Complaints Table Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Subject</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date Submitted</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Latest Response</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {complaints.length > 0 ? (
                                complaints.map((complaint) => (
                                    <tr key={complaint._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 font-bold text-gray-700">{complaint.subject || complaint.title}</td>
                                        <td className="p-6">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700">
                                                {complaint.category}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm text-gray-500 font-medium">
                                            {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                complaint.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                complaint.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                                                complaint.status === "responded" ? "bg-blue-100 text-blue-700" :
                                                complaint.status === "reopened" ? "bg-fuchsia-100 text-fuchsia-700" :
                                                complaint.status === "resolved" ? "bg-green-100 text-green-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>
                                                {complaint.status === "resolved" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {complaint.status === "pending" ? "Pending" :
                                                 complaint.status === "in-progress" ? "In Review" :
                                                 complaint.status === "responded" ? "Responded" :
                                                 complaint.status === "reopened" ? "Reopened" :
                                                 complaint.status === "resolved" ? "Resolved" :
                                                 complaint.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm text-gray-600 max-w-xs truncate">
                                            {complaint.adminResponse || 'No response yet'}
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewComplaint(complaint)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                                >
                                                    <MessageSquare size={14} />
                                                    View
                                                </button>
                                                {complaint.status === 'resolved' && (
                                                    <button
                                                        onClick={() => handleReopen(complaint._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-fuchsia-700 bg-fuchsia-100 rounded-full hover:bg-fuchsia-200 transition-colors"
                                                    >
                                                        <AlertCircle size={14} />
                                                        Reopen
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <AlertCircle size={40} className="text-gray-200" />
                                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No complaints submitted yet</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Complaint Details Modal */}
            {showModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">{selectedComplaint.subject || selectedComplaint.title}</h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <AlertCircle size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</p>
                                <p className="text-gray-800 capitalize">{selectedComplaint.category}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Message</p>
                                <p className="text-gray-800 bg-gray-50 p-4 rounded-xl">{selectedComplaint.message || selectedComplaint.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</p>
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-tighter ${
                                    selectedComplaint.status === "pending" ? "bg-amber-100 text-amber-700" :
                                    selectedComplaint.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                                    selectedComplaint.status === "responded" ? "bg-blue-100 text-blue-700" :
                                    selectedComplaint.status === "reopened" ? "bg-fuchsia-100 text-fuchsia-700" :
                                    selectedComplaint.status === "resolved" ? "bg-green-100 text-green-700" :
                                    "bg-red-100 text-red-700"
                                }`}>
                                    {selectedComplaint.status === "resolved" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {selectedComplaint.status === "pending" ? "Pending" :
                                     selectedComplaint.status === "in-progress" ? "In Review" :
                                     selectedComplaint.status === "responded" ? "Responded" :
                                     selectedComplaint.status === "reopened" ? "Reopened" :
                                     selectedComplaint.status === "resolved" ? "Resolved" :
                                     selectedComplaint.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Admin Response</p>
                                <p className="text-gray-800 bg-gray-50 p-4 rounded-xl">{selectedComplaint.adminResponse || 'No response yet'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Submitted On</p>
                                <p className="text-gray-800">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Complaints;
