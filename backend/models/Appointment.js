import mongoose from 'mongoose';
const AppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'approved', 'completed', 'cancelled'], default: 'scheduled' },
  bloodGroup: { type: String, required: true },
  notes: { type: String },
  tokenNo: { type: String },
  timeSlot: { type: String },
}, { timestamps: true });
export default mongoose.model('Appointment', AppointmentSchema);