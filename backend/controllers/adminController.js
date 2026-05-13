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

const emergencyAlertEmailBody = (donorName, bloodGroup, message, lastDonationDate) => {
    const formattedDate = lastDonationDate ? new Date(lastDonationDate).toLocaleDateString() : 'N/A';
    return {
        subject: `Urgent Blood Needed: ${bloodGroup}`,
        text: `Hello ${donorName},\n\nWe urgently need blood group ${bloodGroup}. Our records show your last donation was on ${formattedDate}, so you are eligible to donate again. Please consider coming in to help patients in need.\n\nMessage from admin:\n${message}\n\nReply to this email if you can donate or need more details. Thank you for your support.`,
        html: `<p>Hello ${donorName},</p><p>We urgently need blood group <strong>${bloodGroup}</strong>. Our records show your last donation was on <strong>${formattedDate}</strong>, so you are eligible to donate again.</p><p><strong>Message from admin:</strong><br/>${message.replace(/\n/g, '<br/>')}</p><p>Please reply to this email if you can donate or need more details. Thank you for your support.</p>`
    };
};

export const sendEmergencyAlert = async (req, res) => {
    try {
        const { bloodGroup, message } = req.body;
        if (!bloodGroup || !message) {
            return res.status(400).json({ error: 'Blood group and message are required.' });
        }

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 30);

        const eligibleDonors = await User.aggregate([
            { $match: { role: 'donor', bloodGroup } },
            { $lookup: {
                from: 'donations',
                let: { userId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $and: [ { $eq: ['$user', '$$userId'] }, { $eq: ['$status', 'completed'] } ] } } },
                    { $sort: { date: -1 } },
                    { $limit: 1 }
                ],
                as: 'lastCompletedDonation'
            } },
            { $addFields: {
                lastDonationDate: { $arrayElemAt: ['$lastCompletedDonation.date', 0] }
            } },
            { $match: {
                $or: [
                    { lastDonationDate: { $exists: false } },
                    { lastDonationDate: { $lte: thresholdDate } }
                ]
            } }
        ]);

        if (!eligibleDonors.length) {
            return res.json({ success: true, count: 0, message: 'No eligible donors found for alert.' });
        }

        const donorLastDonationMap = eligibleDonors.reduce((acc, d) => {
            acc[d._id.toString()] = d.lastDonationDate;
            return acc;
        }, {});

        const results = await Promise.allSettled(eligibleDonors.map(async (donor) => {
            const lastDonationDate = donorLastDonationMap[donor._id.toString()] || null;
            const { subject, text, html } = emergencyAlertEmailBody(donor.fullName, bloodGroup, message, lastDonationDate);
            return await sendEmail(donor.email, subject, text, html);
        }));

        const sentCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
        return res.json({ success: true, count: sentCount, attempted: eligibleDonors.length });
    } catch (err) {
        console.error('Error sending emergency alert:', err);
        res.status(500).json({ error: 'Failed to send emergency alert.', details: err.message });
    }
};

export const getAdminHistory = async (req, res) => {
    try {
        const { search = '', type = 'all', role = 'all', status = 'all', startDate, endDate } = req.query;

        const donationFilter = {};
        const requestFilter = {};

        if (status !== 'all') {
            donationFilter.status = status;
            requestFilter.status = status;
        }

        const donations = (type === 'all' || type === 'Donation')
            ? await Donation.find(donationFilter).populate('user', 'fullName bloodGroup role')
            : [];
        const requests = (type === 'all' || type === 'Request')
            ? await BloodRequest.find(requestFilter).populate('recipient', 'fullName bloodGroup role')
            : [];

        let history = [
            ...donations.map((d) => ({
                _id: d._id,
                date: d.date,
                type: 'Donation',
                userName: d.user?.fullName || 'Unknown',
                role: d.user?.role || 'donor',
                bloodGroup: d.user?.bloodGroup || 'Unknown',
                details: d.appointmentId ? `Donation linked to appointment ${d.appointmentId}` : 'Donation record',
                status: d.status
            })),
            ...requests.map((r) => ({
                _id: r._id,
                date: r.createdAt,
                type: 'Request',
                userName: r.recipient?.fullName || 'Unknown',
                role: r.recipient?.role || 'recipient',
                bloodGroup: r.bloodGroup,
                details: `Requested ${r.units} unit(s) for ${r.requestFor === 'family' ? 'family' : 'self'}${r.reason ? `: ${r.reason}` : ''}`,
                status: r.status
            }))
        ];

        if (role !== 'all') {
            history = history.filter(item => item.role === role);
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            history = history.filter(item =>
                regex.test(item.userName) ||
                regex.test(item.bloodGroup) ||
                regex.test(item.details) ||
                regex.test(item.type) ||
                regex.test(item.status)
            );
        }

        if (startDate) {
            const start = new Date(startDate);
            history = history.filter(item => new Date(item.date) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            history = history.filter(item => new Date(item.date) <= end);
        }

        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.json({ history });
    } catch (err) {
        console.error('Error fetching admin history:', err);
        return res.status(500).json({ error: 'Failed to fetch admin history', details: err.message });
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

        // Recent donations (Merged Sahil's safe checks & Priyanshu's code)
        const recentDonations = await Donation.find({ status: 'completed' })
            .sort({ date: -1 })
            .limit(5)
            .populate('user', 'fullName bloodGroup');
            
        const recentDonationsData = recentDonations.map(d => ({
            name: d.user?.fullName || 'Unknown Donor',
            bloodGroup: d.user?.bloodGroup || 'Unknown',
            date: d.date
        }));

        // Recent requests (Merged Sahil's Units feature & Priyanshu's code)
        const recentRequests = await BloodRequest.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('recipient', 'fullName bloodGroup');
            
        const recentRequestsData = recentRequests.map(r => ({
            name: r.recipient?.fullName || 'Unknown Recipient',
            bloodGroup: r.bloodGroup,
            units: r.units || 0, // Sahil's added feature kept safe
            status: r.status,
            createdAt: r.createdAt
        }));

        // Active alerts
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
    sendEmergencyAlert,
    getAdminHistory,
    getAdminDashboard
};