import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Calendar, Filter, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DonationHistory = ({ role }) => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Valued Donor');
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [monthFilter, setMonthFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/user/profile');
                if (res.data && res.data.name) {
                    setUserName(res.data.name);
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
            }
        };

        const fetchHistory = async () => {
            setLoading(true);
            try {
                // Fetch appointments for history as they contain location and status
                const userId = sessionStorage.getItem("userId") || "demo-user-id";
                const res = await axios.get(`http://localhost:5000/api/admin/appointments`);
                
                // Filter appointments for the current user
                const userAppointments = res.data.appointments.filter(app => 
                    app.user && (app.user._id === userId || app.user === userId)
                );

                const mappedHistory = userAppointments.map(app => ({
                    _id: app._id,
                    createdAt: app.date,
                    bloodType: app.user?.bloodGroup || 'Unknown',
                    status: app.status === 'scheduled' ? 'Pending' : 
                            app.status === 'approved' ? 'Approved' : 
                            app.status === 'cancelled' ? 'Rejected' : 
                            app.status.charAt(0).toUpperCase() + app.status.slice(1),
                    appointmentTime: app.date,
                    location: app.location || 'Blood Center',
                    type: 'Donation',
                    units: 1
                }));

                setRequests(mappedHistory);
                setFilteredRequests(mappedHistory);
            } catch (err) {
                console.error('Error fetching history:', err);
                setRequests([]);
                setFilteredRequests([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
        fetchHistory();
    }, [role]);

    useEffect(() => {
        let result = requests;

        if (searchTerm) {
            result = result.filter(req => 
                req._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (req.location && req.location.toLowerCase().includes(searchTerm.toLowerCase()))
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
        }

        setFilteredRequests(result);
    }, [searchTerm, statusFilter, monthFilter, yearFilter, requests]);

    const generateCertificate = (donation) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();

        // Add border
        doc.setLineWidth(5);
        doc.setDrawColor(185, 28, 28); // Red-700
        doc.rect(5, 5, width - 10, height - 10);
        
        doc.setLineWidth(1);
        doc.setDrawColor(220, 38, 38); // Red-600
        doc.rect(10, 10, width - 20, height - 20);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(185, 28, 28);
        doc.text('BLOOD DONATION CERTIFICATE', width / 2, 40, { align: 'center' });

        doc.setFontSize(18);
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
        doc.text('This is to certify that', width / 2, 60, { align: 'center' });

        // Name
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(userName.toUpperCase(), width / 2, 80, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(width / 4, 85, (width * 3) / 4, 85);

        // Message
        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`has successfully donated ${donation.units || 1} unit(s) of Blood`, width / 2, 105, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text(`BLOOD TYPE: ${donation.bloodType}`, width / 2, 120, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.text(`on ${new Date(donation.appointmentTime || donation.createdAt).toLocaleDateString()}`, width / 2, 135, { align: 'center' });
        doc.text(`at ${donation.location || 'Blood Bank Center'}`, width / 2, 145, { align: 'center' });

        doc.text('Your contribution is invaluable and will help save many lives.', width / 2, 165, { align: 'center' });

        // Footer signatures
        doc.setLineWidth(0.5);
        doc.line(40, 185, 100, 185);
        doc.line(width - 100, 185, width - 40, 185);
        
        doc.setFontSize(12);
        doc.text('Medical Director', 70, 192, { align: 'center' });
        doc.text('Program Coordinator', width - 70, 192, { align: 'center' });

        // Donation ID
        doc.setFontSize(10);
        doc.setTextColor(156, 163, 175);
        doc.text(`Certificate No: DN-${donation._id.slice(-6).toUpperCase()}`, 15, height - 15);

        doc.save(`Donation_Certificate_${donation._id.slice(-6)}.pdf`);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle size={14} className="mr-1.5" />;
            case 'Rejected': return <XCircle size={14} className="mr-1.5" />;
            case 'Pending': return <Clock size={14} className="mr-1.5" />;
            default: return null;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );

    const totalDonations = requests.filter(r => r.status === 'Completed').length;
    const totalUnits = requests.filter(r => r.status === 'Completed').reduce((acc, curr) => acc + (curr.units || 1), 0);
    const livesSaved = totalDonations * 3;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Header from Screenshot */}
            {role === 'donor' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-medium mb-4">Total Donations</p>
                        <h3 className="text-4xl font-black text-gray-900">{totalDonations}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-medium mb-4">Blood Units Donated</p>
                        <h3 className="text-4xl font-black text-red-600">{totalUnits} units</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-medium mb-4">Lives Saved</p>
                        <h3 className="text-4xl font-black text-green-600">{livesSaved}</h3>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Donation History</h2>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search donations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none w-64 transition-all"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Donation ID</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Blood Type</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Units</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Certificate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-gray-950 uppercase">DN-{req._id.slice(-5).toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-gray-600">
                                            {new Date(req.appointmentTime || req.createdAt).toISOString().split('T')[0]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-medium text-gray-700">{req.location || 'Central Clinic'}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-black">
                                            {req.bloodType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-bold text-gray-900">{req.units || 1}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black tracking-tight border shadow-sm ${getStatusStyles(req.status)}`}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {req.status === 'Completed' ? (
                                            <button 
                                                onClick={() => generateCertificate(req)}
                                                className="text-sm font-black text-gray-900 hover:text-red-600 transition-colors underline underline-offset-4 decoration-2"
                                            >
                                                Download
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-300 pointer-events-none uppercase tracking-tighter italic">Not Available</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Calendar size={40} className="text-gray-400 mb-3" />
                                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">No donations recorded yet</p>
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

export default DonationHistory;

