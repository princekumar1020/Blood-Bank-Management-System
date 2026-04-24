
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";



import Home from "./Home";
import Auth from "./Auth";
import RecipientDashboard from "./RecipientDashboard";
import DonorDashboard from "./DonorDashboard";
import AdminDashboard from "./AdminDashboard";
import Inventory from "./Inventory";
import DonorManagement from "./DonorManagement";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/recipient-dashboard" element={<RecipientDashboard />} />
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/donor-management" element={<DonorManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
