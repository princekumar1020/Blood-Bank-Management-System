const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// Admin Appointment Management
router.get('/appointments', adminController.getAllAppointments); // ?status=approved|scheduled|completed|cancelled
router.post('/appointments/:id/approve', adminController.adminApproveAppointment);
router.post('/appointments/:id/complete', adminController.adminCompleteAppointment);
// Reject/cancel appointment (admin)
router.post('/appointments/:id/reject', adminController.adminRejectAppointment);
router.put('/appointments/:id', adminController.adminEditAppointment);
router.delete('/appointments/:id', adminController.adminDeleteAppointment);


// Admin Blood Request Management
const recipientManagementController = require('../controllers/recipientManagementController');
router.get('/requests', recipientManagementController.getRequests); // ?status=pending|completed|cancelled
router.get('/requests/:id', recipientManagementController.getRequest);
router.post('/requests/:id/approve', recipientManagementController.approveRequest);
router.put('/requests/:id', recipientManagementController.updateRequest);
router.post('/requests', recipientManagementController.addRequest);

module.exports = router;
