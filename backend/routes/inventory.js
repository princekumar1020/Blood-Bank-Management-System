import express from 'express';
import inventoryController from '../controllers/inventoryController.js';

const router = express.Router();
router.get('/summary', inventoryController.getInventorySummary);
router.post('/add', inventoryController.addStock);
export default router;
