import express from 'express';
import recipientController from '../controllers/recipientController.js';

const router = express.Router();
router.post('/request', recipientController.createRequest);
router.get('/requests', recipientController.getRequests);
router.put('/request/:id', recipientController.updateRequest);
router.delete('/request/:id', recipientController.deleteRequest);
// Complete a blood request (mark as completed and decrease inventory)
router.post('/request/:id/complete', recipientController.completeRequest);
export default router;
