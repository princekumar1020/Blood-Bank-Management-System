import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, mobileNo, photoUrl } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.mobileNo = mobileNo || user.mobileNo;
    if (photoUrl) user.photoUrl = photoUrl;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.photoUrl = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ photoUrl: user.photoUrl });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, role, gender, bloodGroup, age, email, mobileNo, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }
    
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNo)) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    
    const ageNum = parseInt(age, 10);
    if (role === 'donor' && (ageNum < 18 || ageNum > 65)) {
      return res.status(400).json({ error: 'Donors must be between 18 and 65 years old.' });
    }
    
    user = new User({ fullName, role, gender, bloodGroup, age, email, mobileNo, password });
    console.log('Signup attempt:', { email, passwordBeforeHash: user.password });
    
    const validationError = user.validateSync();
    if (validationError) {
      return res.status(400).json({ error: validationError.message });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    console.log('Password after hash:', user.password);
    
    await user.save();
    
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, userId: user.id });
    });
  } catch (err) {
    console.error('Signup error: ', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });
    
    let user = await User.findOne({ email });
    
    if (!user && email === 'bloodbankteam2023@gmail.com') {
      console.log('Creating permanent admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      user = new User({
        fullName: 'Permanent Admin',
        role: 'admin',
        gender: 'Other',
        bloodGroup: 'O+',
        age: 30,
        email: 'bloodbankteam2023@gmail.com',
        mobileNo: '0000000000',
        password: hashedPassword
      });
      await user.save();
      console.log('Admin account created successfully');
    }
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ error: 'User does not exist' });
    }
    
    // --- Merged: Kept your detailed logging ---
    console.log('User found:', { email: user.email, role: user.role, hashLength: user.password ? user.password.length : 0 });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result for', email, ':', isMatch);
    
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT signing error:', err);
        throw err;
      }
      console.log('Login successful for:', email);
      res.json({ token, role: user.role, userId: user.id });
    });
  } catch (err) {
    console.error('Login controller error:', err.message, err.stack);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

export default {
  getProfile,
  updateProfile,
  uploadPhoto,
  signup,
  login
};