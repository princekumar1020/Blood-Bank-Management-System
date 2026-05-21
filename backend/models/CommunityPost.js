import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const CommunityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
  bloodGroup: { type: String, default: '' },
  category: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema]
}, { timestamps: true });

export default mongoose.model('CommunityPost', CommunityPostSchema);
