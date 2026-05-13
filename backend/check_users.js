import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bloodbank');
    console.log('Connected to DB');
    
    const users = await User.find({}, 'email role fullName');
    console.log('Current Users in Database:');
    users.forEach(u => console.log(`- ${u.email} (${u.role}) [${u.fullName}]`));
    
    const admin = await User.findOne({ email: 'admin123@gmail.com' });
    if (admin) {
      console.log('Admin found:', admin.email, 'Role:', admin.role);
    } else {
      console.log('Admin user (admin123@gmail.com) NOT FOUND in DB');
    }

    const raghav = await User.findOne({ email: /raghav/i });
    if (raghav) {
      console.log('Raghav found:', raghav.email, 'Role:', raghav.role);
    } else {
      console.log('Raghav user NOT FOUND in DB');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
