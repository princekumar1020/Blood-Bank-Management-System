import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Droplet, Hospital, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const NewDonationRequest = ({ onDuplicate, role }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bloodType: 'O+',
        urgent: false,
        hospital: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/donation/request', { 
                bloodType: formData.bloodType,
                type: role === 'donor' ? 'Donation' : 'Requirement',
                status: 'Pending',
                quantity: 450,
                location: formData.hospital || 'Default Center',
                adminNotes: formData.reason || 'No notes provided'
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                navigate('/dashboard');
            }, 2000);
            if (onDuplicate) onDuplicate(); 
        } catch (err) {
            console.error('Error submitting request:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-red-100 overflow-hidden border border-gray-100 italic-none">
                <div className="bg-red-600 p-10 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                            {role === 'donor' ? 'Schedule Donation' : 'Request Blood'}
                        </h2>
                        <p className="opacity-80 font-bold uppercase text-[10px] tracking-[0.2em]">
                            {role === 'donor' ? 'Save up to 3 lives today' : 'Find donors in your area'}
                        </p>
                    </div>
                    <Droplet className="absolute right-[-20px] bottom-[-20px] opacity-10" size={180} fill="currentColor" />
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Blood Type */}
                        <div className="space-y-3">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Droplet size={14} className="text-red-500" />
                                Blood Type
                            </label>
                            <select 
                                value={formData.bloodType}
                                onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-gray-800 font-bold focus:ring-2 focus:ring-red-500 transition-all cursor-pointer appearance-none shadow-sm"
                            >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Hospital info for Recipient */}
                        {role === 'recipient' && (
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Hospital size={14} className="text-red-500" />
                                    Hospital Name
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Enter hospital location"
                                    value={formData.hospital}
                                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-gray-800 font-bold focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-red-500" />
                            Additional Notes
                        </label>
                        <textarea 
                            rows="3"
                            placeholder={role === 'donor' ? "Any pre-existing conditions or notes?" : "Briefly describe the emergency need..."}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 text-gray-800 font-bold focus:ring-2 focus:ring-red-500 transition-all shadow-sm resize-none"
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        />
                    </div>

                    {/* Urgent Toggle for Recipient */}
                    {role === 'recipient' && (
                        <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <AlertCircle className="text-amber-500" size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-black text-amber-800 uppercase tracking-tight">Mark as Urgent</div>
                                <div className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">This will alert nearby donors immediately</div>
                            </div>
                            <input 
                                type="checkbox"
                                checked={formData.urgent}
                                onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                                className="w-6 h-6 rounded-lg border-amber-200 text-amber-600 focus:ring-amber-500"
                            />
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-white transition-all shadow-xl ${
                            loading 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-red-200'
                        }`}
                    >
                        {loading ? 'Processing...' : role === 'donor' ? 'Schedule Visit' : 'Submit Live Request'}
                    </button>

                    {success && (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-black uppercase tracking-widest text-sm animate-bounce">
                            <CheckCircle size={20} />
                            Success! Request logged.
                        </div>
                    )}
                </form>
            </div>
            
            <p className="mt-8 text-center text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
                Your privacy is our priority. No data is shared without consent.
            </p>
        </div>
    );
};

export default NewDonationRequest;
