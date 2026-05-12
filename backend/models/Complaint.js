import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['donor', 'recipient', 'admin'],
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  adminResponse: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Responded', 'Closed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', ComplaintSchema);
