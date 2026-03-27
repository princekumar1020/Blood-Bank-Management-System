import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Calendar, Filter } from 'lucide-react';

const DonationHistory = ({ role }) => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [monthFilter, setMonthFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:5000/api/donation/my-requests');
                console.log('API Response:', res.data);
                if (res.data && res.data.length > 0) {
                    setRequests(res.data);
                    setFilteredRequests(res.data);
                } else {
                    // Start of original logic to show dummy data if empty
                    setRequests([]);
                    setFilteredRequests([]);
                }
            } catch (err) {
                console.error('Error fetching history:', err);
                // Fallback dummy data for visual testing
                const dummyData = role === 'donor' 
                ? [
                    { _id: '65f8a2e1c9e3b4001fb12341', createdAt: '2026-03-15T10:00:00Z', bloodType: 'O+', status: 'Completed', appointmentTime: '2026-03-16T09:00:00Z', location: 'City Central Hospital', type: 'Donation' },
                    { _id: '65f8a2e1c9e3b4001fb12342', createdAt: '2026-03-10T14:30:00Z', bloodType: 'A-', status: 'Rejected', adminNotes: 'Ineligible due to travel', type: 'Donation' },
                ]
                : [
                    { _id: '65f8a2e1c9e3b4001fb12343', createdAt: '2026-03-18T08:00:00Z', bloodType: 'B+', status: 'Pending', location: 'TBD', type: 'Requirement' },
                    { _id: '65f8a2e1c9e3b4001fb12344', createdAt: '2026-02-20T11:00:00Z', bloodType: 'O+', status: 'Approved', appointmentTime: '2026-03-20T14:00:00Z', location: 'Red Cross Center', type: 'Requirement' },
                ];
                setRequests(dummyData);
                setFilteredRequests(dummyData);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [role]);

    useEffect(() => {
        let result = requests;

        if (searchTerm) {
            result = result.filter(req => 
                req._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(req => req.status === statusFilter);
        }

        if (monthFilter !== 'All') {
            result = result.filter(req => {
                const date = new Date(req.createdAt);
                return date.getMonth().toString() === monthFilter && date.getFullYear().toString() === yearFilter;
            });
        } else {
            // Apply year filter even if month is All
            result = result.filter(req => {
                const date = new Date(req.createdAt);
                return date.getFullYear().toString() === yearFilter;
            });
        }

        setFilteredRequests(result);
    }, [searchTerm, statusFilter, monthFilter, yearFilter, requests]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Donation Logs</h2>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search by ID/Type */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search ID or Blood Type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-64"
                        />
                    </div>

                    {/* Status Filter */}
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    {/* Month Filter */}
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg pr-2">
                        <select 
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="pl-3 pr-1 py-2 bg-transparent text-sm outline-none focus:ring-0 appearance-none cursor-pointer font-bold uppercase"
                        >
                            <option value="All">All Months</option>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                <option key={m} value={i}>{m}</option>
                            ))}
                        </select>
                        <div className="w-[1px] h-4 bg-gray-200" />
                        <select 
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="pl-1 pr-2 py-2 bg-transparent text-sm outline-none focus:ring-0 appearance-none cursor-pointer font-black"
                        >
                            {[2026, 2027, 2028].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <Calendar size={14} className="text-gray-400 mr-1" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Request ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Applied Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Blood Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Current Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Appointment Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 transition-colors uppercase font-bold text-[13px]">
                                    <td className="px-6 py-4 text-gray-400">#{req._id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(req.createdAt).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 font-black">
                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100">{req.bloodType}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-4 py-1.5 rounded-full border text-[11px] font-black tracking-widest ${getStatusColor(req.status)} shadow-sm`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-800 flex items-center gap-1.5 uppercase tracking-tight">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                {req.location || 'Pending Location'}
                                            </span>
                                            {req.appointmentTime && (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    Scheduled: {new Date(req.appointmentTime).toLocaleString()}
                                                </span>
                                            )}
                                            {req.adminNotes && (
                                                <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md inline-block w-fit mt-1">
                                                    Note: {req.adminNotes}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-black uppercase tracking-widest">
                                        No donation logs found in database
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

export default DonationHistory;

