<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/complaints
// @desc    Submit a new complaint
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { category, subject, description, location } = req.body;
        const userId = req.user._id || req.user.id;

        const newComplaint = new Complaint({
            user: userId,
            category,
            subject,
            description,
            location
        });

        await newComplaint.save();
        res.status(201).json({ success: true, complaint: newComplaint });
    } catch (err) {
        console.error('Error submitting complaint:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// @route   GET api/complaints/my-complaints
// @desc    Get current user's complaints
// @access  Private
router.get('/my-complaints', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
=======
import express from 'express';
import {
  getComplaints,
  createComplaint,
  respondToComplaint,
  updateComplaintStatus,
  resolveComplaint,
  reopenComplaint,
  deleteComplaint
} from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', createComplaint);
router.patch('/:id/respond', respondToComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/resolve', resolveComplaint);
router.patch('/:id/reopen', reopenComplaint);
router.delete('/:id', deleteComplaint);

export default router;
>>>>>>> origin/priyanshu
