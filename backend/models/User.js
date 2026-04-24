const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  role: { type: String, enum: ['donor', 'recipient', 'admin'], required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true },
  age: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        if (this.role === 'donor') {
          return v >= 18 && v <= 65;
        }
        return true; // No general age restriction for recipients just from schema, but let's say must be realistic.
      },
      message: 'Donors must be between 18 and 65 years old.'
    }
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  mobileNo: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Please fill a valid 10-digit mobile number']
  },
  password: { 
    type: String, 
    required: true 
  },
  photoUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
