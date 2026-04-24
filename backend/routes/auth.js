

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');


// Get user profile
router.get('/profile', authController.getProfile);

// Update user profile (with optional photoUrl)
router.put('/profile/:id', authController.updateProfile);

// Upload profile picture
router.post('/profile/:id/photo', upload.single('photo'), authController.uploadPhoto);


// Signup and login
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;

module.exports = router;
