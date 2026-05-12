import express from 'express';
import {
  getComplaints,
  createComplaint,
  respondToComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', createComplaint);
router.patch('/:id/respond', respondToComplaint);
router.patch('/:id/status', updateComplaintStatus);
router.delete('/:id', deleteComplaint);

export default router;
