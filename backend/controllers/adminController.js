// Reject/cancel appointment (admin)
exports.adminRejectAppointment = async (req, res) => {
	try {
		const appointmentId = req.params.id;
		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		if (appointment.status === 'completed' || appointment.status === 'cancelled') {
			return res.status(400).json({ error: 'Cannot reject completed or already cancelled appointments.' });
		}
		appointment.status = 'cancelled';
		await appointment.save();
		res.json({ success: true, appointment });
	} catch (err) {
		res.status(500).json({ error: 'Server error', details: err.message });
	}
};
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const Inventory = require('../models/Inventory');
const Appointment = require('../models/Appointment');
// --- Admin Appointment Management ---
// Get all appointments (optionally filter by status)
exports.getAllAppointments = async (req, res) => {
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
exports.adminApproveAppointment = async (req, res) => {
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

// Complete appointment (admin)
exports.adminCompleteAppointment = async (req, res) => {
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

// Edit appointment (admin)
exports.adminEditAppointment = async (req, res) => {
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
exports.adminDeleteAppointment = async (req, res) => {
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

exports.getAdminDashboard = async (req, res) => {
	try {
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
		const recentDonationsData = recentDonations.map(d => ({
			name: d.user.fullName,
			bloodGroup: d.user.bloodGroup,
			date: d.date
		}));

		// Recent requests (last 5)
		const recentRequests = await BloodRequest.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('recipient', 'fullName bloodGroup');
		const recentRequestsData = recentRequests.map(r => ({
			name: r.recipient.fullName,
			bloodGroup: r.bloodGroup,
			units: r.units,
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
		res.status(500).json({ error: 'Failed to load dashboard data', details: err.message });
	}
};
