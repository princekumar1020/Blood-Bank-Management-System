import express from 'express';
import { createBloodRequest, getRequestsHistory } from '../controllers/requestController.js'; 

const router = express.Router();

router.post('/add', createBloodRequest);
router.get('/history', getRequestsHistory); // 👈 YE LINE HONI CHAHIYE

export default router;