<<<<<<< HEAD
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
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
        enum: ['Pending', 'Resolved', 'In Progress'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
=======
import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'service', 'staff', 'facility', 'other'],
    required: true,
    default: 'general'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'reopened'],
    default: 'pending'
  },
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
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'reopened'],
      default: 'pending'
    }
  }]
}, { timestamps: true });

export default mongoose.model('Complaint', ComplaintSchema);
>>>>>>> origin/priyanshu
