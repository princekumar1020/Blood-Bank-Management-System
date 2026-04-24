const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  // Add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
