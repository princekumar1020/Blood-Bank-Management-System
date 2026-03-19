import React, { useState, useEffect } from 'react';

const ReceiptHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/requests/history');
        const data = await response.json();
        setHistory(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (selectedDate === '') return true;
    const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
    return itemDate === selectedDate;
  });

  return (
    // 🔴 Premium Gradient Background
    <div className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100">
      
      {/* 🔴 Background Glowing Blobs (Modern Look) */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      {/* 🔴 Glassmorphism Card ( mt-16 ADD KIYA HAI NAVBAR SE DOOR RAKHNE KE LIYE 👇 ) */}
      <div className="relative z-10 max-w-5xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 p-8 mt-16">
        
        {/* Glowing Text for Heading */}
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 mb-8 text-center drop-shadow-sm">
          🩸 My Blood Requests History
        </h2>

        {/* Floating Filter Box */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-gray-100 shadow-sm backdrop-blur-md hover:shadow-md transition-shadow">
            <label className="text-gray-700 font-bold text-sm">📅 Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 font-medium cursor-pointer"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-white font-bold px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          // Animated Loading Spinner
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mb-4"></div>
            <p className="text-red-500 font-bold animate-pulse">Fetching your records...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-xl border border-dashed border-red-200">
            <p className="text-gray-500 text-xl font-medium">No requests found for this date. 🕵️‍♂️</p>
            {selectedDate && <p className="text-sm text-gray-400 mt-2">Try clearing the filter to see all your past requests.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full bg-white/90">
              <thead className="bg-gradient-to-r from-red-50 to-white border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-bold text-red-800 tracking-wider">Blood Group</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 tracking-wider">Units Needed</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 tracking-wider">Reason</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 tracking-wider">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-red-50/50 transition-all duration-200">
                    <td className="py-4 px-6">
                      <span className="bg-red-100 text-red-700 font-extrabold px-3 py-1 rounded-lg text-sm border border-red-200 shadow-sm">
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-semibold">{item.units} <span className="text-gray-400 text-xs">Units</span></td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{item.reason}</td>
                    <td className="py-4 px-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm inline-block ${
                        item.status === 'Approved' 
                          ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200' 
                          : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {item.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm font-medium">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute:'2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptHistory;