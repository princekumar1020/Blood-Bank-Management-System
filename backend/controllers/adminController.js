import User from '../models/User.js';
import Donation from '../models/Donation.js';
import BloodRequest from '../models/BloodRequest.js';
import Inventory from '../models/Inventory.js';
import Appointment from '../models/Appointment.js';
import * as inventoryController from './inventoryController.js';
import { sendEmail } from '../config/emailConfig.js';

const appointmentEmailBody = (userName, date, bloodGroup, tokenNo, timeSlot, status) => {
	const formattedDate = date ? new Date(date).toLocaleString() : 'N/A';
	return {
		subject: `Your appointment has been ${status}`,
		text: `Hello ${userName},\n\nYour blood donation appointment for ${bloodGroup} on ${formattedDate} has been ${status}. ${tokenNo ? `Your token number is ${tokenNo}.` : ''} ${timeSlot ? `Your time slot is ${timeSlot}.` : ''}\n\nThank you for using our Blood Bank service.`,
		html: `<p>Hello ${userName},</p><p>Your blood donation appointment for <strong>${bloodGroup}</strong> on <strong>${formattedDate}</strong> has been <strong>${status}</strong>.</p>${tokenNo ? `<p>Your token number is <strong>${tokenNo}</strong>.</p>` : ''}${timeSlot ? `<p>Your time slot is <strong>${timeSlot}</strong>.</p>` : ''}<p>Thank you for using our Blood Bank service.</p>`
	};
};

// Reject/cancel appointment (admin)
export const adminRejectAppointment = async (req, res) => {
	try {
		const appointmentId = req.params.id;
		console.log('adminRejectAppointment called for:', appointmentId);
		const appointment = await Appointment.findById(appointmentId).populate('user', 'fullName email bloodGroup');
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		if (appointment.status === 'completed' || appointment.status === 'cancelled') {
			return res.status(400).json({ error: 'Cannot reject completed or already cancelled appointments.' });
		}
		appointment.status = 'cancelled';
		await appointment.save();
		console.log('appointment user email:', appointment.user?.email);
		if (appointment.user?.email) {
			try {
				const { subject, text, html } = appointmentEmailBody(appointment.user.fullName, appointment.date, appointment.user.bloodGroup, appointment.tokenNo, appointment.timeSlot, 'cancelled');
				const result = await sendEmail(appointment.user.email, subject, text, html);
				console.log('Rejection email sent:', result);
			} catch (emailError) {
				console.error('Failed to send rejection email:', emailError);
				// Don't fail the request if email fails
			}
		}
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
};
// --- Admin Appointment Management ---
// Get all appointments (optionally filter by status)
export const getAllAppointments = async (req, res) => {
	try {
		const { status } = req.query;
		const filter = status ? { status } : {};
		const appointments = await Appointment.find(filter)
			.populate('user', 'fullName email bloodGroup role');
		res.json({ appointments });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
};

// Approve appointment (admin)
export const adminApproveAppointment = async (req, res) => {
	try {
		const appointmentId = req.params.id;
		const { tokenNo, timeSlot } = req.body;
		const appointment = await Appointment.findById(appointmentId).populate('user', 'fullName email bloodGroup');
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
		if (appointment.user?.email) {
			try {
				const { subject, text, html } = appointmentEmailBody(appointment.user.fullName, appointment.date, appointment.user.bloodGroup, appointment.tokenNo, appointment.timeSlot, 'approved');
				const result = await sendEmail(appointment.user.email, subject, text, html);
				console.log('Approval email sent:', result);
			} catch (emailError) {
				console.error('Failed to send approval email:', emailError);
			}
		}
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
};

// Complete appointment (admin)
export const adminCompleteAppointment = async (req, res) => {
	try {
		const appointmentId = req.params.id;
		const appointment = await Appointment.findById(appointmentId).populate('user', 'fullName email bloodGroup');
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
		await inventoryController.addStock({
			body: {
				bloodGroup: appointment.user.bloodGroup,
				units: 1
			}
		}, { json: () => {} });
		if (appointment.user?.email) {
			try {
				const formattedDate = appointment.date ? new Date(appointment.date).toLocaleString() : 'N/A';
				const subject = 'Your donation appointment is complete';
				const text = `Hello ${appointment.user.fullName},\n\nYour appointment on ${formattedDate} has been marked as completed. Thank you for donating blood.\n\nStay safe and healthy.`;
				const html = `<p>Hello ${appointment.user.fullName},</p><p>Your appointment on <strong>${formattedDate}</strong> has been marked as <strong>completed</strong>. Thank you for donating blood.</p><p>We appreciate your support.</p>`;
				const result = await sendEmail(appointment.user.email, subject, text, html);
				console.log('Completion email sent:', result);
			} catch (emailError) {
				console.error('Failed to send completion email:', emailError);
			}
		}
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
};

// Edit appointment (admin)
export const adminEditAppointment = async (req, res) => {
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

// Delete appointment (admin)
export const adminDeleteAppointment = async (req, res) => {
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
export const getAdminDashboard = async (req, res) => {
	try {
		console.log('getAdminDashboard start');
		// Total donors
		const totalDonors = await User.countDocuments({ role: 'donor' });
		// Total recipients
		const totalRecipients = await User.countDocuments({ role: 'recipient' });
		// Use Inventory collection for total units and blood group stats
		const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
		const inventoryDocs = await Inventory.find({});
		let totalUnits = 0;
		const bloodInventory = {};
		bloodGroups.forEach(bg => {
			const inv = inventoryDocs.find(i => i.bloodGroup === bg);
			bloodInventory[bg] = inv ? inv.availableUnits : 0;
			totalUnits += inv ? inv.availableUnits : 0;
		});

		// Trend (last 6 months donations)
		const now = new Date();
		const trend = [];
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
			const count = await Donation.countDocuments({
				status: 'completed',
				date: { $gte: d, $lt: next }
			});
			trend.push({ month: d.toLocaleString('default', { month: 'short' }), count });
		}

		// Recent donations (last 5)
		const recentDonations = await Donation.find({ status: 'completed' })
			.sort({ date: -1 })
			.limit(5)
			.populate('user', 'fullName bloodGroup');
	console.log('recentDonations count', recentDonations.length);
	const recentDonationsData = recentDonations.map(d => ({
		name: d.user?.fullName || 'Unknown Donor',
		bloodGroup: d.user?.bloodGroup || 'Unknown',
		date: d.date
	}));

	// Recent requests (last 5)
	const recentRequests = await BloodRequest.find()
		.sort({ createdAt: -1 })
		.limit(5)
		.populate('recipient', 'fullName bloodGroup');
	console.log('recentRequests count', recentRequests.length);
	const recentRequestsData = recentRequests.map(r => ({
		name: r.recipient?.fullName || 'Unknown Recipient',
		bloodGroup: r.bloodGroup,
		status: r.status,
		createdAt: r.createdAt
	}));

	// Active alerts (for now, count of pending requests)
	const activeAlerts = await BloodRequest.countDocuments({ status: 'pending' });

	res.json({
		totalDonors,
		totalRecipients,
		totalUnits,
		activeAlerts,
		bloodInventory,
		trend,
		recentDonations: recentDonationsData,
		recentRequests: recentRequestsData
	});
	} catch (err) {
		console.error('Admin dashboard error:', err);
		res.status(500).json({ error: 'Failed to load dashboard data', details: err.stack || err.message });
	}
};
export default {
	adminRejectAppointment,
	getAllAppointments,
	adminApproveAppointment,
	adminCompleteAppointment,
	adminEditAppointment,
	adminDeleteAppointment,
	getAdminDashboard
};