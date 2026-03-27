import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/AdminDashboard";
import DonorManagement from "./pages/DonorManagement";
import Inventory from "./pages/Inventory";
import DonationMaterials from "./pages/DonationMaterials";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/donors" element={<DonorManagement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/materials" element={<DonationMaterials />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;