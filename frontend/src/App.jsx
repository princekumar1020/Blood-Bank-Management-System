import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DonationHistory from './components/DonationHistory';
import NewDonationRequest from './components/NewDonationRequest';
import Profile from './components/Profile';
import DonorDashboard from './components/DonorDashboard';
import RecipientDashboard from './components/RecipientDashboard';
import './App.css';

function App() {
  const [role, setRole] = useState('donor'); // Default role

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 font-sans tracking-tight">
        <Sidebar role={role} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              role === 'donor' ? <DonorDashboard /> : <RecipientDashboard />
            } />
            <Route path="/new-request" element={<NewDonationRequest role={role} />} />
            <Route path="/history" element={<DonationHistory role={role} />} />
            <Route path="/profile" element={
              <Profile onRoleSwitch={handleRoleSwitch} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

