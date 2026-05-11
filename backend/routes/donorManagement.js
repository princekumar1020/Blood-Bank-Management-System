const express = require('express');
const router = express.Router();
const donorManagementController = require('../controllers/donorManagementController');

router.get('/list', donorManagementController.getDonors);
router.post('/add', donorManagementController.addDonor);
router.put('/edit/:id', donorManagementController.editDonor);
router.get('/view/:id', donorManagementController.getDonor);

module.exports = router;
