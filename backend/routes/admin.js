import express from 'express';
import {
  adminRejectAppointment,
  getAllAppointments,
  adminApproveAppointment,
  adminCompleteAppointment,
  adminEditAppointment,
  adminDeleteAppointment,
  sendEmergencyAlert,
  getAdminDashboard
} from '../controllers/adminController.js';
import { getRequests, getRequest, approveRequest, rejectRequest, updateRequest, addRequest } from '../controllers/recipientManagementController.js';

const router = express.Router();
console.log('Admin routes loaded');
// Dashboard
router.get('/dashboard', (req, res, next) => {
  console.log('Admin dashboard route hit');
  next();
}, getAdminDashboard);

// Emergency alerts for eligible donors
router.post('/alerts', sendEmergencyAlert);

// Admin Appointment Management
router.get('/appointments', getAllAppointments); // ?status=approved|scheduled|completed|cancelled
router.post('/appointments/:id/approve', adminApproveAppointment);
router.post('/appointments/:id/complete', adminCompleteAppointment);
// Reject/cancel appointment (admin)
router.post('/appointments/:id/reject', adminRejectAppointment);
router.put('/appointments/:id', adminEditAppointment);
router.delete('/appointments/:id', adminDeleteAppointment);


// Admin Blood Request Management
router.get('/requests', getRequests); // ?status=pending|completed|cancelled
router.get('/requests/:id', getRequest);
router.post('/requests/:id/approve', approveRequest);
router.post('/requests/:id/reject', rejectRequest);
router.put('/requests/:id', updateRequest);
router.post('/requests', addRequest);
export default router;
