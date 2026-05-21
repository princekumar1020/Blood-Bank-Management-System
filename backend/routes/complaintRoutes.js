import express from 'express';
import { createComplaint, getComplaints, respondToComplaint, updateComplaintStatus, deleteComplaint, resolveComplaint, reopenComplaint, debugComplaints } from '../controllers/complaintController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createComplaint);
router.get('/debug/status', debugComplaints);
router.get('/', getComplaints);
router.patch('/:id/respond', authMiddleware, respondToComplaint);
router.patch('/:id/status', authMiddleware, updateComplaintStatus);
router.patch('/:id/resolve', authMiddleware, resolveComplaint);
router.patch('/:id/reopen', authMiddleware, reopenComplaint);
router.delete('/:id', authMiddleware, deleteComplaint);

export default router;
