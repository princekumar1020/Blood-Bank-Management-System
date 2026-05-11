import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusColors = {
  Verified: 'text-blue-600 bg-blue-100',
  Regular: 'text-green-700 bg-green-100',
  Pending: 'text-orange-600 bg-orange-100',
};

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex-1 min-w-[120px] border border-gray-100 flex flex-col gap-1 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 font-semibold mt-1">{title}</div>
    </div>
  );
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['Male', 'Female', 'Other'];

export default function DonorManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [status, setStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    bloodGroup: 'A+',
    gender: 'Male',
    age: '',
    email: '',
    mobileNo: '',
    password: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/api/donor-management/list', {
      params: { search, bloodType, status }
    });
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [search, bloodType, status]);

  const handleAddDonor = () => {
    setForm({ fullName: '', bloodGroup: 'A+', gender: 'Male', age: '', email: '', mobileNo: '', password: '' });
    setShowAdd(true);
  };

  const handleEditDonor = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/donor-management/view/${id}`);
    setForm({
      fullName: res.data.fullName,
      bloodGroup: res.data.bloodGroup,
      gender: res.data.gender,
      age: res.data.age,
      email: res.data.email,
      mobileNo: res.data.mobileNo,
      password: ''
    });
    setSelectedDonor(id);
    setShowEdit(true);
  };

  const handleViewDonor = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/donor-management/view/${id}`);
    setSelectedDonor(res.data);
    setShowView(true);
  };

  const submitAddDonor = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/donor-management/add', form);
    setShowAdd(false);
    fetchData();
  };

  const submitEditDonor = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:5000/api/donor-management/edit/${selectedDonor}`, form);
    setShowEdit(false);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Management</h1>
          <p className="text-gray-500 text-xs">Search and manage registered blood donors</p>
        </div>
        <button onClick={handleAddDonor} className="bg-[#e20000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#b30000]">+ Add Donor</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Donors" value={data.stats.totalDonors} color="text-blue-700" />
        <StatCard title="Regular Donors" value={data.stats.regularDonors} color="text-green-700" />
        <StatCard title="Verified" value={data.stats.verifiedDonors} color="text-blue-600" />
        <StatCard title="Pending" value={data.stats.pendingDonors} color="text-orange-600" />
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-64"
        />
        <select value={bloodType} onChange={e => setBloodType(e.target.value)} className="border rounded px-2 py-2 text-sm">
          <option value="">All Blood Types</option>
          {bloodGroups.map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-2 text-sm">
          <option value="">All Status</option>
          <option value="Verified">Verified</option>
          <option value="Regular">Regular</option>
          <option value="Pending">Pending</option>
        </select>
        <button onClick={fetchData} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">More Filters</button>
        <button className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200">Export Data</button>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-3 px-4 text-left">Donor ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Blood Type</th>
              <th className="py-3 px-4 text-left">Contact</th>
              <th className="py-3 px-4 text-left">Last Donation</th>
              <th className="py-3 px-4 text-left">Total Donations</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.donors.map(donor => (
              <tr key={donor.id} className="border-t">
                <td className="py-2 px-4 font-mono">{donor.donorId}</td>
                <td className="py-2 px-4">{donor.name}</td>
                <td className="py-2 px-4">{donor.bloodGroup}</td>
                <td className="py-2 px-4">
                  <div>{donor.contact.mobileNo}</div>
                  <div className="text-xs text-gray-500">{donor.contact.email}</div>
                </td>
                <td className="py-2 px-4">{donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : '-'}</td>
                <td className="py-2 px-4">{donor.totalDonations}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[donor.status]}`}>{donor.status}</span>
                </td>
                <td className="py-2 px-4">
                  <button onClick={() => handleViewDonor(donor.id)} className="text-blue-600 hover:underline mr-2">View</button>
                  <button onClick={() => handleEditDonor(donor.id)} className="text-gray-700 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Donor Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={submitAddDonor} className="bg-white rounded-xl p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-lg font-bold mb-2">Add Donor</h2>
            <label className="text-sm">Full Name
              <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Blood Group
              <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1">
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </label>
            <label className="text-sm">Gender
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1">
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-sm">Age
              <input type="number" min="18" max="65" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Email
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Mobile No
              <input type="text" value={form.mobileNo} onChange={e => setForm(f => ({ ...f, mobileNo: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Password
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-[#e20000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#b30000]">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit Donor Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={submitEditDonor} className="bg-white rounded-xl p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-lg font-bold mb-2">Edit Donor</h2>
            <label className="text-sm">Full Name
              <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Blood Group
              <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1">
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </label>
            <label className="text-sm">Gender
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1">
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-sm">Age
              <input type="number" min="18" max="65" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Email
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <label className="text-sm">Mobile No
              <input type="text" value={form.mobileNo} onChange={e => setForm(f => ({ ...f, mobileNo: e.target.value }))} className="block w-full border rounded px-2 py-1 mt-1" required />
            </label>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-[#e20000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#b30000]">Save</button>
              <button type="button" onClick={() => setShowEdit(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* View Donor Modal */}
      {showView && selectedDonor && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg min-w-[320px] flex flex-col gap-2">
            <h2 className="text-lg font-bold mb-2">Donor Details</h2>
            <div><b>Name:</b> {selectedDonor.fullName}</div>
            <div><b>Blood Group:</b> {selectedDonor.bloodGroup}</div>
            <div><b>Gender:</b> {selectedDonor.gender}</div>
            <div><b>Age:</b> {selectedDonor.age}</div>
            <div><b>Email:</b> {selectedDonor.email}</div>
            <div><b>Mobile No:</b> {selectedDonor.mobileNo}</div>
            <button onClick={() => setShowView(false)} className="mt-4 bg-gray-200 px-4 py-2 rounded-lg font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
