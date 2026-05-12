import express from 'express';
import { getRequests, getRecipients, getRequest, approveRequest, rejectRequest, addRequest, updateRequest, editRecipient } from '../controllers/recipientManagementController.js';

const router = express.Router();
router.get('/list', getRequests);
// New: List all recipients (users with role 'recipient')
router.get('/recipients', getRecipients);
router.get('/view/:id', getRequest);
router.post('/approve/:id', approveRequest);
router.post('/reject/:id', rejectRequest);
router.post('/add', addRequest);
router.put('/update/:id', updateRequest);
// New: Edit recipient details
router.put('/edit/:id', editRecipient);
export default router;
