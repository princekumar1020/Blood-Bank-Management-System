// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getProfile = async (req, res) => {
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

exports.updateProfile = async (req, res) => {
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

exports.uploadPhoto = async (req, res) => {
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

exports.signup = async (req, res) => {
  try {
    const { fullName, role, gender, bloodGroup, age, email, mobileNo, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });
    // ...validation logic...
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
    console.error("Signup error: ", err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    console.log('Login attempt:', { email, password });
    // If admin login and not found, create the admin on the fly
    if (!user && email === 'admin123@gmail.com') {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      user = new User({
        fullName: 'Permanent Admin',
        role: 'admin',
        gender: 'Other',
        bloodGroup: 'O+',
        age: 30,
        email: 'admin123@gmail.com',
        mobileNo: '0000000000',
        password: hashedPassword
      });
      await user.save();
    }
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ error: 'User does not exist' });
    }
    console.log('User found:', { email: user.email, role: user.role, hash: user.password });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ error: 'Invalid password' });
    }
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role, userId: user.id });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};
