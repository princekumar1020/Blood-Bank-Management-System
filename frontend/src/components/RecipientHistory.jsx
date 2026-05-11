import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

const RecipientHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Dhayan rakhna URL tere backend route se match kare
                const res = await axios.get(`http://localhost:5000/api/donation/my-requests?userId=${userId}`);
                setHistory(res.data);
            } catch (err) {
                console.error("History fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">LOADING HISTORY...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Request History</h2>
                    <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">View all your past blood requests</p>
                </div>
                <div className="p-4 bg-red-50 rounded-2xl">
                    <Calendar className="text-red-500" size={24} />
                </div>
            </div>

            {/* History Table Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Blood Type</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quantity</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date Requested</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.length > 0 ? (
                                history.map((req) => (
                                    <tr key={req._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center font-black text-red-600 group-hover:scale-110 transition-transform">
                                                {req.bloodType}
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-gray-700">{req.quantity}ml</td>
                                        <td className="p-6 text-sm text-gray-500 font-medium">
                                            {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                                req.status === "Completed" ? "bg-green-100 text-green-700" :
                                                req.status === "Rejected" ? "bg-rose-100 text-rose-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>
                                                {req.status === "Completed" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <AlertCircle size={40} className="text-gray-200" />
                                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No history available</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecipientHistory;