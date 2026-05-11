const inventoryUtils = require('./inventoryUtils');
// Mark request as completed and decrease inventory
exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot complete non-pending requests' });
    }
    request.status = 'completed';
    await request.save();
    // Decrease inventory for requested blood group
    await inventoryUtils.decreaseInventory(request.bloodGroup, request.units);
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { userId, requestFor, bloodGroup, units, patientName, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let finalBloodGroup = bloodGroup;
    let finalPatientName = patientName;

    if (requestFor === 'self') {
      finalBloodGroup = user.bloodGroup;
      finalPatientName = user.fullName;
    }

    const newRequest = new BloodRequest({
      recipient: userId,
      requestFor,
      bloodGroup: finalBloodGroup,
      units,
      patientName: finalPatientName,
      reason,
      status: 'pending'
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    const requests = await BloodRequest.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestFor, bloodGroup, units, patientName, reason } = req.body;

    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot edit completed or cancelled requests' });
    }

    const user = await User.findById(request.recipient);
    
    let finalBloodGroup = bloodGroup;
    let finalPatientName = patientName;

    if (requestFor === 'self') {
      finalBloodGroup = user.bloodGroup;
      finalPatientName = user.fullName;
    }

    request.requestFor = requestFor !== undefined ? requestFor : request.requestFor;
    request.bloodGroup = finalBloodGroup !== undefined ? finalBloodGroup : request.bloodGroup;
    request.units = units !== undefined ? units : request.units;
    request.patientName = finalPatientName !== undefined ? finalPatientName : request.patientName;
    request.reason = reason !== undefined ? reason : request.reason;

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending') {
      return res.status(403).json({ error: 'Cannot delete completed or cancelled requests' });
    }

    await BloodRequest.findByIdAndDelete(id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};