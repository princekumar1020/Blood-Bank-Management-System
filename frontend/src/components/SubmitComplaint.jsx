import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const SubmitComplaint = () => {
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const categories = [
        'Staff Behavior',
        'Facility Cleanliness',
        'Donation Process Delay',
        'Website/App Issue',
        'Wrong Information',
        'Other'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/complaints', formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessage({ type: 'success', text: res.data.message || 'Complaint submitted successfully!' });
                setFormData({ category: '', subject: '', description: '' });
            } else {
                setMessage({ type: 'error', text: res.data.message || 'Failed to submit complaint. Please try again.' });
            }
        } catch (err) {
            console.error('Error submitting complaint:', err);
            const errorText = err?.response?.data?.message || err?.message || 'Failed to submit complaint. Please try again.';
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">New Complaint</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {message.text && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <p className="font-bold text-xs tracking-tight">{message.text}</p>
                        </div>
                    )}

                    <div className="space-y-3.5">
                        <div>
                            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Category</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full px-3.5 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Subject</label>
                            <input 
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="Brief description..."
                                className="w-full px-3.5 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1.5">Detailed Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="3"
                                placeholder="Please provide details about your complaint..."
                                className="w-full px-3.5 py-2.5 bg-gray-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md shadow-red-200 hover:bg-red-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Submitting...' : (
                            <>
                                <Send size={14} /> Submit Complaint
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitComplaint;
