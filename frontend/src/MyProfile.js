import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Mail, Phone, Camera, Edit2, Check, X, ShieldCheck } from "lucide-react";

const getUserId = () => localStorage.getItem("userId") || "demo-user-id";

export default function MyProfile({ userId: propUserId }) {
  const userId = propUserId || getUserId();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: "", mobileNo: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/auth/profile?userId=${userId}`)
      .then(res => {
        setUser(res.data);
        setForm({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          role: res.data.role || "",
          mobileNo: res.data.mobileNo || ""
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [userId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      // Auto upload on select for better UX
      handlePhotoUpload(file);
    }
  };

  const handlePhotoUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/profile/${userId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(prev => ({ ...prev, photoUrl: res.data.photoUrl }));
      setPhotoFile(null);
    } catch {
      setError("Failed to upload photo");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/auth/profile/${userId}`, { ...form, photoUrl: user?.photoUrl });
      setUser(prev => ({ ...prev, ...form }));
      setEditMode(false);
    } catch {
      setError("Failed to update profile");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-[#e20000] animate-pulse tracking-widest text-sm">LOADING...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 min-h-screen bg-[#f1f2f4]">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Card Content */}
        <div className="py-10 px-6 md:px-12 flex flex-col items-center">
            
            {/* Avatar Section */}
            <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-[#f3f4f6] p-1 shadow-sm border border-pink-50 flex items-center justify-center overflow-hidden">
                    {user?.photoUrl ? (
                        <img
                            src={`http://localhost:5000${user.photoUrl}`}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="text-3xl font-bold text-gray-400">
                            {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-full">
                            <div className="w-6 h-6 border-2 border-[#e20000] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                {editMode && (
                    <label className="absolute bottom-1 right-1 bg-[#e20000] text-white rounded-full p-2 cursor-pointer shadow-md border-2 border-white transition-transform hover:scale-110">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                )}
            </div>

            {/* Name and Role */}
            <div className="text-center mb-10">
                {editMode ? (
                    <input 
                        type="text" 
                        name="fullName" 
                        value={form.fullName} 
                        onChange={handleChange} 
                        className="text-2xl font-bold text-gray-900 border-b border-gray-200 focus:border-[#e20000] outline-none bg-transparent text-center w-full max-w-xs mb-1" 
                    />
                ) : (
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user?.fullName}</h1>
                )}
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px] sm:text-xs">Recipient Profile</p>
            </div>

            {/* Form Fields - Grid for better spacing */}
            <div className="w-full max-w-md grid grid-cols-1 gap-5 mb-10">
                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email Address</label>
                    {editMode ? (
                        <input 
                            type="email" 
                            name="email" 
                            value={form.email} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-[#f1f2f4] rounded-xl border border-gray-100 focus:border-[#e20000] outline-none font-semibold text-gray-900 text-sm shadow-inner transition-all"
                        />
                    ) : (
                        <div className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-1">
                            {user?.email}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 px-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Number</label>
                    {editMode ? (
                        <input 
                            type="text" 
                            name="mobileNo" 
                            value={form.mobileNo} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-[#f1f2f4] rounded-xl border border-gray-100 focus:border-[#e20000] outline-none font-semibold text-gray-900 text-sm shadow-inner transition-all"
                        />
                    ) : (
                        <div className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-1">
                            {user?.mobileNo || "Not Provided"}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-xs px-2">
                {editMode ? (
                    <div className="flex gap-3">
                        <button 
                            onClick={handleSave} 
                            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors text-sm"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => { setEditMode(false); setForm({...user}); }} 
                            className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-xl hover:bg-gray-500 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setEditMode(true)} 
                        className="w-full bg-[#fbbc05] text-[#713f12] font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-sm uppercase tracking-wider"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            {error && <p className="mt-6 text-center text-[#e20000] text-xs font-bold px-4 py-2 bg-red-50 rounded-lg">{error}</p>}
        </div>
      </div>
    </div>
  );
}
