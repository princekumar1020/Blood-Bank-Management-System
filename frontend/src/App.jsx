import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/AdminDashboard";
import DonorManagement from "./pages/DonorManagement";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/donors" element={<DonorManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;