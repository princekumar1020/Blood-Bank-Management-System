import React, { useState, useEffect } from 'react';
import { 
  Droplet, Bell, Hourglass, Activity, ArrowLeft, 
  Edit2, Trash2, X, Menu, Home, FileText, User, Settings, LogOut 
} from 'lucide-react';

const RecipientDashboard = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]); 
  
  const [viewMode, setViewMode] = useState('form'); 
  const [editingId, setEditingId] = useState(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({ bloodGroup: '', units: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchAndCalculateStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/requests/history');
      const data = await response.json();
      
      setRecentRequests(data); 
      setTotalRequests(data.length); 

      const approvedUnits = data
        .filter(item => item.status === 'Approved')
        .reduce((sum, item) => sum + Number(item.units), 0);
        
      setTotalReceived(approvedUnits);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAndCalculateStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const url = editingId 
      ? `http://127.0.0.1:5000/api/requests/${editingId}` 
      : 'http://127.0.0.1:5000/api/requests/add';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStatus({ type: 'success', message: editingId ? 'Request Updated! ✅' : 'Request Submitted! ✅' });
        setFormData({ bloodGroup: '', units: '', reason: '' });
        setEditingId(null);
        setViewMode('all'); 
        await fetchAndCalculateStats(); 
      } else {
        setStatus({ type: 'error', message: 'Operation failed.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Server Error.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    }
  };

  const handleEditClick = (item) => {
    setFormData({ bloodGroup: item.bloodGroup, units: item.units, reason: item.reason });
    setEditingId(item._id); 
    setViewMode('form'); 
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/requests/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert("Deleted Successfully!");
        await fetchAndCalculateStats(); 
      } else { alert("Failed to delete."); }
    } catch (error) { alert("Server error while deleting."); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ bloodGroup: '', units: '', reason: '' });
  };

  const handleNavigation = (mode) => {
    setViewMode(mode);
    setIsSidebarOpen(false);
  };

  const renderHistoryView = () => {
    const listData = viewMode === 'received' ? recentRequests.filter(req => req.status === 'Approved') : recentRequests;
    const title = viewMode === 'received' ? 'Received (Approved)' : 'All Blood Requests';

    return (
      <div className="px-6 pb-8 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setViewMode('form')} className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition">
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        </div>

        <div className="space-y-3">
          {listData.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">No requests found.</p>
          ) : (
            listData.map((item, index) => (
              <div key={item._id || index} className="flex flex-col bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-red-100 flex justify-center items-center text-red-600 font-extrabold text-[13px] border border-red-200">
                       {item.bloodGroup}
                     </div>
                     <div>
                       <p className="text-[13px] font-bold text-gray-800">{item.units} Units</p>
                       <p className="text-[10px] text-gray-500 font-medium">
                         {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                     </div>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-md ${item.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                    {item.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200/60 mt-1">
                  <button onClick={() => handleEditClick(item)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition"><Edit2 size={12} /> Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition"><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-rose-50 via-gray-50 to-red-50 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-5%] left-[20%] w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0"></div>
      <div className="absolute bottom-[-5%] right-[10%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 z-0"></div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* THE SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-3xl border-r border-white shadow-[20px_0_50px_rgba(229,57,53,0.05)] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex`}>
        
        {/* Logo / Header in Sidebar */}
        <div className="px-6 py-8 flex items-center gap-3 border-b border-gray-100">
          <div className="p-2 bg-red-600 rounded-xl text-white shadow-md shadow-red-200">
            <Droplet size={24} fill="currentColor" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">BloodLink</h2>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => handleNavigation('form')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'form' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Home size={18} /> Dashboard
          </button>
          
          <button onClick={() => handleNavigation('all')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FileText size={18} /> My Requests
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all opacity-50 cursor-not-allowed">
            <User size={18} /> Profile <span className="ml-auto text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">Soon</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all opacity-50 cursor-not-allowed">
            <Settings size={18} /> Settings <span className="ml-auto text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">Soon</span>
          </button>
        </div>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-gray-100 m-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
             <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-200 to-orange-100 border-2 border-white shadow-sm"></div>
             <div>
               <p className="text-sm font-bold text-gray-900">Prince</p>
               <p className="text-xs text-gray-500">Recipient</p>
             </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex justify-center items-start md:items-center py-6 px-4 relative z-10 overflow-y-auto">
        
        {/* 🔥 YAHI WOH LINE HAI JISME CHANGE KIYA HAI (max-w-4xl) 🔥 */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_50px_rgba(229,_57,_53,_0.15)] flex flex-col relative border border-white/80 h-fit pb-2 mt-10 md:mt-0">
          
          {/* --- HEADER --- */}
          <div className="flex justify-between items-center px-6 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2 -ml-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              
              <div className="hidden md:block p-1.5 bg-red-100 rounded-full text-red-600">
                <Droplet size={18} fill="currentColor" />
              </div>
              <h1 className="text-sm font-bold text-gray-900">Recipient Panel</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative text-red-400 p-2 bg-red-50 rounded-full cursor-pointer hover:bg-red-100 transition">
                <Bell size={18} fill="currentColor" className="text-red-100" />
                <span className="absolute top-1.5 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </div>
            </div>
          </div>

          {/* --- STATS CARDS --- */}
          {viewMode === 'form' && (
            <div className="grid grid-cols-2 gap-4 px-6 mb-8">
              <div onClick={() => setViewMode('all')} className="bg-[#FFF0F0] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-between cursor-pointer hover:scale-[1.03] transition-transform duration-200 shadow-sm border border-red-50">
                <p className="text-[11px] font-semibold text-gray-600">Total Requests</p>
                <h2 className="text-4xl font-bold text-[#E53935]">{String(totalRequests).padStart(2, '0')}</h2>
                <Hourglass className="absolute bottom-2 right-2 text-red-200 opacity-50" size={32} />
              </div>
              
              <div onClick={() => setViewMode('received')} className="bg-[#E53935] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-between shadow-lg shadow-red-200 cursor-pointer hover:scale-[1.03] transition-all duration-200 border border-red-400">
                <p className="text-[11px] font-semibold text-white/90">Total Received</p>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-4xl font-bold text-white">{String(totalReceived).padStart(2, '0')}</h2>
                  <span className="text-[10px] text-white/80 font-medium">Units</span>
                </div>
                <Activity className="absolute bottom-2 right-2 text-white opacity-20" size={32} />
              </div>
            </div>
          )}

          {/* --- CONDITIONAL RENDERING --- */}
          {viewMode === 'form' ? (
            <div className="px-6 pb-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[15px] font-bold text-gray-900">{editingId ? 'Edit Blood Request' : 'Request Blood'}</h3>
                 {editingId && (
                   <button onClick={cancelEdit} className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">
                     <X size={12}/> Cancel
                   </button>
                 )}
              </div>
              
              {status.message && (
                <div className={`p-3 mb-4 rounded-xl text-xs font-bold text-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Blood Group Needed</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white appearance-none transition-all cursor-pointer">
                    <option value="" disabled>Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (<option key={bg} value={bg}>{bg}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Units Required</label>
                  <input type="number" name="units" value={formData.units} onChange={handleChange} min="1" required placeholder="Number of units" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white transition-all"/>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Reason / Diagnosis</label>
                  <textarea name="reason" value={formData.reason} onChange={handleChange} required rows="2" placeholder="Briefly describe the medical requirement" className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white resize-none transition-all"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#E53935] hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-[12px] transition shadow-lg shadow-red-200/50 mt-4 flex justify-center items-center">
                  {loading ? 'Processing...' : (editingId ? 'Update Request' : 'Submit Request')}
                </button>
              </form>
            </div>
          ) : (
            renderHistoryView()
          )}

        </div>
      </div>
    </div>
  );
};

export default RecipientDashboard;