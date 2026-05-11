const express = require('express');
const router = express.Router();
const DonationRequest = require('../models/DonationRequest');
const authMiddleware = require('../middleware/authMiddleware');

// Get all requests for a donor
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const donorId = req.user._id;
    console.log('Fetching requests for donor ID:', donorId);
    const requests = await DonationRequest.find({ donor: donorId }).sort({ createdAt: -1 });
    console.log('Found requests:', requests.length);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error });
  }
});

// Create new request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { bloodType, quantity, type, location, adminNotes, status } = req.body;
    const donorId = req.user._id;

    const newRequest = new DonationRequest({
      donor: donorId,
      bloodType,
      quantity: quantity || 450,
      type: type || 'Donation',
      location: location || 'Default Center',
      adminNotes: adminNotes || '',
      status: status || 'Pending'
    });

    await newRequest.save();
    console.log('Successfully saved to MongoDB Atlas:', newRequest._id);
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// Admin: Update request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentTime, location, adminNotes } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedRequest = await DonationRequest.findByIdAndUpdate(
      id,
      { status, appointmentTime, location, adminNotes },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Donation request not found' });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error });
  }
});

// Delete a donation request
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const donorId = req.user._id;

    console.log('Attempting to delete request:', id, 'for donor:', donorId);

    const request = await DonationRequest.findOne({ _id: id, donor: donorId });

    if (!request) {
      console.log('Request not found or unauthorized:', id);
      return res.status(404).json({ message: 'Request not found or unauthorized' });
    }

    if (request.status !== 'Pending') {
      console.log('Cannot delete non-pending request. Status:', request.status);
      return res.status(400).json({ message: 'Only pending requests can be deleted' });
    }

    await DonationRequest.findByIdAndDelete(id);
    console.log('Successfully deleted request:', id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
});

module.exports = router;