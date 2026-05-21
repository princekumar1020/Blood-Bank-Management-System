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
    
    // Try to find the legacy test admin email and update it to the active team address.
    let admin = await User.findOne({ email: 'admin123@gmail.com' });
    if (admin) {
      console.log('Admin found:', admin.email, 'Role:', admin.role);
      if (admin.email !== 'bloodbankteam2023@gmail.com') {
        admin.email = 'bloodbankteam2023@gmail.com';
        await admin.save();
        console.log('Updated admin email to bloodbankteam2023@gmail.com');
      } else {
        console.log('Admin email already set to bloodbankteam2023@gmail.com');
      }
    } else {
      console.log('Admin user (admin123@gmail.com) NOT FOUND in DB');
      // If that specific admin isn't present, update the first admin user found.
      const anyAdmin = await User.findOne({ role: 'admin' });
      if (anyAdmin) {
        console.log('Updating first admin', anyAdmin.email, '-> bloodbankteam2023@gmail.com');
        anyAdmin.email = 'bloodbankteam2023@gmail.com';
        await anyAdmin.save();
        console.log('Updated admin email to bloodbankteam2023@gmail.com');
      } else {
        console.log('No admin user found to update.');
      }
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
