import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Droplet, Calendar, History, Award, Bell, MessageSquare, LogOut, 
  TrendingUp, Heart, User, Edit, Trash2, Plus, X, Save, Clock, CheckCircle, Info 
} from "lucide-react";
import MyProfile from "./MyProfile";
import RecipientHistory from "./components/RecipientHistory";
import Complaints from "./components/Complaints";
import CommunityAlerts from "./components/CommunityAlerts";

const sidebarLinks = [
  { label: "Dashboard", icon: <Droplet className="w-5 h-5" /> },
  { label: "Profile", icon: <User className="w-5 h-5" /> },
  { label: "Request blood", icon: <Calendar className="w-5 h-5" /> },
  { label: "Recipient History", icon: <History className="w-5 h-5" /> },
  { label: "Community Alerts", icon: <Bell className="w-5 h-5" /> },
  { label: "Complaints", icon: <MessageSquare className="w-5 h-5" /> },
];

const getUserId = () => {
  return localStorage.getItem("userId") || "demo-user-id";
};

export default function RecipientDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    requestFor: "self",
    bloodGroup: "",
    units: 1,
    reason: ""
  });

  const userId = getUserId();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/recipient/requests?userId=${userId}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests");
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/profile?userId=${userId}`);
      setUser(res.data);
      // Auto-populate bloodGroup if user has it
      setFormData(prev => ({ 
        ...prev, 
        bloodGroup: res.data.bloodGroup || ""
      }));
    } catch (err) {
      console.error("Failed to fetch user profile");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchUser()]);
      setLoading(false);
    };
    init();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "requestFor") {
        if (value === "self") {
          newData.bloodGroup = user?.bloodGroup || "";
        } else {
          newData.bloodGroup = "";
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...formData,
        userId,
        patientName: user?.fullName || ""
      };
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/recipient/request/${isEditing}`, payload);
        alert("Blood request updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/recipient/request", payload);
        alert("Blood request submitted successfully!");
      }
      setShowRequestModal(false);
      setIsEditing(null);
      setFormData({ 
        requestFor: "self", 
        bloodGroup: user?.bloodGroup || "", 
        units: "", 
        reason: "" 
      });
      fetchRequests();
      setActivePage("Dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    }
  };

  const handleEdit = (req) => {
    if (req.status !== "pending") return;
    setIsEditing(req._id);
    setFormData({
      requestFor: req.requestFor,
      bloodGroup: req.bloodGroup,
      units: req.units,
      reason: req.reason || ""
    });
    setActivePage("Request blood");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/recipient/request/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen font-bold text-[#e20000] animate-pulse">Loading Recipient Dashboard...</div>;

  const renderRequestBlood = () => (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#0f172a] mb-2">Request Blood</h1>
        <p className="text-gray-500 font-medium">Submit a new blood request and track its status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-8">Request Details</h2>
          
          <form className="space-y-8">
            {/* Request For */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 ml-1">Request For</label>
              <div className="relative">
                <select 
                  name="requestFor"
                  value={formData.requestFor}
                  onChange={handleInputChange}
                  className="w-full bg-[#f1f2f4] border border-gray-100 rounded-xl py-4 px-5 font-medium text-gray-700 appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="self">Self</option>
                  <option value="family">Family Member</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Plus className="w-5 h-5 text-gray-400 rotate-45" />
                </div>
              </div>
            </div>

            {/* Blood Type and Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 ml-1">Blood Type Required</label>
                <div className="relative">
                  <select 
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    disabled={formData.requestFor === 'self'}
                    onChange={handleInputChange}
                    className={`w-full bg-[#f1f2f4] border border-gray-100 rounded-xl py-4 px-5 font-medium appearance-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${formData.requestFor === 'self' ? 'text-gray-400' : 'text-gray-700'}`}
                  >
                    <option value="" disabled>Select blood type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Plus className="w-5 h-5 text-gray-400 rotate-45" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900 ml-1">Units Required</label>
                <input 
                  type="number"
                  name="units"
                  placeholder="Number of units"
                  value={formData.units}
                  onChange={handleInputChange}
                  className="w-full bg-[#f1f2f4] border border-gray-100 rounded-xl py-4 px-5 font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 ml-1">Note</label>
              <textarea 
                name="reason"
                rows="4"
                placeholder="Add any additional notes here (e.g., hospital name, urgency)..."
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full bg-[#f1f2f4] border border-gray-100 rounded-xl py-4 px-5 font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none placeholder:text-gray-400 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#1e60ff] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-blue-100"
            >
              {isEditing ? 'Update Request' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-[#eff6ff] rounded-3xl p-8 border border-blue-50">
            <h3 className="text-xl font-bold text-[#1e40af] mb-6">Request Guidelines</h3>
            <ul className="space-y-4">
              {[
                "Provide accurate patient information",
                "Emergency requests are prioritized",
                "Expected response time: 2-4 hours",
                "Keep contact number accessible"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#1e40af] mt-1.5">•</span>
                  <span className="text-[#1e40af] font-medium leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#0f172a] mb-6">Available Blood Stock</h3>
            <div className="space-y-4">
               {['A+', 'B+', 'O+', 'AB+'].map(group => (
                 <div key={group} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="font-bold text-gray-900">{group}</span>
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-black">Available</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-8 space-y-8 bg-[#f1f2f4] min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-[#e20000] rounded-3xl p-10 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome Back, {user?.fullName?.split(' ')[0]} !</h1>
          <p className="text-white/80 font-medium">Track your blood requests and get real-time updates</p>
        </div>
        <button 
          onClick={() => { setIsEditing(null); setActivePage("Request blood"); }}
          className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all shadow-md active:scale-95"
        >
          <Calendar className="w-5 h-5 text-[#e20000]" /> Request Blood
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Requests", val: requests.length, icon: <Heart className="text-blue-400 w-8 h-8" /> },
          { label: "Pending", val: requests.filter(r => r.status === 'pending').length, icon: <Clock className="text-red-500 w-8 h-8" /> },
          { label: "Fulfilled", val: requests.filter(r => r.status === 'completed' || r.status === 'fulfilled').length, icon: <CheckCircle className="text-green-500 w-8 h-8" /> },
          { label: "Blood Type", val: user?.bloodGroup || "AB+", icon: <div className="p-0.5 bg-gray-100 rounded-full"><Info className="text-gray-500 w-8 h-8" /></div> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 flex flex-col items-center justify-center space-y-2 shadow-sm">
            <div className="mb-2">{stat.icon}</div>
            <span className="text-4xl font-bold text-gray-800 tracking-tight">{stat.val}</span>
            <span className="text-gray-400 text-sm font-bold">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Active Request Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight ml-2">Active Requests</h2>
        {requests.filter(r => r.status === 'pending').length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {requests.filter(r => r.status === 'pending').map((req, idx) => (
              <div key={req._id} className="bg-[#fff1f2] border-2 border-red-500 rounded-xl p-8 flex justify-between items-center relative gap-6 flex-wrap md:flex-nowrap">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-gray-900">Request #R00{requests.length - idx}</h3>
                    <span className="bg-red-200 text-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-300">Pending</span>
                  </div>
                  <p className="text-gray-800 font-bold text-lg">Requested: <span className="text-gray-900 font-black">{req.units} units ({req.bloodGroup})</span></p>
                  <div className="text-sm text-gray-500 font-black space-y-1">
                    <p>Submitted: {new Date(req.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p>Patient: {req.patientName}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(req)} className="bg-white border text-gray-900 px-6 py-3 rounded-xl font-black shadow-sm hover:bg-gray-50 transition-all text-xs uppercase tracking-wider flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(req._id)} className="bg-red-600 border border-red-700 text-white px-6 py-3 rounded-xl font-black shadow-sm hover:bg-red-700 transition-all text-xs uppercase tracking-wider flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center text-gray-400 font-medium italic border border-dashed border-gray-200 shadow-sm">
             No active pending requests at the moment.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f2f4] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col py-10 px-6 sticky top-0 h-screen z-30 shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => setActivePage("Dashboard")}>
          <Droplet className="text-[#e20000] fill-[#e20000] h-7 w-7" />
          <span className="text-2xl font-black text-gray-900 tracking-tighter leading-6">BloodBank<br/><span className="text-[#e20000]">Plus</span></span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => setActivePage(link.label)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    activePage === link.label 
                      ? "bg-[#fff1f2] text-[#e20000] border-r-4 border-[#e20000]" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {React.cloneElement(link.icon, { className: `w-5 h-5 ${activePage === link.label ? 'text-[#e20000]' : 'text-gray-400'}` })}
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-gray-100 py-6 px-10 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{activePage}</h2>
          <button 
             onClick={() => { localStorage.clear(); window.location.href = "/"; }}
             className="flex items-center gap-2 text-gray-600 font-bold hover:text-[#e20000] transition-colors"
          >
             <LogOut className="w-5 h-5 text-[#e20000]" /> Logout
          </button>
        </header>

        {activePage === "Dashboard" && renderDashboard()}
        {activePage === "Profile" && <MyProfile />}
        {activePage === "Request blood" && renderRequestBlood()}
        {activePage === "Recipient History" && <RecipientHistory />}
        {activePage === "Complaints" && <Complaints />}
        {activePage === "Community Alerts" && <CommunityAlerts />}
        
        {activePage !== "Dashboard" && activePage !== "Profile" && activePage !== "Request blood" && activePage !== "Recipient History" && activePage !== "Complaints" && activePage !== "Community Alerts" && (
           <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
               <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100">
                  <Heart className="w-12 h-12 text-[#fff1f2] fill-[#fff1f2]" />
               </div>
               <p className="text-gray-400 font-bold italic">The {activePage} section is coming soon!</p>
           </div>
        )}
      </main>
    </div>
  );
}
