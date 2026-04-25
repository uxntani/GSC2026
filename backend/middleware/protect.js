const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized. No token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) return res.status(401).json({ error: 'User not found.' });
    if (!req.user.isVerified) return res.status(403).json({ error: 'Email not verified.' });

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired.' });
  }
}

module.exports = protect;