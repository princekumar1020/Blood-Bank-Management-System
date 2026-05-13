import express from 'express';
import donorController from '../controllers/donorController.js';

const router = express.Router();
router.delete('/appointment/:id', donorController.deleteAppointment);

router.put('/appointment/:id', donorController.editAppointment);

router.post('/appointment/:id/approve', donorController.approveAppointment);

router.post('/appointment/:id/complete', donorController.completeAppointment);

router.get('/latest-appointment', donorController.getLatestAppointment);

router.get('/dashboard', donorController.getDashboard);

router.post('/appointment', donorController.scheduleAppointment);

router.get('/appointments', donorController.getAppointments);
export default router;
