const express = require('express');
const router = express.Router();
const recipientManagementController = require('../controllers/recipientManagementController');



router.get('/list', recipientManagementController.getRequests);
// New: List all recipients (users with role 'recipient')
router.get('/recipients', recipientManagementController.getRecipients);
router.get('/view/:id', recipientManagementController.getRequest);
router.post('/approve/:id', recipientManagementController.approveRequest);
router.post('/add', recipientManagementController.addRequest);
router.put('/update/:id', recipientManagementController.updateRequest);
// New: Edit recipient details
router.put('/edit/:id', recipientManagementController.editRecipient);

module.exports = router;
