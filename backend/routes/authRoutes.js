const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

// ── POST /auth/signup ──────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, universityName } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      email,
      password: hashed,
      universityName,
      emailOTP: otp,
      emailOTPExpiry: otpExpiry
    });

    await sendEmail({
      to: email,
      subject: 'Verify your Class2.0 account',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7c3aed">Welcome to Class2.0!</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing:8px;color:#1a0033">${otp}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
        </div>`
    });

    res.status(201).json({ message: 'Account created. Check your email for the OTP.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// ── POST /auth/verify-email ────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Already verified.' });

    if (user.emailOTP !== otp)
      return res.status(400).json({ error: 'Invalid OTP.' });

    if (new Date() > user.emailOTPExpiry)
      return res.status(400).json({ error: 'OTP expired. Please sign up again.' });

    user.isVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, email: user.email, universityName: user.universityName });
  } catch (err) {
    res.status(500).json({ error: 'Server error during verification.' });
  }
});

// ── POST /auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    if (!user.password)
      return res.status(400).json({ error: 'This account uses Google login.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    if (!user.isVerified)
      return res.status(403).json({ error: 'Please verify your email first.' });

    const token = generateToken(user._id);
    res.json({ token, email: user.email, universityName: user.universityName });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── POST /auth/forgot-password ────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password.html?token=${token}&email=${email}`;

    await sendEmail({
      to: email,
      subject: 'Class2.0 — Password Reset',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7c3aed">Reset your password</h2>
          <p>Click the button below. This link expires in <strong>30 minutes</strong>.</p>
          <a href="${resetURL}" style="display:inline-block;padding:12px 28px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="margin-top:16px;font-size:0.85rem;color:#666">If you didn't request this, ignore this email.</p>
        </div>`
    });

    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /auth/reset-password ─────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user)
      return res.status(400).json({ error: 'Invalid or expired reset token.' });

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /auth/request-delete ─────────────────────────────
// Protected: requires valid JWT. Verifies password, then sends OTP.
router.post('/request-delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Not authorized.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.deleteAccountOTP = otp;
    user.deleteAccountOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Class2.0 — Account Deletion Request',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#dc2626">⚠️ Account Deletion Request</h2>
          <p>We received a request to <strong>permanently delete</strong> your Class2.0 account.</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing:8px;color:#7c3aed">${otp}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="color:#666;font-size:0.85rem">If you did not request this, change your password immediately.</p>
        </div>`
    });

    res.json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /auth/confirm-delete ─────────────────────────────
// Verifies OTP + "DELETE" confirmation, then wipes account + all data.
router.post('/confirm-delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ error: 'Not authorized.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { otp, confirmText } = req.body;

    if (!otp || !confirmText)
      return res.status(400).json({ error: 'OTP and confirmation text are required.' });

    if (confirmText !== 'DELETE')
      return res.status(400).json({ error: 'You must type DELETE (case-sensitive).' });

    if (user.deleteAccountOTP !== otp)
      return res.status(400).json({ error: 'Invalid verification code.' });

    if (new Date() > user.deleteAccountOTPExpiry)
      return res.status(400).json({ error: 'Verification code expired. Please start again.' });

    const userId = user._id;

    // ── Cascade delete all user data ──
    const Teacher = require('../models/Teacher');
    const Room    = require('../models/Room');
    const Class   = require('../models/Class');

    await Promise.all([
      Teacher.deleteMany({ userId }),
      Room.deleteMany({ userId }),
      Class.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({ message: 'Account permanently deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;