const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);