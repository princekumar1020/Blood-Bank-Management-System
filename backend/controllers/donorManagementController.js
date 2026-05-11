const bcrypt = require('bcryptjs');
// Add a new donor
exports.addDonor = async (req, res) => {
  try {
    const { fullName, bloodGroup, gender, age, email, mobileNo, password } = req.body;
    if (!fullName || !bloodGroup || !gender || !age || !email || !mobileNo || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    user = new User({ fullName, role: 'donor', gender, bloodGroup, age, email, mobileNo, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add donor', details: err.message });
  }
};

// Edit donor
exports.editDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, bloodGroup, gender, age, email, mobileNo } = req.body;
    const user = await User.findById(id);
    if (!user || user.role !== 'donor') return res.status(404).json({ error: 'Donor not found' });
    user.fullName = fullName || user.fullName;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.gender = gender || user.gender;
    user.age = age || user.age;
    user.email = email || user.email;
    user.mobileNo = mobileNo || user.mobileNo;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit donor', details: err.message });
  }
};

// View donor
exports.getDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user || user.role !== 'donor') return res.status(404).json({ error: 'Donor not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donor', details: err.message });
  }
};
const User = require('../models/User');
const Donation = require('../models/Donation');

// Get all donors with stats, search, filter
exports.getDonors = async (req, res) => {
  try {
    const { search = '', bloodType = '', status = '' } = req.query;
    // Build query
    const query = { role: 'donor' };
    if (bloodType) query.bloodGroup = bloodType;
    if (search) query.fullName = { $regex: search, $options: 'i' };
    // For status, you can add logic for verified, regular, pending, etc.
    // For now, just fetch all donors
    const donors = await User.find(query).select('-password');
    // For each donor, get last donation, total donations, and status
    const donorData = await Promise.all(donors.map(async donor => {
      const donations = await Donation.find({ user: donor._id, status: 'completed' }).sort({ date: -1 });
      const lastDonation = donations[0]?.date || null;
      const totalDonations = donations.length;
      // Status logic: verified if >0 donations, regular if >5, pending if 0
      let donorStatus = 'Pending';
      if (totalDonations > 0) donorStatus = 'Verified';
      if (totalDonations >= 5) donorStatus = 'Regular';
      return {
        id: donor._id,
        donorId: 'D' + donor._id.toString().slice(-4),
        name: donor.fullName,
        bloodGroup: donor.bloodGroup,
        contact: { email: donor.email, mobileNo: donor.mobileNo },
        lastDonation,
        totalDonations,
        status: donorStatus
      };
    }));
    // Stats
    const totalDonors = donorData.length;
    const regularDonors = donorData.filter(d => d.status === 'Regular').length;
    const verifiedDonors = donorData.filter(d => d.status === 'Verified' || d.status === 'Regular').length;
    const pendingDonors = donorData.filter(d => d.status === 'Pending').length;
    res.json({
      stats: {
        totalDonors,
        regularDonors,
        verifiedDonors,
        pendingDonors
      },
      donors: donorData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donors', details: err.message });
  }
};
