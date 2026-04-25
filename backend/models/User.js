const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    // Not required — Google OAuth users won't have one
  },
  universityName: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: String,
  emailOTPExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  googleId: String,  // for future Google OAuth
  deleteAccountOTP: String,
  deleteAccountOTPExpiry: Date
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
