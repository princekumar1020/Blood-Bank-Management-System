import express from 'express';
import donorManagementController from '../controllers/donorManagementController.js';

const router = express.Router();
router.get('/list', donorManagementController.getDonors);
router.post('/add', donorManagementController.addDonor);
router.put('/edit/:id', donorManagementController.editDonor);
router.get('/view/:id', donorManagementController.getDonor);
export default router;
