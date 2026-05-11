import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  UserCircle 
} from 'lucide-react';

const Sidebar = ({ role }) => {
    // Navigation items for scalability
    const navItems = [
        { name: role === 'donor' ? 'Donor Dashboard' : 'Recipient Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: role === 'donor' ? 'New Donation' : 'Request Blood', icon: <PlusCircle size={20} />, path: '/new-request' },
        { name: role === 'donor' ? 'Donation History' : 'Requests Status', icon: <History size={20} />, path: '/history' },
        { name: 'Profile Settings', icon: <UserCircle size={20} />, path: '/profile' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Blood Bank</h1>
            </div>
            <nav className="mt-6">
                <div className="px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
