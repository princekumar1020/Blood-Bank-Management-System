import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Droplet,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  ArrowRight,
  Filter,
  AlertCircle
} from "lucide-react";

const RecipientDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/donation/my-requests");
                setRequests(res.data);
            } catch (err) {
                console.error("Error fetching requests", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const stats = [
        { 
            label: "My Requests", 
            value: requests.length, 
            icon: <Droplet className="text-red-500" />, 
            sub: "Total" 
        },
        { 
            label: "Active", 
            value: requests.filter(r => r.status === "Pending" || r.status === "Approved").length, 
            icon: <Clock className="text-amber-500" />, 
            sub: "Pending" 
        },
        { 
            label: "Completed", 
            value: requests.filter(r => r.status === "Completed").length, 
            icon: <CheckCircle className="text-green-500" />, 
            sub: "Received" 
        },
    ];

    if (loading) return <div className="p-10 text-center font-bold text-gray-500 uppercase tracking-widest">Loading Dashboard...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-red-600 rounded-3xl p-8 text-white shadow-xl shadow-red-100 flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Recipient Center</h1>
                    <p className="opacity-90 font-medium leading-snug">Find blood donors near your location instantly.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
                    <Droplet size={300} fill="currentColor" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search requests or locations..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-800"
                    />
                </div>
                <button className="bg-gray-50 p-3 rounded-2xl text-gray-500 hover:bg-gray-100 transition-all">
                    <Filter size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                <div className="w-1 h-1 bg-red-500 rounded-full" /> {stat.sub}
                            </span>
                        </div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</div>
                        <div className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                        <Calendar size={18} className="text-red-500" />
                        My Recent Requests
                    </h2>
                </div>
                <div className="divide-y divide-gray-50 flex-1">
                    {requests.length > 0 ? (
                        requests.slice(0, 5).map((req) => (
                            <div key={req._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center font-black text-red-600 shadow-inner group-hover:scale-105 transition-transform">
                                        {req.bloodType}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{req.location || "Default Center"}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                req.status === "Completed" ? "bg-green-100 text-green-700" :
                                                req.status === "Rejected" ? "bg-rose-100 text-rose-700" :
                                                req.status === "Approved" ? "bg-blue-100 text-blue-700" :
                                                "bg-amber-100 text-amber-700"
                                            }`}>
                                                {req.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                                • {new Date(req.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-gray-800 leading-none">{req.quantity}ml</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Requested</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="text-gray-200" />
                            <p className="font-bold text-gray-400 uppercase tracking-widest">No requests found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipientDashboard;