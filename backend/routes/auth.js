const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', async (req, res) => {
  const { name, email, password, userType, bloodGroup, phoneNumber, age } = req.body;
  try {
    // See if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    user = new User({
      name,
      email,
      password,
      userType,
      bloodGroup,
      phoneNumber,
      age,
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Return jsonwebtoken so the user is logged in right away
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'super_secret_fallback_key',
      { expiresIn: 3600 }, // expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // See if user exists
    let user = await User.findOne({ email });

    console.log(`[LOGIN ATTEMPT] Email: ${email} | Role: ${userType}`);

    if (!user) {
      console.log(`❌ Failed: Email not found in database.`);
      return res.status(400).json({ message: 'Email not found. Please sign up first.' });
    }

    if (user.userType !== userType) {
      console.log(`❌ Failed: Role mismatch. User is actually a ${user.userType}.`);
      return res.status(400).json({ message: `Account exists, but registered as a '${user.userType}'. Please switch the role toggle.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`❌ Failed: Passwords do not match.`);
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    console.log(`✅ Success: Logged in successfully!`);

    // Return jsonwebtoken
    const payload = {
      user: { id: user.id, name: user.name, userType: user.userType },
    };

    jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_fallback_key', { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, userType: user.userType },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;