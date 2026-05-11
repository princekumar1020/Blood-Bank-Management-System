// controllers/donorController.js
const User = require('../models/User');
const Donation = require('../models/Donation');
const Appointment = require('../models/Appointment');

exports.deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ error: 'You can only delete a pending (scheduled) appointment.' });
    }
    await Appointment.findByIdAndDelete(appointmentId);
    res.json({ success: true, message: 'Appointment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.editAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { date, notes } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ error: 'You can only edit a pending (scheduled) appointment.' });
    }
    appointment.date = date || appointment.date;
    appointment.notes = notes || appointment.notes;
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { tokenNo, timeSlot } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled appointments can be approved.' });
    }
    appointment.status = 'approved';
    appointment.tokenNo = tokenNo;
    appointment.timeSlot = timeSlot;
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

const inventoryUtils = require('./inventoryUtils');
exports.completeAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId).populate('user');
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved appointments can be completed.' });
    }
    appointment.status = 'completed';
    await appointment.save();
    await Donation.create({ user: appointment.user._id, date: appointment.date, status: 'completed', appointmentId });
    // Increase inventory for donor's blood group by 1 unit
    await require('./inventoryController').addStock({
      body: {
        bloodGroup: appointment.user.bloodGroup,
        units: 1
      }
    }, { json: () => {} });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getLatestAppointment = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const appointment = await Appointment.findOne({ user: userId }).sort({ date: -1 });
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const donations = await Donation.find({ user: userId });
    const completed = donations.filter(d => d.status === 'completed').length;
    const pending = donations.filter(d => d.status === 'pending').length;
    const total = donations.length;
    const livesSaved = completed * 3;
    const certificates = completed;
    const donorRank = completed >= 6 ? 'Gold' : completed >= 3 ? 'Silver' : 'Bronze';
    res.json({
      name: user.fullName,
      bloodGroup: user.bloodGroup,
      totalDonations: total,
      completedDonations: completed,
      pendingDonations: pending,
      livesSaved,
      certificates,
      donorRank
    });
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.scheduleAppointment = async (req, res) => {
  try {
    const { userId, date, notes, bloodGroup } = req.body;
    if (!userId || !date || !bloodGroup) {
      return res.status(400).json({ error: 'Missing required fields', details: { userId, date, bloodGroup } });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const activeAppointment = await Appointment.findOne({ user: userId, status: 'scheduled' });
    if (activeAppointment) {
      return res.status(400).json({ error: 'You already have a pending request. Please wait for it to be processed before creating a new one.' });
    }
    const lastCompleted = await Appointment.findOne({ user: userId, status: 'completed' }).sort({ date: -1 });
    if (lastCompleted) {
      const lastDate = new Date(lastCompleted.date);
      const now = new Date(date);
      const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays < 90) {
        return res.status(400).json({ error: `You can only schedule a new donation 90 days after your last donation. Please wait ${90 - diffDays} more days.` });
      }
    }
    const appointment = new Appointment({ user: userId, date, notes, bloodGroup });
    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const userId = req.query.userId;
    const appointments = await Appointment.find({ user: userId });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
