import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Appointment from '../models/Appointment.js';
import { sendEmail } from '../config/emailConfig.js';
import * as inventoryUtils from './inventoryUtils.js';
import * as inventoryController from './inventoryController.js';

export const deleteAppointment = async (req, res) => {
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

export const editAppointment = async (req, res) => {
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

export const approveAppointment = async (req, res) => {
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

export const completeAppointment = async (req, res) => {
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
    await inventoryController.addStock({
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

export const getLatestAppointment = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    // First, look for any active appointment (scheduled or approved)
    let appointment = await Appointment.findOne({ 
      user: userId, 
      status: { $in: ['scheduled', 'approved'] } 
    }).sort({ createdAt: -1 });

    // If no active appointment, find the most recent one (completed or rejected)
    if (!appointment) {
      appointment = await Appointment.findOne({ user: userId }).sort({ createdAt: -1 });
    }
    
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getDashboard = async (req, res) => {
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

export const scheduleAppointment = async (req, res) => {
  try {
    const { userId, date, notes, bloodGroup } = req.body;
    if (!userId || !date || !bloodGroup) {
      return res.status(400).json({ error: 'Missing required fields', details: { userId, date, bloodGroup } });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for any successful or approved history (regardless of when it was created)
    const recentSuccess = await Appointment.findOne({
      user: userId,
      status: { $in: ['completed', 'approved'] }
    }).sort({ date: -1 });

    if (recentSuccess) {
      const lastDate = new Date(recentSuccess.date);
      const nextEligibleDate = new Date(lastDate);
      nextEligibleDate.setDate(nextEligibleDate.getDate() + 30);
      
      const now = new Date();
      if (now < nextEligibleDate) {
        const diffTime = nextEligibleDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return res.status(400).json({ 
          error: `You are not eligible to donate yet. Your last approved/completed donation was on ${lastDate.toLocaleDateString()}. You can only donate again after 30 days. Please wait ${diffDays} more days until ${nextEligibleDate.toLocaleDateString()}.` 
        });
      }
    }

    const activeAppointment = await Appointment.findOne({ 
      user: userId, 
      status: 'scheduled'
    });
    if (activeAppointment) {
      return res.status(400).json({ error: 'You already have a pending request. Please wait for it to be processed.' });
    }
    const appointment = new Appointment({ user: userId, date, notes, bloodGroup });
    await appointment.save();

    // Notify central bloodbank team only to avoid bounced/inactive admin addresses
    try {
      const subject = 'New Blood Donation Appointment Booked';
      const text = `Hello Bloodbank Team,\n\nA new blood donation appointment has been scheduled by ${user.fullName}.\n\nDetails:\nDonor: ${user.fullName}\nBlood Group: ${bloodGroup}\nDate: ${new Date(date).toLocaleDateString()}\nNotes: ${notes || 'None'}\n\nPlease review and process the request in the admin dashboard.`;
      const html = `<h3>New Appointment Request</h3><p>Hello Bloodbank Team,</p><p>A new blood donation appointment has been scheduled by <strong>${user.fullName}</strong>.</p><p><strong>Details:</strong><br/>Donor: ${user.fullName}<br/>Blood Group: ${bloodGroup}<br/>Date: ${new Date(date).toLocaleDateString()}<br/>Notes: ${notes || 'None'}</p><p>Please review and process the request in the admin dashboard.</p>`;

      await sendEmail('bloodbankteam2023@gmail.com', subject, text, html);
    } catch (emailErr) {
      console.error('Failed to notify bloodbank team about new appointment:', emailErr);
    }

    res.json({ success: true, appointment });
  } catch (err) {
    console.error('Appointment creation error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const userId = req.query.userId;
    const appointments = await Appointment.find({ user: userId });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  deleteAppointment,
  editAppointment,
  approveAppointment,
  completeAppointment,
  getLatestAppointment,
  getDashboard,
  scheduleAppointment,
  getAppointments
};
