const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  students: { type: Number, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' }
});

module.exports = mongoose.model('Class', classSchema);