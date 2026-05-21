import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  // Tumhare HEAD wale original names
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  userEmail: {
    type: String,
    default: ''
  },
  userRole: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Reopened'],
    default: 'Pending'
  },
  // Priyanshu ke advanced features
  adminResponse: {
    type: String,
    default: null
  },
  responseHistory: [{
    response: String,
    respondedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String
    }
  }]
}, { timestamps: true });

// YAHAN FIX HAI: `export default` use kiya hai `module.exports` ki jagah
export default mongoose.model('Complaint', ComplaintSchema);