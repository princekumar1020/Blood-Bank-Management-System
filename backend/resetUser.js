import mongoose from 'mongoose';
import 'dotenv/config';
import User from './models/User.js';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bloodbank')
  .then(async () => {
    console.log('MongoDB connected');
    
    const restoredUser = new User({
      _id: new mongoose.Types.ObjectId('6a02f063787adee7f108958b'),
      fullName: 'Priyanshu',
      role: 'recipient',
      gender: 'Female',
      bloodGroup: 'AB-',
      age: 102,
      email: 'priyanshu2500.be23@chitkara.edu.in',
      mobileNo: '9876231117',
      password: '$2b$10$hVCo3lnzVeaRWIgrsMaV8OVRui2V9i9/qc9z3BxvMb9B9HN7iIYNS',
      photoUrl: '',
      createdAt: new Date('2026-05-12T09:18:27.282Z'),
      updatedAt: new Date('2026-05-12T12:52:46.823Z')
    });

    await restoredUser.save();
    console.log('User successfully restored!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
