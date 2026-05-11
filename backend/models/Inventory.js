const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
    unique: true
  },
  availableUnits: {
    type: Number,
    default: 0
  },
  expiringUnits: {
    type: Number,
    default: 0
  },
  expiryDetails: [
    {
      units: Number,
      expiryDate: Date
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', InventorySchema);