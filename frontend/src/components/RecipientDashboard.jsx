import React, { useEffect, useState } from "react";
import RecipientHistory from "./RecipientHistory"; 
import axios from "axios";
import {
  Users, Droplet, Calendar, CheckCircle, Clock, Search, Filter, AlertCircle, LogOut, MessageSquare, Bell
} from "lucide-react";

const RecipientDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState("Dashboard"); 

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

    // Dashboard View ka code (Screenshot 703 ke hisab se)
    const renderDashboardContent = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-red-600 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back, Pawanpreet !</h1>
                    <p className="opacity-90">Track your blood requests and get real-time updates</p>
                </div>
                <button className="bg-white text-red-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
                    <Calendar size={18} /> Request Blood
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="text-4xl font-bold text-gray-800">{requests.length}</div>
                    <div className="text-sm font-medium text-gray-400 mt-1">Total Requests</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="text-4xl font-bold text-gray-800">{requests.filter(r => r.status === "Pending").length}</div>
                    <div className="text-sm font-medium text-gray-400 mt-1">Pending</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="text-4xl font-bold text-gray-800">{requests.filter(r => r.status === "Completed").length}</div>
                    <div className="text-sm font-medium text-gray-400 mt-1">Fulfilled</div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="text-4xl font-bold text-gray-800">A+</div>
                    <div className="text-sm font-medium text-gray-400 mt-1">Blood Type</div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Active Requests</h2>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center text-gray-400">
                    No active pending requests at the moment.
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-[#f1f2f4]">
            {/* Sidebar Fix: IDs match the conditions below */}
            <aside className="w-72 bg-white border-r border-gray-100 p-8 fixed h-full z-30">
                <div className="text-2xl font-black text-gray-800 mb-12 flex items-center gap-2">
                    <Droplet className="text-red-600" fill="currentColor" /> BloodBank+
                </div>
                
                <nav className="space-y-4">
                    <button onClick={() => setActivePage("Dashboard")} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold ${activePage === "Dashboard" ? "bg-red-50 text-red-600" : "text-gray-400"}`}>
                        <Droplet size={20} /> Dashboard
                    </button>
                    <button onClick={() => setActivePage("Recipient History")} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold ${activePage === "Recipient History" ? "bg-red-50 text-red-600" : "text-gray-400"}`}>
                        <Clock size={20} /> Recipient History
                    </button>
                    {/* Add other buttons like Profile, Complaints here if needed */}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 ml-72 p-10">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-xl font-bold text-gray-800">{activePage}</h2>
                    <button onClick={() => window.location.href="/"} className="text-red-600 font-bold">Logout</button>
                </header>

                {/* YAHAN FIX HAI: Ye render conditions exact honi chahiye */}
                {activePage === "Dashboard" && renderDashboardContent()}
                
                {/* Ab ye History wala component render hoga jab click karoge */}
                {activePage === "Recipient History" && <RecipientHistory />}
            </main>
        </div>
    );
};

export default RecipientDashboard;