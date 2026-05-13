import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @desc    Register a new complaint
// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { userId, category, title, description } = req.body;

    // Save complaint
    const newComplaint = new Complaint({
      userId,
      category,
      title,
      description
    });
    await newComplaint.save();

    // Fetch the user who submitted the complaint to include in the email
    const submittingUser = await User.findById(userId);
    const userFullName = submittingUser ? submittingUser.fullName : 'A user';

    // Send email to the hardcoded blood bank team
    const mailOptions = {
      from: submittingUser ? submittingUser.email : process.env.EMAIL_USER,
      replyTo: submittingUser ? submittingUser.email : process.env.EMAIL_USER,
      to: 'bloodbankteam2023@gmail.com',
      subject: `New Complaint Registered: ${title}`,
      text: `Hello Admin,

A new complaint has been registered by ${userFullName}.

Category: ${category}
Title: ${title}
Description: ${description}

Please log in to the admin dashboard to review and resolve this complaint.

Best regards,
Blood Bank Management System`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Complaint email sent to bloodbankteam2023@gmail.com');
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
      // Continue even if email fails
    }

    res.status(201).json({ message: 'Complaint registered successfully', complaint: newComplaint });
  } catch (error) {
    console.error('Error registering complaint:', error);
    res.status(500).json({ message: 'Server error while registering complaint' });
  }
};

// @desc    Get complaints (for specific user or all for admin)
// @route   GET /api/complaints
export const getComplaints = async (req, res) => {
  try {
    const { userId } = req.query;
    
    let complaints;
    if (userId) {
      // Fetch complaints for a specific user
      complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });
    } else {
      // Fetch all complaints for the admin dashboard
      complaints = await Complaint.find({}).sort({ createdAt: -1 }).populate('userId', 'fullName email');
    }
    
    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Server error while fetching complaints' });
  }
};

// @desc    Respond to a complaint
// @route   PATCH /api/complaints/:id/respond
export const respondToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    // First, get the current complaint to preserve history
    const currentComplaint = await Complaint.findById(id);
    if (!currentComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Store the previous admin response in response history (if exists)
    const previousResponse = currentComplaint.adminResponse;
    if (previousResponse) {
      if (!currentComplaint.responseHistory) {
        currentComplaint.responseHistory = [];
      }
      currentComplaint.responseHistory.push({
        response: previousResponse,
        respondedAt: currentComplaint.updatedAt || new Date(),
        status: currentComplaint.status
      });
    }

    // Update with new response
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        adminResponse: adminResponse,
        status: status || 'in-progress'
      },
      { new: true }
    ).populate('userId', 'fullName email');

    // Send email to the user who submitted the complaint
    try {
      const user = await User.findById(complaint.userId._id || complaint.userId);
      if (user && user.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Response to your complaint: ${complaint.title}`,
          text: `Hello ${user.fullName},

We have reviewed your complaint and here is our response:

${adminResponse}

If you have any further questions, please feel free to contact us.

Best regards,
Blood Bank Management System`
        };

        await transporter.sendMail(mailOptions);
        console.log('Response email sent to user');
      }
    } catch (emailErr) {
      console.error('Error sending response email:', emailErr);
    }

    res.status(200).json({ message: 'Response saved', complaint, emailStatus: 'sent' });
  } catch (error) {
    console.error('Error responding to complaint:', error);
    res.status(500).json({ message: 'Server error while responding to complaint' });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint status updated', complaint });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error while updating complaint status' });
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Server error while deleting complaint' });
  }
};

// @desc    Resolve a complaint (for users to mark their own complaints as resolved)
// @route   PATCH /api/complaints/:id/resolve
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Get userId from request body to verify ownership

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if the user owns this complaint
    if (complaint.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only resolve your own complaints' });
    }

    // Update status to resolved
    complaint.status = 'resolved';
    await complaint.save();

    res.status(200).json({ message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Server error while resolving complaint' });
  }
};

// @desc    Reopen a complaint (for users to reopen resolved complaints)
// @route   PATCH /api/complaints/:id/reopen
export const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Get userId from request body to verify ownership

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if the user owns this complaint
    if (complaint.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only reopen your own complaints' });
    }

    // Store the previous admin response in response history (if exists)
    const previousResponse = complaint.adminResponse;
    if (!complaint.responseHistory) {
      complaint.responseHistory = [];
    }
    if (previousResponse) {
      complaint.responseHistory.push({
        response: previousResponse,
        respondedAt: complaint.updatedAt || new Date(),
        status: complaint.status
      });
    }

    // Add an explicit reopen event to history for tracking and counts
    complaint.responseHistory.push({
      response: 'Complaint reopened by user',
      respondedAt: new Date(),
      status: 'reopened'
    });

    // Update status to reopened so admin dashboards can count reopened complaints correctly
    complaint.status = 'reopened';
    await complaint.save();

    // Send email notification to admin about reopened complaint
    try {
      const user = await User.findById(complaint.userId);
      const mailOptions = {
        from: user ? user.email : process.env.EMAIL_USER,
        replyTo: user ? user.email : process.env.EMAIL_USER,
        to: 'bloodbankteam2023@gmail.com',
        subject: `🚨 COMPLAINT REOPENED: ${complaint.title}`,
        text: `Hello Admin,

A complaint has been REOPENED by ${user ? user.fullName : 'a user'} and requires your immediate attention.

Category: ${complaint.category}
Title: ${complaint.title}
Description: ${complaint.description}

Previous Response: ${previousResponse || 'No previous response'}

Please log in to the admin dashboard to provide further assistance.

Best regards,
Blood Bank Management System`
      };

      await transporter.sendMail(mailOptions);
      console.log('Reopen notification email sent to bloodbankteam2023@gmail.com');
    } catch (emailErr) {
      console.error('Error sending reopen email:', emailErr);
    }

    res.status(200).json({ message: 'Complaint reopened successfully', complaint });
  } catch (error) {
    console.error('Error reopening complaint:', error);
    res.status(500).json({ message: 'Server error while reopening complaint' });
  }
};
