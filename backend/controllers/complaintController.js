import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendEmail } from '../config/emailConfig.js';

const VALID_STATUS = ['Pending', 'Responded', 'Closed'];

export const getComplaints = async (req, res) => {
  try {
    const { userId, search } = req.query;
    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { userName: searchRegex },
        { subject: searchRegex }
      ];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Unable to fetch complaints' });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ message: 'userId, subject, and message are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const complaint = await Complaint.create({
      userId,
      userName: user.fullName,
      userRole: user.role,
      userEmail: user.email,
      subject,
      message
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Unable to create complaint' });
  }
};

export const respondToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    if (!adminResponse) {
      return res.status(400).json({ message: 'adminResponse is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.adminResponse = adminResponse;
    complaint.status = status && VALID_STATUS.includes(status) ? status : 'Responded';

    const updatedComplaint = await complaint.save();

    const emailResult = await sendEmail(
      complaint.userEmail,
      `Response to complaint: ${complaint.subject}`,
      `Dear ${complaint.userName},\n\nYour complaint has been reviewed by our admin team.\n\nResponse: ${adminResponse}\n\nThank you for your patience.\nBlood Bank Management System`,
      `<p>Dear ${complaint.userName},</p><p>Your complaint has been reviewed by our admin team.</p><p><strong>Response:</strong> ${adminResponse}</p><p>Thank you for your patience.<br/>Blood Bank Management System</p>`
    );

    res.json({
      complaint: updatedComplaint,
      emailStatus: emailResult.success ? 'sent' : 'failed',
      emailError: emailResult.success ? null : emailResult.error
    });
  } catch (error) {
    console.error('Error responding to complaint:', error);
    res.status(500).json({ message: 'Unable to send response' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Unable to update status' });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Unable to delete complaint' });
  }
};
