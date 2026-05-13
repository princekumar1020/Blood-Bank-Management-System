import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Phone, Repeat } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Profile = ({ onRoleSwitch }) => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        mobile: '',
        role: 'donor',
        profilePic: ''
    });
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [mobile, setMobile] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/user/profile');
                setUser(res.data);
                setMobile(res.data.mobile || '');
                setProfilePic(res.data.profilePic || '');
            } catch (err) {
                console.error('Error fetching profile', err);
                const dummyUser = {
                    name: 'John Doe',
                    email: 'john@example.com',
                    mobile: '1234567890',
                    role: 'donor',
                    profilePic: 'https://via.placeholder.com/150'
                };
                setUser(dummyUser);
                setMobile(dummyUser.mobile);
                setProfilePic(dummyUser.profilePic);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            
            // Log for debugging
            console.log("Saving changes for donor profile...");
            
            if (mobile) {
                formData.append('mobile', mobile);
            }
            
            if (imageFile) {
                formData.append('profilePic', imageFile);
                console.log("Image file included in save");
            }

            // Using axios with a slightly longer timeout just in case for large images
            const res = await axios.put('/api/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000 // 30 seconds
            });
            
            if (res.data) {
                console.log("Profile saved successfully:", res.data);
                setUser(res.data);
                if (res.data.profilePic) {
                    setProfilePic(res.data.profilePic);
                }
                setEdit(false);
                setImageFile(null);
                showToast("Profile changes saved successfully!", 'success');
            }
        } catch (err) {
            console.error('Error updating donor profile:', err.response || err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error";
            showToast(`Failed to save changes: ${errorMessage}. Please check if the image is too large or server is down.`, 'error');
            setEdit(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSwitchRole = async () => {
        try {
            const res = await axios.put('/api/user/switch-role');
            setUser(prev => ({ ...prev, role: res.data.role }));
            if (onRoleSwitch) onRoleSwitch(res.data.role);
        } catch (err) {
            console.error('Error switching role', err);
            const newRole = user.role === 'donor' ? 'recipient' : 'donor';
            setUser(prev => ({ ...prev, role: newRole }));
            if (onRoleSwitch) onRoleSwitch(newRole);
        }
    };

    if (loading) return <p className="text-center p-8">Loading profile...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <img 
                            src={profilePic || 'https://via.placeholder.com/150'} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full border-4 border-red-50 object-cover shadow-md"
                        />
                        {edit && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-[10px] text-center p-2 cursor-pointer">
                                <label className="cursor-pointer">
                                    Click to change
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                                user.role === 'donor' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                                {user.role || 'donor'}
                            </span>
                        </div>
                    </div>

                    <div className="w-full border-t border-gray-50 pt-6 space-y-4">
                        {!edit ? (
                            <>
                                <div className="flex items-center gap-4 text-gray-700 font-medium bg-gray-50 p-4 rounded-xl">
                                    <Phone size={20} className="text-gray-400" />
                                    <span>{user.mobile || 'No mobile added'}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setEdit(true)}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 ml-1">Profile Picture</label>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => document.getElementById('profile-pic-input').click()}
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition text-left text-gray-500 font-medium"
                                        >
                                            {profilePic ? 'Image selected' : 'Choose image...'}
                                        </button>
                                        <input 
                                            id="profile-pic-input"
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600 ml-1">Mobile Number</label>
                                    <input 
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        placeholder="Phone number..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setEdit(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
