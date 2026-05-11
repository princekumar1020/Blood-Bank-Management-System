
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RecipientManagement() {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    bloodGroup: '',
    email: '',
    mobileNo: '',
    gender: '',
    age: 18,
    password: '',
  });

  useEffect(() => {
    fetchRecipients();
  }, []);

  // Fetch only users with role 'recipient'
  const fetchRecipients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/recipient-management/recipients');
      setRecipients(res.data.recipients || []);
    } catch (err) {
      setError('Failed to fetch recipients.');
    }
    setLoading(false);
  };

  const handleView = (recipient) => {
    setSelectedRecipient(recipient);
    setViewModalOpen(true);
  };

  const handleEdit = (recipient) => {
    setForm({
      fullName: recipient.fullName,
      bloodGroup: recipient.bloodGroup,
      email: recipient.email,
      mobileNo: recipient.mobileNo,
      gender: recipient.gender,
      age: recipient.age,
      password: '',
    });
    setSelectedRecipient(recipient);
    setShowEdit(true);
  };

  // Add Recipient handler
  const handleAddRecipient = () => {
    setForm({ fullName: '', bloodGroup: '', email: '', mobileNo: '', gender: '', age: 18, password: '' });
    setShowAdd(true);
  };

  const submitAddRecipient = async (e) => {
    e.preventDefault();
    // Frontend validation
    if (!form.fullName || !form.email || !form.mobileNo || !form.bloodGroup || !form.gender || !form.age || !form.password) {
      setError('Please fill all required fields.');
      return;
    }
    if (isNaN(form.age) || form.age < 1 || form.age > 120) {
      setError('Please enter a valid age.');
      return;
    }
    try {
      let payload = {
        fullName: form.fullName,
        email: form.email,
        mobileNo: form.mobileNo,
        gender: form.gender,
        age: form.age,
        password: form.password,
        bloodGroup: form.bloodGroup,
      };
      await axios.post('/api/recipient-management/add', payload);
      setShowAdd(false);
      setError('');
      fetchRecipients();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to add recipient.');
      }
    }
  };

  const submitEditRecipient = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.mobileNo || !form.bloodGroup || !form.gender || !form.age) {
      setError('Please fill all required fields.');
      return;
    }
    if (isNaN(form.age) || form.age < 1 || form.age > 120) {
      setError('Please enter a valid age.');
      return;
    }
    try {
      let payload = {
        fullName: form.fullName,
        email: form.email,
        mobileNo: form.mobileNo,
        gender: form.gender,
        age: form.age,
        bloodGroup: form.bloodGroup,
      };
      if (form.password) payload.password = form.password;
      await axios.put(`/api/recipient-management/edit/${selectedRecipient._id}`, payload);
      setShowEdit(false);
      setError('');
      fetchRecipients();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update recipient.');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipient Management</h1>
          <p className="text-gray-500 text-xs">Manage all recipients (approved and pending)</p>
        </div>
        <button onClick={handleAddRecipient} className="bg-[#e20000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#b30000]">+ Add Recipient</button>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Email</th>
                <th className="py-2 px-4 border">Mobile No</th>
                <th className="py-2 px-4 border">Blood Group</th>
                <th className="py-2 px-4 border">Gender</th>
                <th className="py-2 px-4 border">Age</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r._id}>
                  <td className="py-2 px-4 border">{r.fullName}</td>
                  <td className="py-2 px-4 border">{r.email}</td>
                  <td className="py-2 px-4 border">{r.mobileNo}</td>
                  <td className="py-2 px-4 border">{r.bloodGroup}</td>
                  <td className="py-2 px-4 border">{r.gender}</td>
                  <td className="py-2 px-4 border">{r.age}</td>
                  <td className="py-2 px-4 border">
                    <button className="text-blue-600 underline mr-2" onClick={() => handleView(r)}>View</button>
                    <button className="text-green-600 underline" onClick={() => handleEdit(r)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add Recipient Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form onSubmit={submitAddRecipient} className="bg-white p-6 rounded shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add Recipient</h3>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Mobile No</label>
              <input type="text" value={form.mobileNo} onChange={e => setForm({ ...form, mobileNo: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Age</label>
              <input
                min="1"
                max="120"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="bg-[#e20000] text-white px-4 py-2 rounded">Add</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit Recipient Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form onSubmit={submitEditRecipient} className="bg-white p-6 rounded shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Recipient</h3>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Mobile No</label>
              <input type="text" value={form.mobileNo} onChange={e => setForm({ ...form, mobileNo: e.target.value })} required className="w-full border rounded px-3 py-2" />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Password (leave blank to keep unchanged)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Age</label>
              <input
                min="1"
                max="120"
                value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" className="bg-[#e20000] text-white px-4 py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      )}
      {/* View Modal */}
      {viewModalOpen && selectedRecipient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Recipient Details</h3>
            <div><b>Name:</b> {selectedRecipient.fullName}</div>
            <div><b>Email:</b> {selectedRecipient.email}</div>
            <div><b>Mobile No:</b> {selectedRecipient.mobileNo}</div>
            <div><b>Blood Group:</b> {selectedRecipient.bloodGroup}</div>
            <div><b>Gender:</b> {selectedRecipient.gender}</div>
            <div><b>Age:</b> {selectedRecipient.age}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

