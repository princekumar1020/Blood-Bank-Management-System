const express = require('express');
const router = express.Router();
const recipientController = require('../controllers/recipientController');

router.post('/request', recipientController.createRequest);
router.get('/requests', recipientController.getRequests);
router.put('/request/:id', recipientController.updateRequest);
router.delete('/request/:id', recipientController.deleteRequest);
// Complete a blood request (mark as completed and decrease inventory)
router.post('/request/:id/complete', recipientController.completeRequest);

module.exports = router;