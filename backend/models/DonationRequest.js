const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: true, // in ml
    default: 450
  },
  type: {
    type: String,
    enum: ['Donation', 'Requirement'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  appointmentTime: {
    type: Date
  },
  location: {
    type: String
  },
  adminNotes: {
    type: String
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
