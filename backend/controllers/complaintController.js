import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { sendEmail } from '../config/emailConfig.js';

const ADMIN_VALID_STATUS = ['In Review', 'Responded'];
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

const normalizeStatus = (status) => {
  if (!status) return status;
  const normalized = String(status).trim().toLowerCase();
  switch (normalized) {
    case 'pending':
      return 'Pending';
    case 'in review':
    case 'inreview':
      return 'In Review';
    case 'responded':
      return 'Responded';
    case 'closed':
      return 'Closed';
    case 'reopened':
      return 'Reopened';
    default:
      return String(status);
  }
};

const normalizeComplaint = (complaint) => {
  if (!complaint) return complaint;
  const raw = complaint.toObject ? complaint.toObject({ getters: true }) : complaint;
  const user = raw.userId;
  return {
    ...raw,
    subject: raw.subject || raw.title || '',
    message: raw.message || raw.description || '',
    userName: raw.userName || (user && user.fullName) || user?.name || raw.userEmail || 'Unknown user',
    userEmail: raw.userEmail || (user && user.email) || '',
    userRole: raw.userRole || (user && user.role) || 'unknown',
    status: normalizeStatus(raw.status)
  };
};

const buildUserResponseEmail = (complaint, adminResponse) => ({

  subject: `Response to complaint: ${complaint.subject}`,
  text: `Dear ${complaint.userName},\n\nYour complaint has been reviewed by our admin team.\n\nResponse: ${adminResponse}\n\nThank you for your patience.\nBlood Bank Management System`,
  html: `<p>Dear ${complaint.userName},</p><p>Your complaint has been reviewed by our admin team.</p><p><strong>Response:</strong> ${adminResponse}</p><p>Thank you for your patience.<br/>Blood Bank Management System</p>`
});

const buildAdminReopenEmail = (complaint) => ({
  subject: `Complaint reopened: ${complaint.subject}`,
  text: `The complaint from ${complaint.userName} has been reopened and requires review.\n\nComplaint: ${complaint.subject}\n\nPlease review the request in the admin dashboard.`,
  html: `<p>The complaint from <strong>${complaint.userName}</strong> has been reopened and requires review.</p><p><strong>Complaint:</strong> ${complaint.subject}</p><p>Please review the request in the admin dashboard.</p>`
});

const ensureComplaintMetadata = (complaint) => {
  if (!complaint) return;

  const user = complaint.userId;
  complaint.subject = complaint.subject || complaint.title || 'No subject provided';
  complaint.message = complaint.message || complaint.description || 'No message provided';
  complaint.userName = complaint.userName || (user && (user.fullName || user.name)) || complaint.userEmail || 'Unknown user';
  complaint.userEmail = complaint.userEmail || (user && user.email) || '';
  complaint.userRole = complaint.userRole || (user && user.role) || 'unknown';
};

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
        { subject: searchRegex },
        { message: searchRegex },
        { adminResponse: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    const complaints = await Complaint.find(filter).populate('userId').sort({ createdAt: -1 });
    res.json(complaints.map(normalizeComplaint));
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Unable to fetch complaints' });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { userId, subject, message, category, title, description } = req.body;

    const complaintSubject = subject || title;
    const complaintMessage = message || description;

    if (!userId || !complaintSubject || !complaintMessage) {
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
      subject: complaintSubject,
      message: complaintMessage,
      category: category || 'general'
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

    if (!adminResponse || !adminResponse.trim()) {
      return res.status(400).json({ message: 'adminResponse is required' });
    }

    if (!status || !ADMIN_VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid admin status. Allowed values are In Review or Responded.' });
    }

    const complaint = await Complaint.findById(id).populate('userId');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot respond to a complaint that has been closed by the user.' });
    }

    // Ensure required fields are set and fallback values exist for legacy data
    ensureComplaintMetadata(complaint);

    complaint.adminResponse = adminResponse.trim();
    complaint.status = status;
    complaint.resolvedByUser = false;
    if (!Array.isArray(complaint.responseHistory)) {
      complaint.responseHistory = [];
    }
    complaint.responseHistory.push({ message: complaint.adminResponse });

    const updatedComplaint = await complaint.save();

    const toEmail = complaint.userEmail || (complaint.userId && complaint.userId.email) || '';
    const emailPayload = buildUserResponseEmail(complaint, adminResponse.trim());
    let emailResult = { success: false, error: 'No email address available' };
    if (toEmail) {
      emailResult = await sendEmail(toEmail, emailPayload.subject, emailPayload.text, emailPayload.html);
    }

    res.json({
      complaint: updatedComplaint,
      emailTo: toEmail,
      emailStatus: emailResult.success ? 'sent' : 'failed',
      emailError: emailResult.success ? null : emailResult.error
    });
  } catch (error) {
    console.error('Error responding to complaint:', error);
    res.status(500).json({ message: 'Unable to send response', error: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ADMIN_VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Allowed values are In Review or Responded.' });
    }

    const complaint = await Complaint.findById(id).populate('userId');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === 'Closed') {
      return res.status(400).json({ message: 'Cannot update the status of a closed complaint. Reopen it first.' });
    }

    ensureComplaintMetadata(complaint);

    complaint.status = status;
    complaint.resolvedByUser = false;
    const updatedComplaint = await complaint.save();

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Unable to update status' });
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('userId');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status === 'Closed') {
      return res.status(400).json({ message: 'Complaint is already closed.' });
    }

    ensureComplaintMetadata(complaint);

    complaint.status = 'Closed';
    complaint.resolvedByUser = true;
    const updatedComplaint = await complaint.save();

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Unable to close complaint' });
  }
};

export const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate('userId');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Closed') {
      return res.status(400).json({ message: 'Only closed complaints can be reopened.' });
    }

    ensureComplaintMetadata(complaint);

    complaint.status = 'Reopened';
    complaint.resolvedByUser = false;
    const updatedComplaint = await complaint.save();

    if (ADMIN_NOTIFICATION_EMAIL) {
      const emailPayload = buildAdminReopenEmail(complaint);
      await sendEmail(ADMIN_NOTIFICATION_EMAIL, emailPayload.subject, emailPayload.text, emailPayload.html);
    }

    res.json(updatedComplaint);
  } catch (error) {
    console.error('Error reopening complaint:', error);
    res.status(500).json({ message: 'Unable to reopen complaint' });
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
