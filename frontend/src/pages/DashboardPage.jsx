import React from 'react'
import { useAuth } from '../context/AuthContext';
import DonorDashboard from '../components/DonorDashboard';
import RecipientDashboard from '../components/RecipientDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.userType === 'donor') {
    return <DonorDashboard />;
  }

  if (user?.userType === 'recipient') {
    return <RecipientDashboard />;
  }

  return (
    <div className="p-10 text-center font-bold text-gray-500">
      Loading Dashboard...
    </div>
  );
}

