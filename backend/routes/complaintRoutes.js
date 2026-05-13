import express from 'express';
import { createComplaint, getComplaints, respondToComplaint, updateComplaintStatus, deleteComplaint, resolveComplaint, reopenComplaint } from '../controllers/complaintController.js';

const router = express.Router();

router.post('/', createComplaint);
router.get('/', getComplaints);
router.patch('/:id/respond', respondToComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/resolve', resolveComplaint);
router.patch('/:id/reopen', reopenComplaint);
router.delete('/:id', deleteComplaint);

export default router;
