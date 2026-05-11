const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/summary', inventoryController.getInventorySummary);
router.post('/add', inventoryController.addStock);

module.exports = router;
