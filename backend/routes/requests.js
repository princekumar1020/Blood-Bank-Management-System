const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/requests
// @desc    Get all blood requests
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Populate the requester's name and email from the User model
    const requests = await BloodRequest.find().populate('requester', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests
// @desc    Create a blood request
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { patientName, bloodGroup, units } = req.body;
  try {
    const newRequest = new BloodRequest({
      patientName,
      bloodGroup,
      units,
      requester: req.user.id, // Get user ID from the authenticated token
    });

    let request = await newRequest.save();
    // Populate the requester field before sending the response to be consistent with the GET route
    request = await request.populate('requester', 'name email');
    res.status(201).json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;