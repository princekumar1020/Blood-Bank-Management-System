import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Droplet } from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maxCapacity = 50; // assumed max per type for avg capacity

function StatCard({ title, value, color }) {
  return (
    <div className="dashboard-stat-card p-5 flex-1 min-w-[120px] flex flex-col gap-1 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 font-semibold mt-1">{title}</div>
    </div>
  );
}

function InventoryCard({ group, available, expiring, onAddStock }) {
  return (
    <div className="dashboard-stat-card p-5 flex flex-col gap-2 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <Droplet className="text-[#e20000]" size={20} aria-hidden="true" />
        <span className="font-bold text-gray-900">{group}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-green-700">Available</span>
        <span className="ml-auto font-bold">{available}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="h-2 bg-[#e20000]" style={{ width: `${(available / maxCapacity) * 100}%` }}></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Expiring soon</span>
        <span>{expiring}</span>
      </div>
      <button onClick={onAddStock} className="mt-2 bg-[#e20000] text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-[#b30000] transition">Add Stock</button>
    </div>
  );
}

export default function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addGroup, setAddGroup] = useState('A+');
  const [addUnits, setAddUnits] = useState(1);
  const [addExpiry, setAddExpiry] = useState('');
  const [refreshTime, setRefreshTime] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get('http://localhost:5000/api/inventory/summary');
      setData(res.data);
      setRefreshTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load inventory", err);
      setError("Unable to load blood inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStock = (group) => {
    setAddGroup(group);
    setShowAdd(true);
  };

  const submitAddStock = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/inventory/add', {
      bloodGroup: addGroup,
      units: addUnits,
      expiryDate: addExpiry
    });
    setShowAdd(false);
    fetchData();
  };

  useEffect(() => {
    if (showAdd) {
      const today = new Date();
      const expiry = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      setAddExpiry(expiry.toISOString().split('T')[0]);
    }
  }, [showAdd]);

  if (loading) return <div role="status" aria-live="polite" className="flex items-center justify-center min-h-screen">Loading inventory...</div>;
  if (error) return (
    <div className="workspace-page">
      <div role="alert" className="ui-card p-6 text-center">
        <p className="mb-4 text-red-700">{error}</p>
        <button type="button" onClick={fetchData} className="ui-btn ui-btn-primary">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="workspace-page">
      <div className="workspace-toolbar">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Inventory Management</h1>
          <p className="text-gray-500 text-xs">Real-time blood stock tracking with auto-updates<br/>Last updated: {refreshTime}</p>
        </div>
        <button onClick={fetchData} className="ui-btn ui-btn-outline">Refresh</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Units" value={data.totalUnits} color="text-blue-700" />
        <StatCard title="Critical Types" value={data.criticalTypes} color="text-red-600" />
        <StatCard title="Expiring Soon" value={data.expiringSoon} color="text-orange-500" />
        <StatCard title="Avg. Capacity" value={data.avgCapacity + '%'} color="text-blue-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {bloodGroups.map(bg => {
          const inv = data.inventory.find(i => i.bloodGroup === bg) || { availableUnits: 0, expiringUnits: 0 };
          return (
            <InventoryCard
              key={bg}
              group={bg}
              available={inv.availableUnits}
              expiring={inv.expiringUnits}
              onAddStock={() => handleAddStock(bg)}
            />
          );
        })}
      </div>
      {showAdd && (
        <div className="modal-overlay">
          <form onSubmit={submitAddStock} className="modal-panel p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold mb-2">Add Stock for {addGroup}</h2>
            <label className="text-sm">Units
              <input type="number" min="1" value={addUnits} onChange={e => setAddUnits(e.target.value)} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            {/* Expiry date field removed, expiry is set automatically */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button type="submit" className="ui-btn ui-btn-primary">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="ui-btn ui-btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
