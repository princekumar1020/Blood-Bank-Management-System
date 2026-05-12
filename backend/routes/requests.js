import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import Request from '../models/Request.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET api/requests/history
// @desc    Get all blood requests history (No Auth Required)
// @access  Public
router.get('/history', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests/add
// @desc    Create a new blood request (No Auth Required)
// @access  Public
router.post('/add', async (req, res) => {
  const { bloodGroup, units, reason } = req.body;
  try {
    const newRequest = new Request({
      bloodGroup,
      units,
      reason
    });
    await newRequest.save();
    res.status(201).json({ message: "Blood Request Saved Successfully! ✅", request: newRequest });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: "Error saving request", error: err.message });
  }
});

// @route   GET api/requests
// @desc    Get all blood requests
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const requests = await BloodRequest.find().populate('recipient', 'name email').sort({ createdAt: -1 });
    const formattedRequests = requests.map((request) => ({
      ...request.toObject(),
      requester: request.recipient,
    }));
    res.json(formattedRequests);
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
      recipient: req.user.id,
      requestFor: 'self',
      status: 'pending'
    });

    let request = await newRequest.save();
    request = await request.populate('recipient', 'name email');
    const responseRequest = { ...request.toObject(), requester: request.recipient };
    res.status(201).json(responseRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
