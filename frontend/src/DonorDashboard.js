import React, { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "./context/ToastContext";
import { Droplet, Calendar, History, Award, Bell, MessageSquare, LogOut, TrendingUp, Heart, User, Edit, Trash2 } from "lucide-react";
import ScheduleAppointment from "./ScheduleAppointment";
import MyProfile from "./MyProfile";
import DonationHistory from "./components/DonationHistory";
import Complaints from "./components/Complaints";
import Certificates from "./components/Certificates";

const sidebarLinks = [
  { label: "Dashboard", icon: <Droplet className="w-5 h-5" /> },
  { label: "Profile", icon: <User className="w-5 h-5" /> },
  { label: "Appointments", icon: <Calendar className="w-5 h-5" /> },
  { label: "Donation History", icon: <History className="w-5 h-5" /> },
  { label: "Certificates", icon: <Award className="w-5 h-5" /> },
  { label: "Community Alerts", icon: <Bell className="w-5 h-5" /> },
  { label: "Complaints", icon: <MessageSquare className="w-5 h-5" /> },
];

// Simulate getting userId from sessionStorage or context
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


export default function DonorDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [userBloodGroup, setUserBloodGroup] = useState("");
  const [latestAppointment, setLatestAppointment] = useState(null);
  const [eligibilityMsg, setEligibilityMsg] = useState("");
  const [canSchedule, setCanSchedule] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const userId = getUserId();
  const { showToast } = useToast();

  useEffect(() => {
    // Always fetch user blood group for appointment form
    axios.get(`http://localhost:5000/api/donor/dashboard?userId=${userId}`)
      .then(res => {
        setUserBloodGroup(res.data?.bloodGroup || "");
        if (activePage === "Dashboard") {
          setStats(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });

    // Fetch history data for certificates
    axios.get(`http://localhost:5000/api/admin/appointments`)
      .then(res => {
        const userAppointments = res.data.appointments.filter(app => 
          app.user && (app.user._id === userId || app.user === userId)
        );
        const mappedHistory = userAppointments.map(app => ({
          _id: app._id,
          createdAt: app.date,
          status: app.status === 'scheduled' ? 'Pending' : 
                  app.status === 'approved' ? 'Approved' : 
                  app.status === 'cancelled' ? 'Rejected' : 
                  app.status.charAt(0).toUpperCase() + app.status.slice(1),
          location: app.location || 'Blood Center'
        }));
        setHistoryData(mappedHistory);
      });

    // Fetch latest appointment for dashboard
    if (activePage === "Dashboard" || activePage === "Appointments") {
      axios.get(`http://localhost:5000/api/donor/latest-appointment?userId=${userId}`)
        .then(res => {
          const appointment = res.data?.appointment || null;
          setLatestAppointment(appointment);
          
          // Eligibility logic
          if (appointment) {
            const status = appointment.status;
            const lastDate = new Date(appointment.date);
            const now = new Date();
            
            // Calculate strictly based on date
            const nextEligibleDate = new Date(lastDate);
            nextEligibleDate.setDate(nextEligibleDate.getDate() + 30);

            if (status === 'completed' || status === 'fulfilled') {
              if (now < nextEligibleDate) {
                setEligibilityMsg(`You are not eligible to donate yet. Your last completed donation was on ${lastDate.toLocaleDateString()}. You can only donate again after 30 days. Please wait until ${nextEligibleDate.toLocaleDateString()}.`);
                setCanSchedule(false);
              } else {
                setEligibilityMsg("");
                setCanSchedule(true);
              }
            } else if (status === 'approved') {
              setEligibilityMsg("Your appointment is approved! Please visit the center at your scheduled time.");
              setCanSchedule(false);
            } else if (status === 'scheduled') {
              setEligibilityMsg("You already have a pending appointment. Please wait for it to be processed.");
              setCanSchedule(false);
            } else if (status === 'cancelled' || status === 'rejected') {
              // If last was rejected/cancelled, they can re-book immediately
              setEligibilityMsg("Your last request was rejected. You can schedule a new appointment now.");
              setCanSchedule(true);
            } else {
              setEligibilityMsg("");
              setCanSchedule(true);
            }
          } else {
            setEligibilityMsg("");
            setCanSchedule(true);
          }
        })
        .catch(() => {
          setLatestAppointment(null);
          setEligibilityMsg("");
          setCanSchedule(true);
        });
    }
  }, [activePage, userId]);

  return (
    <div className="min-h-screen bg-[#f3f3f5] dark:bg-[#0a0a0a] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/95 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-800 flex flex-col py-8 px-4 min-h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <Droplet className="text-[#e20000] fill-transparent stroke-2 h-7 w-7" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">BloodBank Plus</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.label}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-colors ${activePage === link.label ? 'bg-[#ffeaea] text-[#e20000] dark:bg-[#2a0909] dark:text-[#ff6b6b]' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/90">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activePage}</h2>
          <div className="flex items-center gap-6">
            <button
              className="text-red-600 font-bold flex items-center gap-2 hover:underline"
              onClick={() => {
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 p-10">
          {activePage === "Dashboard" && (
            loading ? <div>Loading...</div> : error ? <div className="text-red-600">{error}</div> : (
              <React.Fragment>
                {/* Welcome Banner */}
                <div className="bg-[#e20000] text-white rounded-2xl flex items-center justify-between px-8 py-6 mb-8 shadow-md">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Welcome Back, {stats?.name || "User"}!</h1>
                    <p className="text-base font-medium">Thank you for being a lifesaver. {/* TODO: Next donation eligibility logic */}</p>
                  </div>
                  <button onClick={() => setActivePage("Appointments")}
                    className="bg-white text-[#e20000] font-bold px-6 py-2 rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Book Appointment
                  </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center shadow border border-gray-100 dark:border-gray-700">
                    <Droplet className="text-[#e20000] w-7 h-7 mb-2" />
                    <div className="text-2xl font-bold">{stats?.totalDonations ?? 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-semibold">Total Donations</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center shadow border border-gray-100 dark:border-gray-700">
                    <Heart className="text-blue-500 w-7 h-7 mb-2" />
                    <div className="text-2xl font-bold">{stats?.livesSaved ?? 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-semibold">Lives Saved</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center shadow border border-gray-100 dark:border-gray-700">
                    <Award className="text-green-500 w-7 h-7 mb-2" />
                    <div className="text-2xl font-bold">{stats?.certificates ?? 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-semibold">Certificates</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center shadow border border-gray-100 dark:border-gray-700">
                    <TrendingUp className="text-purple-500 w-7 h-7 mb-2" />
                    <div className="text-2xl font-bold">{stats?.bloodGroup ?? "Any"}</div>
                    <div className="text-gray-500 dark:text-gray-400 font-semibold">Blood Group</div>
                  </div>
                </div>

                {/* Progress and Appointment Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Regular Donor Progress */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700">
                    <div className="font-bold text-lg mb-2">Regular Donor Progress</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                       {historyData.filter(h => h.status === 'Completed').length < 10 ? (
                        <>Donations: <span className="font-bold text-gray-900 dark:text-white">{historyData.filter(h => h.status === 'Completed').length}/10 to Gold Badge</span></>
                      ) : (
                        <>Donations: <span className="font-bold text-gray-900 dark:text-white">{historyData.filter(h => h.status === 'Completed').length}/30 to Platinum Badge</span></>
                      )}
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${historyData.filter(h => h.status === 'Completed').length < 10 ? 'bg-yellow-400' : 'bg-purple-500'}`} 
                        style={{ 
                          width: `${historyData.filter(h => h.status === 'Completed').length < 10 
                            ? Math.min((historyData.filter(h => h.status === 'Completed').length / 10) * 100, 100)
                            : Math.min((historyData.filter(h => h.status === 'Completed').length / 30) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className={`${historyData.filter(h => h.status === 'Completed').length < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'} rounded-lg px-4 py-2 text-sm font-semibold`}>
                      {historyData.filter(h => h.status === 'Completed').length < 10 ? (
                        <>
                          <span className="font-bold">Gold Badge Progress</span> <br />
                          {10 - historyData.filter(h => h.status === 'Completed').length} more donations to achieve Gold status!
                        </>
                      ) : historyData.filter(h => h.status === 'Completed').length < 30 ? (
                        <>
                          <span className="font-bold">Platinum Badge Progress</span> <br />
                          {30 - historyData.filter(h => h.status === 'Completed').length} more donations to achieve Platinum status!
                        </>
                      ) : (
                        <>
                          <span className="font-bold">Ultimate Lifesaver!</span> <br />
                          You have achieved Platinum status!
                        </>
                      )}
                    </div>
                  </div>
                  {/* Upcoming Appointment */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div className="font-bold text-lg mb-2">Upcoming Appointment</div>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      {latestAppointment ? (
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded-lg px-4 py-2 text-base font-semibold mb-3 w-full text-center">
                          <div><b>Date:</b> {latestAppointment.date ? new Date(latestAppointment.date).toLocaleDateString() : '-'}</div>
                          <div><b>Status:</b> {latestAppointment.status === 'scheduled' ? 'Pending' : latestAppointment.status === 'cancelled' ? 'Rejected' : (latestAppointment.status === 'completed' || latestAppointment.status === 'fulfilled') ? 'Completed' : latestAppointment.status.charAt(0).toUpperCase() + latestAppointment.status.slice(1)}</div>
                        </div>
                      ) : (
                        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded-lg px-4 py-2 text-base font-semibold mb-3">
                          No upcoming appointments<br />You're eligible to donate!
                        </div>
                      )}
                      <button onClick={() => setActivePage("Appointments")}
                        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg shadow transition mt-2 ${!canSchedule ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!canSchedule}
                      >Schedule New Appointment</button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )
          )}

          {activePage === "Profile" && (
            <MyProfile userId={userId} />
          )}

          {activePage === "Donation History" && (
            <DonationHistory role="donor" />
          )}

          {activePage === "Certificates" && (
            <Certificates requests={historyData} userName={stats?.name} />
          )}

          {activePage === "Complaints" && (
            <Complaints />
          )}

          {activePage === "Appointments" && (
            <div>
              {/* Recent Appointment Info */}
              {latestAppointment && (
                <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 rounded-lg px-4 py-2 text-base font-semibold mb-6 w-full text-center">
                  <div><b>Date:</b> {latestAppointment.date ? new Date(latestAppointment.date).toLocaleDateString() : '-'}</div>
                  <div><b>Status:</b> {latestAppointment.status === 'scheduled' ? 'Pending' : latestAppointment.status === 'approved' ? 'Approved' : latestAppointment.status === 'cancelled' || latestAppointment.status === 'rejected' ? 'Rejected' : (latestAppointment.status === 'completed' || latestAppointment.status === 'fulfilled') ? 'Completed' : latestAppointment.status.charAt(0).toUpperCase() + latestAppointment.status.slice(1)}</div>
                  {latestAppointment.status === 'approved' && (
                    <>
                      <div><b>Token No.:</b> {latestAppointment.tokenNo || '-'}</div>
                      <div><b>Time Slot:</b> {latestAppointment.timeSlot || '-'}</div>
                    </>
                  )}
                  {(latestAppointment.status === 'completed' || latestAppointment.status === 'fulfilled') && (
                    <div className="text-green-600 font-bold mt-2">Appointment Completed</div>
                  )}
                  {latestAppointment.status === 'scheduled' && (
                    <div className="flex justify-center gap-2 mt-2">
                      <button onClick={() => { setEditMode(true); setEditDate(latestAppointment.date?.slice(0,10)); setEditNotes(latestAppointment.notes || ""); }} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-1 rounded flex items-center gap-1"><Edit className="w-4 h-4" />Edit</button>
                      <button onClick={async () => {
                        if(window.confirm('Are you sure you want to delete this appointment?')) {
                          try {
                            await axios.delete(`http://localhost:5000/api/donor/appointment/${latestAppointment._id}`);
                            setLatestAppointment(null);
                            setActivePage("Dashboard");
                            showToast('Appointment deleted successfully', 'success');
                          } catch (err) {
                            showToast('Failed to delete appointment', 'error');
                          }
                        }
                      }} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-1 rounded flex items-center gap-1"><Trash2 className="w-4 h-4" />Delete</button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Only show Schedule Form if NO active appointment (scheduled/approved) */}
              {(!latestAppointment || ['cancelled', 'rejected', 'completed', 'fulfilled'].includes(latestAppointment.status)) && (
                <ScheduleAppointment 
                  userId={userId} 
                  bloodGroup={userBloodGroup} 
                  onSuccess={() => {
                    setActivePage("Dashboard");
                    // Force refresh latest appointment state
                    axios.get(`http://localhost:5000/api/donor/latest-appointment?userId=${userId}`)
                      .then(res => setLatestAppointment(res.data?.appointment));
                  }} 
                />
              )}
              
              {/* Edit Appointment Modal (reused) */}
              {editMode && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 w-full max-w-md">
                    <h2 className="text-lg font-bold mb-2">Edit Appointment</h2>
                    <label className="block mb-1">Date</label>
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-2 rounded border mb-2" />
                    <label className="block mb-1">Notes</label>
                    <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full p-2 rounded border mb-2" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={async () => {
                        try {
                          await axios.put(`http://localhost:5000/api/donor/appointment/${latestAppointment._id}`, { date: editDate, notes: editNotes });
                          showToast('Appointment updated successfully', 'success');
                          setEditMode(false);
                          setActivePage("Dashboard");
                        } catch (err) {
                          showToast('Failed to update appointment', 'error');
                        }
                      }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1 rounded">Save</button>
                      <button onClick={() => setEditMode(false)} className="bg-gray-400 hover:bg-gray-500 text-white font-bold px-4 py-1 rounded">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
