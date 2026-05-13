import express from 'express';
import upload from '../middleware/upload.js';
import authController from '../controllers/authController.js';

const router = express.Router();
// Get user profile
router.get('/profile', authController.getProfile);

// Update user profile (with optional photoUrl)
router.put('/profile/:id', authController.updateProfile);

// Upload profile picture
router.post('/profile/:id/photo', upload.single('photo'), authController.uploadPhoto);


// Signup and login
router.post('/signup', authController.signup);
router.post('/login', authController.login);
export default router;
