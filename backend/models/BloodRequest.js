const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  units: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'pending', // e.g., pending, fulfilled, cancelled
  },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);