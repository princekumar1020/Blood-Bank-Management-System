import bcrypt from 'bcryptjs';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import { sendEmail } from '../config/emailConfig.js';

// List all recipients (users with role 'recipient')
export const getRecipients = async (req, res) => {
  try {
    const recipients = await User.find({ role: 'recipient' }).select('-password');
    res.json({ recipients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipients', details: err.message });
  }
};

// Edit recipient details
export const editRecipient = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, mobileNo, bloodGroup, gender, age, password } = req.body;
    const update = { fullName, email, mobileNo, bloodGroup, gender, age };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Recipient not found' });
    res.json({ success: true, recipient: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipient', details: err.message });
  }
};

const requestStatusEmailBody = (recipientName, bloodGroup, units, status, reason, date) => {
  const formattedDate = date ? new Date(date).toLocaleString() : new Date().toLocaleString();
  if (status === 'rejected') {
    return {
      subject: 'Your blood request has been rejected',
      text: `Hello ${recipientName},\n\nYour request for ${units} unit(s) of ${bloodGroup} blood has been rejected on ${formattedDate}.\n\nReason: ${reason || 'Not specified'}\n\nThank you for using Blood Bank.`,
      html: `<p>Hello ${recipientName},</p><p>Your request for <strong>${units}</strong> unit(s) of <strong>${bloodGroup}</strong> blood has been rejected on <strong>${formattedDate}</strong>.</p><p><strong>Reason:</strong> ${reason || 'Not specified'}</p><p>Thank you for using Blood Bank.</p>`
    };
  }
  return {
    subject: 'Your blood request has been fulfilled',
    text: `Hello ${recipientName},\n\nYour request for ${units} unit(s) of ${bloodGroup} blood has been fulfilled on ${formattedDate}.\n\nThank you for using Blood Bank.`,
    html: `<p>Hello ${recipientName},</p><p>Your request for <strong>${units}</strong> unit(s) of <strong>${bloodGroup}</strong> blood has been fulfilled on <strong>${formattedDate}</strong>.</p><p>Thank you for using Blood Bank.</p>`
  };
};

// Update a recipient blood request
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    // Only allow updating certain fields
    const allowedFields = ['bloodGroup', 'units', 'reason', 'status', 'requestFor', 'patientName'];
    const update = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) update[key] = updateData[key];
    }

    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const originalStatus = request.status;

    const updatedRequest = await BloodRequest.findByIdAndUpdate(id, update, { new: true })
      .populate('recipient', 'fullName email bloodGroup');
    if (!updatedRequest) return res.status(404).json({ error: 'Request not found' });

    if (update.status && update.status !== originalStatus && updatedRequest.recipient?.email) {
      try {
        const { subject, text, html } = requestStatusEmailBody(
          updatedRequest.recipient.fullName,
          updatedRequest.bloodGroup,
          updatedRequest.units,
          update.status,
          update.reason,
          updatedRequest.updatedAt
        );
        const result = await sendEmail(updatedRequest.recipient.email, subject, text, html);
        console.log('Request status update email sent:', result);
      } catch (emailError) {
        console.error('Failed to send request status email:', emailError);
      }
    }

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recipient request', details: err.message });
  }
};
// Add a new recipient request (admin)
export const addRequest = async (req, res) => {
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

    // Send email notification for new blood request
    if (user.email) {
      try {
        const subject = 'Blood Request Submitted Successfully';
        const text = `Hello ${user.fullName},\n\nYour blood request for ${units} unit(s) of ${reqBloodGroup} blood has been submitted successfully. We will process your request soon.\n\nPatient: ${fullName}\nReason: ${reason}\n\nThank you for using our Blood Bank service.`;
        const html = `<p>Hello ${user.fullName},</p><p>Your blood request for <strong>${units}</strong> unit(s) of <strong>${reqBloodGroup}</strong> blood has been submitted successfully. We will process your request soon.</p><p><strong>Patient:</strong> ${fullName}<br><strong>Reason:</strong> ${reason}</p><p>Thank you for using our Blood Bank service.</p>`;
        const result = await sendEmail(user.email, subject, text, html);
        console.log('Blood request creation email sent:', result);
      } catch (emailError) {
        console.error('Failed to send blood request creation email:', emailError);
      }
    }

    res.json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add recipient request', details: err.message });
  }
};
// Get all recipient requests with stats, search, filter
export const getRequests = async (req, res) => {
  try {
    const { search = '', urgency = '', status = '' } = req.query;
    const query = {};
    if (search) query.patientName = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    // For urgency, you can add logic if you have an urgency field
    const requests = await BloodRequest.find(query).sort({ createdAt: -1 }).populate('recipient', 'fullName email mobileNo bloodGroup');
    // For each request, build row data
    const requestData = requests.map((req, idx) => {
      const recipientName = req.recipient?.fullName || 'Unknown Recipient';
      const recipientEmail = req.recipient?.email || 'N/A';
      const recipientMobile = req.recipient?.mobileNo || 'N/A';
      return {
        id: req._id,
        requestId: 'R' + (idx + 1).toString().padStart(3, '0'),
        recipient: recipientName,
        bloodGroup: req.bloodGroup,
        contact: { email: recipientEmail, mobileNo: recipientMobile },
        requestDate: req.createdAt,
        units: req.units,
        urgency: req.urgency || 'Normal',
        status: req.status,
        requestFor: req.requestFor || 'self',
      };
    });
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
export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqData = await BloodRequest.findById(id).populate('recipient', 'fullName email mobileNo bloodGroup');
    if (!reqData) return res.status(404).json({ error: 'Request not found' });
    res.json(reqData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request', details: err.message });
  }
};

// Reject a request
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqData = await BloodRequest.findById(id).populate('recipient', 'fullName email bloodGroup');
    if (!reqData) return res.status(404).json({ error: 'Request not found' });

    if (reqData.status === 'fulfilled' || reqData.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot reject fulfilled or already rejected requests.' });
    }

    reqData.status = 'rejected';
    await reqData.save();

    if (reqData.recipient?.email) {
      try {
        const formattedDate = new Date().toLocaleString();
        const subject = 'Your blood request has been rejected';
        const text = `Hello ${reqData.recipient.fullName},\n\nYour request for ${reqData.units} unit(s) of ${reqData.bloodGroup} blood has been rejected on ${formattedDate}.\n\nReason: ${req.body.reason || 'Not specified'}\n\nThank you for using Blood Bank.`;
        const html = `<p>Hello ${reqData.recipient.fullName},</p><p>Your request for <strong>${reqData.units}</strong> unit(s) of <strong>${reqData.bloodGroup}</strong> blood has been rejected on <strong>${formattedDate}</strong>.</p><p><strong>Reason:</strong> ${req.body.reason || 'Not specified'}</p><p>Thank you for using Blood Bank.</p>`;
        const result = await sendEmail(reqData.recipient.email, subject, text, html);
        console.log('Request rejection email sent:', result);
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    }

    res.json({ success: true, request: reqData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject request', details: err.message });
  }
};

// Approve/Fulfill a request with stock check
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const reqData = await BloodRequest.findById(id).populate('recipient', 'fullName email bloodGroup');
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

    if (reqData.recipient?.email) {
      try {
        const formattedDate = reqData.updatedAt ? new Date(reqData.updatedAt).toLocaleString() : new Date().toLocaleString();
        const subject = 'Your blood request has been fulfilled';
        const text = `Hello ${reqData.recipient.fullName},\n\nYour request for ${reqData.units} unit(s) of ${reqData.bloodGroup} blood has been fulfilled on ${formattedDate}.\n\nThank you for using Blood Bank.`;
        const html = `<p>Hello ${reqData.recipient.fullName},</p><p>Your request for <strong>${reqData.units}</strong> unit(s) of <strong>${reqData.bloodGroup}</strong> blood has been fulfilled on <strong>${formattedDate}</strong>.</p><p>Thank you for using Blood Bank.</p>`;
        const result = await sendEmail(reqData.recipient.email, subject, text, html);
        console.log('Request fulfillment email sent:', result);
      } catch (emailError) {
        console.error('Failed to send request fulfillment email:', emailError);
      }
    }

    res.json({ success: true, request: reqData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve request', details: err.message });
  }
};
