const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestFor: {
    type: String,
    enum: ['self', 'family'],
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'fulfilled'],
    default: 'pending'
  },
  patientName: {
    type: String,
    required: true // Can be recipient name if self
  },
  reason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);