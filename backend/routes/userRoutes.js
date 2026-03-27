const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Update profile (mobile and profile pic)
router.put('/profile', authMiddleware, upload.single('profilePic'), async (req, res) => {
  try {
    const { mobile } = req.body;
    let profilePicString;

    // Log the received request
    console.log('Update profile:', { 
      userId: req.user._id, 
      mobile, 
      hasFile: !!req.file 
    });

    // Handle file upload
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      profilePicString = `data:${req.file.mimetype};base64,${b64}`;
    }

    // Build update object
    const updateData = {};
    if (mobile) updateData.mobile = mobile;
    if (profilePicString) updateData.profilePic = profilePicString;

    // Perform update
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile updated successfully in MongoDB');
    res.json(updatedUser);
  } catch (error) {
    console.error('SERVER ERROR UPDATING PROFILE:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Switch role (donor <-> recipient)
router.put('/switch-role', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const newRole = user.role === 'donor' ? 'recipient' : 'donor';
    user.role = newRole;
    await user.save();
    res.json({ message: `Role switched to ${newRole}`, role: newRole });
  } catch (error) {
    res.status(500).json({ message: 'Error switching role', error });
  }
});

module.exports = router;
