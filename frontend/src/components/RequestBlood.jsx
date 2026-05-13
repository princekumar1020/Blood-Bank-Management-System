import React, { useState, useEffect } from 'react';
import { Droplet, Bell, Hourglass, Activity } from 'lucide-react';

const RecipientDashboard = () => {
  // 🔴 LIVE STATES FOR CARDS
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { showToast } = useToast();

  // 🔴 FUNCTION: Fetch Data & Calculate Stats
  const fetchAndCalculateStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/requests/history');
      const data = await response.json();
      
      // 1. Total Requests (Jitni requests database mein hain)
      setTotalRequests(data.length);

      // 2. Total Received (Sirf wo units jinka status 'Approved' hai)
      const approvedUnits = data
        .filter(item => item.status === 'Approved')
        .reduce((sum, item) => sum + Number(item.units), 0);
        
      setTotalReceived(approvedUnits);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Page load hote hi data layega
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

    try {
      const response = await fetch('http://127.0.0.1:5000/api/requests/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showToast('Request submitted successfully! ✅', 'success');
        setFormData({ bloodGroup: '', units: '', reason: '' });
        
        // Form bharne ke baad cards ka number turant update karega
        await fetchAndCalculateStats();
      } else {
        showToast('Failed to submit.', 'error');
        setStatus({ type: 'error', message: 'Failed to submit.' });
      }
    } catch (error) {
      showToast('Server Error.', 'error');
      setStatus({ type: 'error', message: 'Server Error.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 4000); // 4 sec baad message gayab
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-6 font-sans">
      
      <div className="w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl flex flex-col relative border border-gray-100 h-fit pb-6">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-6 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 rounded-full text-red-600">
              <Droplet size={18} fill="currentColor" />
            </div>
            <h1 className="text-sm font-bold text-gray-900">Recipient Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative text-red-400 p-1 bg-red-50 rounded-full">
              <Bell size={18} fill="currentColor" className="text-red-100" />
              <span className="absolute top-1 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
            </div>
            <div className="h-8 w-8 rounded-full bg-red-100 border border-red-200 overflow-hidden">
               <div className="w-full h-full bg-gradient-to-tr from-red-200 to-orange-100"></div>
            </div>
          </div>
        </div>

        {/* --- STATS CARDS (Now Live) --- */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-8">
          {/* Total Requests Card */}
          <div className="bg-[#FFF0F0] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-gray-600">Total Requests</p>
            <h2 className="text-4xl font-bold text-[#E53935]">{String(totalRequests).padStart(2, '0')}</h2>
            <Hourglass className="absolute bottom-2 right-2 text-red-200 opacity-50" size={32} />
          </div>
          
          {/* Total Received Card */}
          <div className="bg-[#E53935] rounded-2xl p-4 relative overflow-hidden h-28 flex flex-col justify-between shadow-md shadow-red-200">
            <p className="text-[11px] font-semibold text-white/90">Total Received</p>
            <div className="flex items-baseline gap-1">
              <h2 className="text-4xl font-bold text-white">{String(totalReceived).padStart(2, '0')}</h2>
              <span className="text-[10px] text-white/80 font-medium">Units</span>
            </div>
            <Activity className="absolute bottom-2 right-2 text-white opacity-20" size={32} />
          </div>
        </div>

        {/* --- REQUEST FORM --- */}
        <div className="px-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Request Blood</h3>
          
          {status.message && (
            <div className={`p-3 mb-4 rounded-xl text-xs font-bold text-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Blood Group Needed</label>
              <select 
                name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white appearance-none transition-all"
              >
                <option value="" disabled>Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Units Required</label>
              <input 
                type="number" name="units" value={formData.units} onChange={handleChange} min="1" required
                placeholder="Number of units"
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 mb-1.5 font-medium">Reason / Diagnosis</label>
              <textarea 
                name="reason" value={formData.reason} onChange={handleChange} required rows="3"
                placeholder="Briefly describe the medical requirement"
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:bg-white resize-none transition-all"
              ></textarea>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-[#E53935] hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-[12px] transition shadow-lg shadow-red-200/50 mt-4 flex justify-center items-center"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default RecipientDashboard;