import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  Droplet, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Heart,
  TrendingUp,
  ArrowRight,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';

const DonorDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/donation/my-requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this pending request?')) {
            try {
                await axios.delete(`http://localhost:5000/api/donation/${id}`);
                // Refresh the list
                fetchRequests();
            } catch (err) {
                console.error('Error deleting request:', err);
                alert('Failed to delete request. Please try again.');
            }
        }
    };

    const stats = [
        { 
            label: 'Total Donations', 
            value: requests.length, 
            icon: <Droplet className="text-red-500" />, 
            sub: 'Requests' 
        },
        { 
            label: 'Completed', 
            value: requests.filter(r => r.status === 'Completed').length, 
            icon: <CheckCircle className="text-green-500" />, 
            sub: 'Success' 
        },
        { 
            label: 'Pending', 
            value: requests.filter(r => r.status === 'Pending').length, 
            icon: <Clock className="text-amber-500" />, 
            sub: 'Waiting' 
        },
        { 
            label: 'Rejected', 
            value: requests.filter(r => r.status === 'Rejected').length, 
            icon: <XCircle className="text-rose-500" />, 
            sub: 'Failed' 
        },
    ];

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="bg-red-600 rounded-[2rem] p-10 text-white shadow-2xl shadow-red-200 flex justify-between items-center overflow-hidden relative border border-red-700">
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">Donor Dashboard</h1>
                    <p className="opacity-90 font-bold text-lg leading-snug">Your next blood donation can directly impact up to 3 lives. Thank you for your service.</p>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
                    <Droplet size={400} fill="currentColor" />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-5">
                            <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-red-50 transition-colors">{stat.icon}</div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    stat.label === 'Completed' ? 'bg-green-500' : 
                                    stat.label === 'Pending' ? 'bg-amber-500' : 
                                    stat.label === 'Rejected' ? 'bg-rose-500' : 'bg-red-500'
                                }`} /> {stat.sub}
                            </span>
                        </div>
                        <div className="text-4xl font-black text-gray-800 tracking-tighter">{stat.value}</div>
                        <div className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-wide">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Donation History */}
                <div className="lg:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h2 className="font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3 text-lg">
                            <Clock size={22} className="text-red-500" />
                            My Donation Requests
                        </h2>
                    </div>
                    <div className="flex-1 divide-y divide-gray-50">
                        {requests.length > 0 ? (
                            requests.slice(0, 5).map((request) => (
                                <div key={request._id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center font-black text-xl text-red-600 group-hover:scale-110 transition-transform shadow-inner">
                                            {request.bloodType}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-800 text-lg">Donation Request</h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${
                                                    request.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    request.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                    request.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {request.status}
                                                </span>
                                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-800">{request.quantity}ml</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Quantity</div>
                                        </div>
                                        {/* Show delete button only if status is Pending */}
                                        {request.status === 'Pending' && (
                                            <button 
                                                onClick={() => handleDelete(request._id)}
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all group/delete shadow-sm"
                                                title="Delete Request"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center gap-4">
                                <AlertCircle size={48} className="text-gray-200" />
                                <p className="font-bold text-gray-400 uppercase tracking-widest">No donation requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;