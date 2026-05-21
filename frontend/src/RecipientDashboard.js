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
  { label: "Request Blood", icon: <Calendar className="w-5 h-5" /> },
  { label: "Recipient History", icon: <History className="w-5 h-5" /> },
  { label: "Community Alerts", icon: <Bell className="w-5 h-5" /> },
  { label: "Complaints", icon: <MessageSquare className="w-5 h-5" /> },
];

const getUserId = () => {
  const storedUserId = sessionStorage.getItem("userId");
  if (storedUserId) return storedUserId;
  const storedUser = sessionStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser)?.id || "demo-user-id";
    } catch {
      return "demo-user-id";
    }
  }
  return "demo-user-id";
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
      const sortedRequests = (res.data || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sortedRequests);
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
    setActivePage("Request Blood");
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
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Request Blood</h1>
          <p className="text-gray-500 text-base">Submit a new blood request and get fast support from the community.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(null);
            setFormData({ requestFor: 'self', bloodGroup: user?.bloodGroup || '', units: 1, reason: '' });
            setActivePage('Dashboard');
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#e20000] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-200/20 hover:bg-red-600 transition"
        >
          <Calendar className="w-5 h-5" /> Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-10 shadow-lg">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Request Details</h2>
          <form className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Request For</label>
                <select
                  name="requestFor"
                  value={formData.requestFor}
                  onChange={handleInputChange}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700 font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                >
                  <option value="self">Self</option>
                  <option value="family">Family Member</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Blood Group</label>
                <input
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  disabled={formData.requestFor === 'self'}
                  onChange={handleInputChange}
                  placeholder="Select blood type"
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700 font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Units Required</label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700 font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  min={1}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Urgency Note</label>
                <span className="block text-sm text-gray-500">Use the note field to share patient details, hospital name, or delivery needs.</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">Additional Notes</label>
              <textarea
                name="reason"
                rows={5}
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Add any extra request details..."
                className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-700 font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-3xl bg-[#e20000] px-6 py-4 text-lg font-bold text-white shadow-lg shadow-red-200/30 transition hover:bg-red-600"
            >
              {isEditing ? 'Update Request' : 'Submit Request'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Guidelines</h3>
            <ul className="space-y-4 text-gray-600">
              {[
                'Provide accurate contact and patient information',
                'Emergency requests receive priority attention',
                'Expect response updates within 2-4 hours',
                'Keep your phone available for blood bank follow-up',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-[#fff7f7] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Available Blood Stock</h3>
            <div className="space-y-4">
              {['A+', 'B+', 'O+', 'AB+'].map((group) => (
                <div key={group} className="flex items-center justify-between rounded-3xl bg-white px-5 py-4 shadow-sm">
                  <span className="font-semibold text-gray-900">{group}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">Available</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-8 space-y-8 bg-[#f3f3f5] min-h-screen">
      <div className="rounded-3xl bg-white p-10 shadow-lg border border-gray-100 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-lg">Monitor your blood requests and see updates from the community in one place.</p>
        </div>
        <button
          onClick={() => { setIsEditing(null); setActivePage('Request Blood'); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#e20000] px-6 py-4 text-white font-bold shadow-lg shadow-red-200/20 hover:bg-red-600 transition"
        >
          <Calendar className="w-5 h-5" /> Request Blood
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: requests.length, icon: <Heart className="text-red-500 w-7 h-7" /> },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: <Clock className="text-yellow-500 w-7 h-7" /> },
          { label: 'Fulfilled', value: requests.filter(r => r.status === 'completed' || r.status === 'fulfilled').length, icon: <CheckCircle className="text-green-500 w-7 h-7" /> },
          { label: 'Blood Group', value: user?.bloodGroup || 'Unknown', icon: <Info className="text-blue-500 w-7 h-7" /> },
        ].map((card, index) => (
          <div key={index} className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">{card.icon}</div>
            <div className="text-3xl font-black text-gray-900">{card.value}</div>
            <div className="text-sm font-semibold text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Pending Requests</h2>
              <p className="text-gray-500">Requests needing attention from the blood bank and community.</p>
            </div>
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">{requests.filter(r => r.status === 'pending').length} open</span>
          </div>
          {requests.filter(r => r.status === 'pending').length > 0 ? (
            <div className="space-y-4">
              {requests.filter(r => r.status === 'pending').map((req, idx) => (
                <div key={req._id} className="rounded-[2rem] border border-red-100 bg-red-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Request #{requests.length - idx}</h3>
                      <p className="text-gray-600">{req.units} units • {req.bloodGroup}</p>
                    </div>
                    <span className="rounded-3xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">Pending</span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-3 text-gray-600">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-gray-400">Submitted</div>
                      <div className="mt-2 font-semibold">{new Date(req.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-gray-400">Patient</div>
                      <div className="mt-2 font-semibold">{req.patientName}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-gray-400">Requested for</div>
                      <div className="mt-2 font-semibold capitalize">{req.requestFor}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => handleEdit(req)} className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Edit</button>
                    <button onClick={() => handleDelete(req._id)} className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
              You don’t have any active pending requests right now.
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-gray-500">If you have questions about your request or need urgent support, contact the blood bank team immediately.</p>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => setActivePage('Request Blood')} className="w-full rounded-2xl bg-[#e20000] px-4 py-3 text-sm font-bold text-white hover:bg-red-600 transition">Create New Request</button>
              <button onClick={() => setActivePage('Community Alerts')} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">Open Community Wall</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f3f5] flex font-sans">
      <aside className="w-64 bg-white/95 border-r border-gray-200 flex flex-col py-8 px-6 min-h-screen shadow-sm">
        <div className="flex items-center gap-2 mb-10 px-2">
          <Droplet className="text-[#e20000] fill-transparent stroke-2 h-7 w-7" />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">BloodBank Plus</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-colors ${activePage === link.label ? 'bg-[#ffeaea] text-[#e20000]' : 'text-gray-700 hover:bg-gray-100'}`}
                  onClick={() => setActivePage(link.label)}
                >
                  {link.icon}
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-white/95 sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-900">{activePage}</h2>
          <button 
             onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}
             className="flex items-center gap-2 text-gray-600 font-bold hover:text-[#e20000] transition-colors"
          >
             <LogOut className="w-5 h-5 text-[#e20000]" /> Logout
          </button>
        </header>

        {activePage === 'Dashboard' && renderDashboard()}
        {activePage === 'Profile' && <MyProfile />}
        {activePage === 'Request Blood' && renderRequestBlood()}
        {activePage === 'Recipient History' && <RecipientHistory />}
        {activePage === 'Complaints' && <Complaints />}
        {activePage === 'Community Alerts' && <CommunityAlerts user={user} />}

        {activePage !== 'Dashboard' && activePage !== 'Profile' && activePage !== 'Request Blood' && activePage !== 'Recipient History' && activePage !== 'Complaints' && activePage !== 'Community Alerts' && (
           <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
               <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100">
                  <Heart className="w-12 h-12 text-[#e20000]" />
               </div>
               <p className="text-gray-400 font-bold italic">The {activePage} section is coming soon!</p>
           </div>
        )}
      </main>
    </div>
  );
}
