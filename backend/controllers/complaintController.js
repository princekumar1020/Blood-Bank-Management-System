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
