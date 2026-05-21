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
    const { category, subject, description } = req.body;
    const userId = req.user?._id || req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required to submit a complaint' });
    }

    // Validate required fields
    if (!category || !subject || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Fetch the user who submitted the complaint to include in the email
    const submittingUser = await User.findById(userId);
    const userFullName = submittingUser ? submittingUser.fullName : 'A user';

    // Save complaint including captured user info for future orphaned-user fallback
    const newComplaint = new Complaint({
      user: userId,
      userName: submittingUser?.fullName || '',
      userEmail: submittingUser?.email || '',
      userRole: submittingUser?.role || '',
      category,
      subject,
      description
    });
    await newComplaint.save();

    // Send email to the hardcoded blood bank team
    const mailOptions = {
      from: submittingUser ? submittingUser.email : process.env.EMAIL_USER,
      replyTo: submittingUser ? submittingUser.email : process.env.EMAIL_USER,
      to: 'bloodbankteam2023@gmail.com',
      subject: `New Complaint Registered: ${subject}`,
      text: `Hello Admin,

A new complaint has been registered by ${userFullName}.

Category: ${category}
Subject: ${subject}
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

    res.status(201).json({ success: true, message: 'Complaint registered successfully', complaint: newComplaint });
  } catch (error) {
    console.error('Error registering complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while registering complaint' });
  }
};

// @desc    Get complaints (for specific user or all for admin)
// @route   GET /api/complaints
export const getComplaints = async (req, res) => {
  try {
    const { userId, search } = req.query;
    
    console.log('=== COMPLAINT REQUEST ===');
    console.log('userId:', userId);
    console.log('search:', search);
    
    let query = {};
    
    // Add userId filter if provided
    if (userId) {
      query.user = userId;
    }
    
    // If search is provided, build search query
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive
      
      // Find users matching the search by name only
      const matchingUsers = await User.find({
        fullName: searchRegex
      }).select('_id');
      
      const userIds = matchingUsers.map(u => u._id);
      console.log(`Search term: "${searchTerm}"`);
      console.log(`Users found: ${userIds.length}`);
      
      // Search only by linked user name
      if (query.user) {
        const userFilter = query.user;
        delete query.user;
        query.$and = [
          { user: userFilter },
          { user: { $in: userIds } }
        ];
      } else {
        query.user = { $in: userIds };
      }
      
      console.log('Query with search:', JSON.stringify(query, null, 2));
    } else {
      console.log('No search term, fetching all complaints with userId filter:', userId ? 'yes' : 'no');
    }
    
    // Fetch complaints with populated user
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email role');
    
    console.log(`Total complaints found: ${complaints.length}`);
    
    // Transform complaints to ensure user data is always present
    const transformedComplaints = complaints.map(complaint => {
      let comp = complaint.toObject ? complaint.toObject() : complaint;
      
      // Handle missing or invalid linked user data
      if (!comp.user) {
        comp.user = {
          _id: null,
          fullName: comp.userName || 'Unknown User',
          email: comp.userEmail || 'N/A',
          role: comp.userRole || 'N/A'
        };
      } else {
        // Ensure all required fields exist
        if (!comp.user.fullName) comp.user.fullName = comp.userName || 'Unknown User';
        if (!comp.user.email) comp.user.email = comp.userEmail || 'N/A';
        if (!comp.user.role) comp.user.role = comp.userRole || 'N/A';
      }
      
      return comp;
    });
    
    console.log('=== END COMPLAINT REQUEST ===\n');
    
    res.status(200).json({ success: true, complaints: transformedComplaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching complaints' });
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
      return res.status(404).json({ success: false, message: 'Complaint not found' });
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
    ).populate('user', 'fullName email role');

    // Send email to the user who submitted the complaint
    try {
      const user = await User.findById(complaint.user._id || complaint.user);
      if (user && user.email) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Response to your complaint: ${complaint.subject}`,
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

    res.status(200).json({ success: true, message: 'Response saved', complaint, emailStatus: 'sent' });
  } catch (error) {
    console.error('Error responding to complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while responding to complaint' });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Reopened'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'fullName email role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, message: 'Complaint status updated', complaint });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ success: false, message: 'Server error while updating complaint status' });
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting complaint' });
  }
};

// @desc    Resolve a complaint (for users to mark their own complaints as resolved)
// @route   PATCH /api/complaints/:id/resolve
export const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from auth middleware

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if the user owns this complaint
    if (complaint.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only resolve your own complaints' });
    }

    // Update status to resolved
    complaint.status = 'Resolved';
    await complaint.save();

    res.status(200).json({ success: true, message: 'Complaint resolved successfully', complaint });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while resolving complaint' });
  }
};

// @desc    Reopen a complaint (for users to reopen resolved complaints)
// @route   PATCH /api/complaints/:id/reopen
export const reopenComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get userId from auth middleware

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check if the user owns this complaint
    if (complaint.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only reopen your own complaints' });
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
      status: 'Reopened'
    });

    // Update status to reopened so admin dashboards can count reopened complaints correctly
    complaint.status = 'Reopened';
    await complaint.save();

    // Send email notification to admin about reopened complaint
    try {
      const user = await User.findById(complaint.user);
      const mailOptions = {
        from: user ? user.email : process.env.EMAIL_USER,
        replyTo: user ? user.email : process.env.EMAIL_USER,
        to: 'bloodbankteam2023@gmail.com',
        subject: `🚨 COMPLAINT REOPENED: ${complaint.subject}`,
        text: `Hello Admin,

A complaint has been REOPENED by ${user ? user.fullName : 'a user'} and requires your immediate attention.

Category: ${complaint.category}
Subject: ${complaint.subject}
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

    res.status(200).json({ success: true, message: 'Complaint reopened successfully', complaint });
  } catch (error) {
    console.error('Error reopening complaint:', error);
    res.status(500).json({ success: false, message: 'Server error while reopening complaint' });
  }
};

// @desc    Debug endpoint - Check complaint data structure
// @route   GET /api/complaints/debug/status
export const debugComplaints = async (req, res) => {
  try {
    console.log('\n=== DEBUG: Checking complaint data ===');
    
    // Get a few complaints without populate to see raw data
    const rawComplaints = await Complaint.find({}).limit(5);
    console.log('Raw complaints (first 5):');
    rawComplaints.forEach((c, i) => {
      console.log(`  ${i+1}. ID: ${c._id}, User field: ${c.user}, Type: ${typeof c.user}`);
    });
    
    // Get complaints with populate
    const populatedComplaints = await Complaint.find({}).populate('user', 'fullName email role').limit(5);
    console.log('\nPopulated complaints (first 5):');
    populatedComplaints.forEach((c, i) => {
      const comp = c.toObject();
      console.log(`  ${i+1}. ID: ${comp._id}`);
      if (comp.user) {
        console.log(`     User: ${comp.user.fullName || 'N/A'}, Email: ${comp.user.email || 'N/A'}, Role: ${comp.user.role || 'N/A'}`);
      } else {
        console.log(`     User: NULL`);
      }
    });
    
    // Count complaints with null user references
    const nullUserComplaints = await Complaint.find({ user: null }).countDocuments();
    console.log(`\nComplaints with null user: ${nullUserComplaints}`);
    
    console.log('=== END DEBUG ===\n');
    
    res.status(200).json({ 
      success: true, 
      debug: {
        totalComplaints: await Complaint.countDocuments(),
        nullUserCount: nullUserComplaints,
        sampleData: populatedComplaints.map(c => ({
          id: c._id,
          user: c.user ? { fullName: c.user.fullName, role: c.user.role } : null,
          subject: c.subject
        }))
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
};
