import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: false
  },
  userRole: {
    type: String,
    enum: ['donor', 'recipient', 'admin', 'unknown'],
    required: false
  },
  userEmail: {
    type: String,
    required: false
  },
  subject: {
    type: String,
    required: false,
    trim: true
  },
  message: {
    type: String,
    required: false,
    trim: true
  },
  category: {
    type: String,
    default: 'general',
    trim: true
  },
  adminResponse: {
    type: String,
    default: ''
  },
  responseHistory: [
    {
      message: {
        type: String,
        required: true,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resolvedByUser: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'In Review', 'Responded', 'Closed', 'Reopened'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', ComplaintSchema);
