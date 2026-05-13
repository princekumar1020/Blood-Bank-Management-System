import express from 'express';
import { 
  createBloodRequest, 
  getRequestsHistory,
  updateBloodRequest, // 👈 Naya Add Kiya
  deleteBloodRequest  // 👈 Naya Add Kiya
} from '../controllers/requestController.js'; 

const router = express.Router();

router.post('/add', createBloodRequest);
router.get('/history', getRequestsHistory); 

// 🔴 Edit aur Delete ke naye routes 🔴
router.put('/:id', updateBloodRequest);
router.delete('/:id', deleteBloodRequest);

export default router;