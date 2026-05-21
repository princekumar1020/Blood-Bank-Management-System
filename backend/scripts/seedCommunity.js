import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import CommunityPost from '../models/CommunityPost.js';

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost/bloodbank';

const run = async () => {
  await mongoose.connect(MONGO);
  console.log('Connected to DB for seeding');

  // create two users
  const pwd = await bcrypt.hash('password123', 10);
  const u1 = await User.findOneAndUpdate(
    { email: 'seed_donor@example.com' },
    {
      fullName: 'Seed Donor',
      role: 'donor',
      bloodGroup: 'O+',
      gender: 'Male',
      age: 30,
      mobileNo: '9999999999',
      password: pwd,
      email: 'seed_donor@example.com'
    },
    { upsert: true, returnDocument: 'after' }
  );
  const u2 = await User.findOneAndUpdate(
    { email: 'seed_recipient@example.com' },
    {
      fullName: 'Seed Recipient',
      role: 'recipient',
      bloodGroup: 'A-',
      gender: 'Female',
      age: 28,
      mobileNo: '8888888888',
      password: pwd,
      email: 'seed_recipient@example.com'
    },
    { upsert: true, returnDocument: 'after' }
  );

  // create posts
  await CommunityPost.create([
    { author: u1._id, authorName: u1.fullName, authorRole: u1.role, bloodGroup: u1.bloodGroup, category: 'Donation Camps', content: 'Donor here, joined camp today', imageUrl: '' },
    { author: u2._id, authorName: u2.fullName, authorRole: u2.role, bloodGroup: u2.bloodGroup, category: 'Emergency Requests', content: 'Recipient needs O+ urgently', imageUrl: '' },
  ]);

  console.log('Seeding complete');
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
