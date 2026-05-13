import mongoose from 'mongoose';
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
export default mongoose.model('Inventory', InventorySchema);