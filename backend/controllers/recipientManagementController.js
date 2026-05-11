// List all recipients (users with role 'recipient')
exports.getRecipients = async (req, res) => {
  try {
    const recipients = await User.find({ role: 'recipient' }).select('-password');
    res.json({ recipients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipients', details: err.message });
  }
};

// Edit recipient details
exports.editRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobileNo, bloodGroup, gender, age, password } = req.body;
    const update = { fullName, email, mobileNo, bloodGroup, gender, age };
    if (password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(password, 10);
    }
    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Recipient not found' });
    res.json({ success: true, recipient: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipient', details: err.message });
  }
};
// Update a recipient blood request
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Only allow updating certain fields
    const allowedFields = ['bloodGroup', 'units', 'reason', 'status', 'requestFor', 'patientName'];
    const update = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) update[key] = updateData[key];
    }
    const updatedRequest = await BloodRequest.findByIdAndUpdate(id, update, { new: true });
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipient request', details: err.message });
  }
};
// Add a new recipient request (admin)
exports.addRequest = async (req, res) => {
  try {
    const { fullName, email, mobileNo, bloodGroup, units, reason, requestFor, gender, age, password } = req.body;
    // Basic validation
    if (!/^\d{10}$/.test(mobileNo)) {
      return res.status(400).json({ error: 'Mobile number must be 10 digits.' });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }
    // Check for duplicate user by email or mobile
    let user = await User.findOne({ $or: [{ email }, { mobileNo }] });
    const bcrypt = require('bcryptjs');
    if (user) {
      // If user exists, check if already a recipient
      if (user.role === 'recipient') {
        return res.status(400).json({ error: 'Recipient already exists.' });
      } else {
        // If user exists but not recipient, update role and info
        user.role = 'recipient';
        user.fullName = fullName;
        user.bloodGroup = bloodGroup;
        user.gender = gender || 'Other';
        user.age = age || 18;
        const rawPassword = password || mobileNo;
        user.password = await bcrypt.hash(rawPassword, 10);
        await user.save();
      }
    } else {
      // Create new recipient user
      const rawPassword = password || mobileNo;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      user = new User({
        fullName,
        email,
        mobileNo,
        bloodGroup,
        role: 'recipient',
        gender: gender || 'Other',
        age: age || 18,
        password: hashedPassword
      });
      await user.save();
    }
    // Prevent duplicate blood requests for same user and status pending
    const existingRequest = await BloodRequest.findOne({ recipient: user._id, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ error: 'A pending blood request already exists for this recipient.' });
    }
    // If self, use user's blood group; if family, use selected
    let reqBloodGroup = bloodGroup;
    if (requestFor === 'self') {
      reqBloodGroup = user.bloodGroup;
    }
    const newRequest = new BloodRequest({
      recipient: user._id,
      requestFor: requestFor || 'self',
      bloodGroup: reqBloodGroup,
      units,
      status: 'pending',
      patientName: fullName,
      reason
    });
    await newRequest.save();
    res.json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add recipient request', details: err.message });
  }
};
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

// Get all recipient requests with stats, search, filter
exports.getRequests = async (req, res) => {
  try {
    const { search = '', urgency = '', status = '' } = req.query;
    const query = {};
    if (search) query.patientName = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    // For urgency, you can add logic if you have an urgency field
    const requests = await BloodRequest.find(query).populate('recipient', 'fullName email mobileNo bloodGroup');
    // For each request, build row data
    const requestData = requests.map((req, idx) => ({
      id: req._id,
      requestId: 'R' + (idx + 1).toString().padStart(3, '0'),
      recipient: req.recipient.fullName,
      bloodGroup: req.bloodGroup,
      contact: { email: req.recipient.email, mobileNo: req.recipient.mobileNo },
      requestDate: req.createdAt,
      units: req.units,
      urgency: req.urgency || 'Normal',
      status: req.status,
      requestFor: req.requestFor || 'self',
    }));
    // Stats
    const totalRequests = requestData.length;
    const pending = requestData.filter(r => r.status === 'pending').length;
    const processing = requestData.filter(r => r.status === 'processing').length;
    const fulfilled = requestData.filter(r => r.status === 'completed' || r.status === 'fulfilled').length;
    res.json({
      stats: {
        totalRequests,
        pending,
        processing,
        fulfilled
      },
      requests: requestData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
};

// View a single request
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqData = await BloodRequest.findById(id).populate('recipient', 'fullName email mobileNo bloodGroup');
    if (!reqData) return res.status(404).json({ error: 'Request not found' });
    res.json(reqData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request', details: err.message });
  }
};

// Approve/Fulfill a request with stock check
const Inventory = require('../models/Inventory');
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqData = await BloodRequest.findById(id);
    if (!reqData) return res.status(404).json({ error: 'Request not found' });

    // Check stock for requested blood group
    const inventory = await Inventory.findOne({ bloodGroup: reqData.bloodGroup });
    if (!inventory || inventory.availableUnits < reqData.units) {
      return res.status(400).json({ error: 'Stock not available' });
    }

    // Deduct units from inventory
    inventory.availableUnits -= reqData.units;
    await inventory.save();

    reqData.status = 'fulfilled';
    await reqData.save();
    res.json({ success: true, request: reqData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request', details: err.message });
  }
};
